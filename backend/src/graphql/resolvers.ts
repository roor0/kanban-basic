import { eq, asc } from "drizzle-orm";
import { db, boards, columns, tasks } from "../db";

export const resolvers = {
  Query: {
    boards: async () => {
      return await db.select().from(boards).orderBy(asc(boards.createdAt));
    },
    board: async (_: unknown, { id }: { id: string }) => {
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
  },

  Board: {
    columns: async (parent: { id: string }) => {
      return await db
        .select()
        .from(columns)
        .where(eq(columns.boardId, parent.id))
        .orderBy(asc(columns.position));
    },
  },

  Column: {
    tasks: async (parent: { id: string }) => {
      return await db
        .select()
        .from(tasks)
        .where(eq(tasks.columnId, parent.id))
        .orderBy(asc(tasks.position));
    },
  },

  Mutation: {
    createBoard: async (_: unknown, { title }: { title: string }) => {
      const result = await db.insert(boards).values({ title }).returning();
      return result[0];
    },
    updateBoard: async (_: unknown, { id, title }: { id: string; title: string }) => {
      const result = await db
        .update(boards)
        .set({ title, updatedAt: new Date() })
        .where(eq(boards.id, id))
        .returning();
      return result[0];
    },
    deleteBoard: async (_: unknown, { id }: { id: string }) => {
      await db.delete(boards).where(eq(boards.id, id));
      return true;
    },

    createColumn: async (
      _: unknown,
      { boardId, title, position }: { boardId: string; title: string; position?: number }
    ) => {
      const existingColumns = await db
        .select()
        .from(columns)
        .where(eq(columns.boardId, boardId));
      const pos = position ?? existingColumns.length;
      const result = await db
        .insert(columns)
        .values({ boardId, title, position: pos })
        .returning();
      return result[0];
    },
    updateColumn: async (
      _: unknown,
      { id, title, position }: { id: string; title?: string; position?: number }
    ) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (title !== undefined) updates.title = title;
      if (position !== undefined) updates.position = position;
      const result = await db
        .update(columns)
        .set(updates)
        .where(eq(columns.id, id))
        .returning();
      return result[0];
    },
    deleteColumn: async (_: unknown, { id }: { id: string }) => {
      await db.delete(columns).where(eq(columns.id, id));
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
      const existingTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.columnId, columnId));
      const pos = position ?? existingTasks.length;
      const result = await db
        .insert(tasks)
        .values({ columnId, title, description, position: pos })
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
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
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
      await db.delete(tasks).where(eq(tasks.id, id));
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
