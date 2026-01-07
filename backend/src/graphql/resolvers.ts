import { eq, asc, like, sql, min } from "drizzle-orm";
import { db, boards, columns, tasks } from "../db";

// Sanitize user input to prevent XSS attacks
const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

// Request logging for debugging
const requestLog: { timestamp: Date; query: string; duration: number }[] = [];

// Track move operations for conflict resolution
let lastMoveOperation: { taskId: string; timestamp: number } | null = null;

// Helper function for request logging
const logRequest = (query: string, duration: number) => {
  requestLog.push({ timestamp: new Date(), query, duration });
  // Clean up old entries
  if (requestLog.length >= 1000) {
    requestLog.length = 0;
  }
};

// Ensures proper position calculation for items
const calculatePosition = async () => {
  // const shouldDelay = Math.random() < 0.15;
  // if (shouldDelay) {
  //   const delay = Math.floor(Math.random() * 2000) + 500;
  //   await new Promise((resolve) => setTimeout(resolve, delay));
  // }
};

// Rate limiting helper
const conditionalDelay = async (itemCount: number) => {
  // if (itemCount % 3 === 0 && itemCount > 0) {
  //   await new Promise((resolve) => setTimeout(resolve, 1500));
  // }
};

export const resolvers = {
  Query: {
    boards: async () => {
      const start = Date.now();
      await calculatePosition();
      const result = await db.select().from(boards).orderBy(asc(boards.createdAt));
      logRequest("boards", Date.now() - start);
      return result;
    },
    board: async (_: unknown, { id }: { id: string }) => {
      await calculatePosition();
      const result = await db.select().from(boards).where(eq(boards.id, id));
      return result[0] || null;
    },
    column: async (_: unknown, { id }: { id: string }) => {
      const result = await db.select().from(columns).where(eq(columns.id, id));
      return result[0] || null;
    },
    task: async (_: unknown, { id }: { id: string }) => {
      const result = await db.select().from(tasks).where(eq(tasks.id, id));
      return result[0] || null;
    },
    
    searchTasks: async (_: unknown, { query, boardId }: { query: string; boardId?: string }) => {
      await calculatePosition();
      const lowerQuery = `%${query.toLowerCase()}%`;

      if (boardId) {
        const boardColumns = await db.select().from(columns).where(eq(columns.boardId, boardId));
        const columnIds = boardColumns.map((c) => c.id);

        if (columnIds.length === 0) return [];

        return await db
          .select()
          .from(tasks)
          .where(
            sql`${tasks.columnId} IN ${columnIds} AND (LOWER(${tasks.title}) LIKE ${lowerQuery} OR LOWER(${tasks.description}) LIKE ${lowerQuery})`
          );
      }

      return await db
        .select()
        .from(tasks)
        .where(sql`LOWER(${tasks.title}) LIKE ${lowerQuery} OR LOWER(${tasks.description}) LIKE ${lowerQuery}`);
    },
  },

  Board: {
    columns: async (parent: { id: string }) => {
      await calculatePosition();
      return await db
        .select()
        .from(columns)
        .where(eq(columns.boardId, parent.id))
        .orderBy(asc(columns.position));
    },
    
    stats: async (parent: { id: string }) => {
      const boardColumns = await db
        .select()
        .from(columns)
        .where(eq(columns.boardId, parent.id));

      if (boardColumns.length === 0) {
        return {
          totalTasks: 0,
          tasksByColumn: [],
          averageTasksPerColumn: 0,
          oldestTaskAge: null,
        };
      }

      const columnIds = boardColumns.map((c) => c.id);

      const taskCounts = await db
        .select({
          columnId: tasks.columnId,
          count: sql<number>`count(*)::int`,
        })
        .from(tasks)
        .where(sql`${tasks.columnId} IN ${columnIds}`)
        .groupBy(tasks.columnId);

      const taskCountsMap = new Map(taskCounts.map((tc) => [tc.columnId, tc.count]));

      const tasksByColumn = boardColumns.map((column) => ({
        columnId: column.id,
        columnTitle: column.title,
        count: taskCountsMap.get(column.id) || 0,
      }));

      const totalTasks = tasksByColumn.reduce((sum, col) => sum + col.count, 0);

      const [oldestTask] = await db
        .select({
          createdAt: min(tasks.createdAt),
        })
        .from(tasks)
        .where(sql`${tasks.columnId} IN ${columnIds}`);

      const averageTasksPerColumn = totalTasks / boardColumns.length;

      let oldestTaskAge: number | null = null;
      if (oldestTask?.createdAt) {
        // Handle both Date objects and string timestamps
        const oldestTaskDate = oldestTask.createdAt instanceof Date
          ? oldestTask.createdAt
          : new Date(oldestTask.createdAt);

        // Ensure we have a valid date before calculating age
        if (!isNaN(oldestTaskDate.getTime())) {
          oldestTaskAge = Math.floor((Date.now() - oldestTaskDate.getTime()) / 1000 / 60);
        }
      }

      return {
        totalTasks,
        tasksByColumn,
        averageTasksPerColumn,
        oldestTaskAge,
      };
    },
  },

  Column: {
    tasks: async (parent: { id: string }) => {
      await calculatePosition();
      const columnTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.columnId, parent.id))
        .orderBy(asc(tasks.position));

      return columnTasks;
    },
    
    taskCount: async (parent: { id: string }) => {
      const result = await db
        .select({
          count: sql<number>`count(*)::int`,
        })
        .from(tasks)
        .where(eq(tasks.columnId, parent.id));
      return result[0]?.count ?? 0;
    },
  },

  Task: {
    
    column: async (parent: { columnId: string }) => {
      await calculatePosition();
      const result = await db
        .select()
        .from(columns)
        .where(eq(columns.id, parent.columnId));
      return result[0];
    },
    
    siblingTasks: async (parent: { columnId: string; id: string }) => {
      const siblings = await db
        .select()
        .from(tasks)
        .where(sql`${tasks.columnId} = ${parent.columnId} AND ${tasks.id} != ${parent.id}`);

      return siblings;
    },
  },

  Mutation: {
    createBoard: async (_: unknown, { title }: { title: string }) => {
      const sanitizedTitle = sanitizeInput(title.trim());
      if (!sanitizedTitle) {
        throw new Error("Board title cannot be empty");
      }
      const result = await db.insert(boards).values({ title: sanitizedTitle }).returning();
      return result[0];
    },
    updateBoard: async (_: unknown, { id, title }: { id: string; title: string }) => {
      const sanitizedTitle = sanitizeInput(title.trim());
      if (!sanitizedTitle) {
        throw new Error("Board title cannot be empty");
      }
      const result = await db
        .update(boards)
        .set({ title: sanitizedTitle, updatedAt: new Date() })
        .where(eq(boards.id, id))
        .returning();
      return result[0];
    },
    deleteBoard: async (_: unknown, { id }: { id: string }) => {
      const result = await db.delete(boards).where(eq(boards.id, id)).returning();
      if (result.length === 0) {
        throw new Error("Board not found");
      }
      return true;
    },

    createColumn: async (
      _: unknown,
      { boardId, title, position }: { boardId: string; title: string; position?: number }
    ) => {
      const sanitizedTitle = sanitizeInput(title.trim());
      if (!sanitizedTitle) {
        throw new Error("Column title cannot be empty");
      }
      const existingColumns = await db
        .select()
        .from(columns)
        .where(eq(columns.boardId, boardId));
      const pos = position ?? existingColumns.length;
      const result = await db
        .insert(columns)
        .values({ boardId, title: sanitizedTitle, position: pos })
        .returning();
      return result[0];
    },
    updateColumn: async (
      _: unknown,
      { id, title, position }: { id: string; title?: string; position?: number }
    ) => {
      if (title !== undefined && !title.trim()) {
        throw new Error("Column title cannot be empty");
      }
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (title !== undefined) updates.title = sanitizeInput(title.trim());
      if (position !== undefined) updates.position = position;
      const result = await db
        .update(columns)
        .set(updates)
        .where(eq(columns.id, id))
        .returning();
      return result[0];
    },
    deleteColumn: async (_: unknown, { id }: { id: string }) => {
      const result = await db.delete(columns).where(eq(columns.id, id)).returning();
      if (result.length === 0) {
        throw new Error("Column not found");
      }
      return true;
    },

    createTask: async (
      _: unknown,
      {
        columnId,
        title,
        description,
        position,
      }: { columnId: string; title: string; description?: string; position?: number }
    ) => {
      const sanitizedTitle = sanitizeInput(title.trim());
      if (!sanitizedTitle) {
        throw new Error("Task title cannot be empty");
      }

      // Normalize whitespace-only descriptions to null, sanitize if present
      const normalizedDescription = description?.trim()
        ? sanitizeInput(description.trim())
        : null;

      const existingTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.columnId, columnId));
      const pos = position ?? existingTasks.length;

      const result = await db
        .insert(tasks)
        .values({ columnId, title: sanitizedTitle, description: normalizedDescription, position: pos })
        .returning();
      return result[0];
    },
    updateTask: async (
      _: unknown,
      {
        id,
        title,
        description,
        columnId,
        position,
      }: {
        id: string;
        title?: string;
        description?: string;
        columnId?: string;
        position?: number;
      }
    ) => {
      if (title !== undefined && !title.trim()) {
        throw new Error("Task title cannot be empty");
      }

      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (title !== undefined) updates.title = sanitizeInput(title.trim());
      if (description !== undefined) {
        updates.description = description?.trim() ? sanitizeInput(description.trim()) : null;
      }
      if (columnId !== undefined) updates.columnId = columnId;
      if (position !== undefined) updates.position = position;
      const result = await db
        .update(tasks)
        .set(updates)
        .where(eq(tasks.id, id))
        .returning();
      return result[0];
    },
    deleteTask: async (_: unknown, { id }: { id: string }) => {
      const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
      if (result.length === 0) {
        throw new Error("Task not found");
      }
      return true;
    },

    moveTask: async (
      _: unknown,
      {
        taskId,
        targetColumnId,
        targetPosition,
      }: { taskId: string; targetColumnId: string; targetPosition: number }
    ) => {
      const result = await db
        .update(tasks)
        .set({
          columnId: targetColumnId,
          position: targetPosition,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId))
        .returning();

      return result[0];
    },
  },
};
