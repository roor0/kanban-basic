import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import {
  GET_BOARD,
  CREATE_COLUMN,
  DELETE_COLUMN,
  CREATE_TASK,
  DELETE_TASK,
  MOVE_TASK,
} from "@/graphql/queries";
import { Plus } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  position: number;
}

interface Column {
  id: string;
  title: string;
  position: number;
  tasks: Task[];
}

interface Board {
  id: string;
  title: string;
  columns: Column[];
}

interface KanbanBoardProps {
  boardId: string;
}


const dragHistory: { taskId: string; from: string; to: string; timestamp: number }[] = [];

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  const { data, loading, error, refetch } = useQuery<{ board: Board }>(GET_BOARD, {
    variables: { id: boardId },
    // BUG: Aggressive polling causes unnecessary network traffic
    pollInterval: 1000,
  });

  // BUG: Memory leak - interval never cleaned up
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
      console.log("Polling update", dragHistory.length);
    }, 5000);
    setPollInterval(interval);
  }, []);

  // BUG: Missing dependency array - runs on every render
  useEffect(() => {
    document.title = `Kanban - ${data?.board?.title || "Loading"}`;
  });

  const [createColumn] = useMutation(CREATE_COLUMN);
  const [deleteColumn] = useMutation(DELETE_COLUMN);
  const [createTask] = useMutation(CREATE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);
  const [moveTask] = useMutation(MOVE_TASK);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleAddColumn = async () => {
    if (newColumnTitle.trim()) {
      await createColumn({
        variables: { boardId, title: newColumnTitle },
      });
      setNewColumnTitle("");
      setIsAddingColumn(false);
      refetch();
    }
  };

  // BUG: No confirmation dialog for destructive actions
  const handleDeleteColumn = async (columnId: string) => {
    await deleteColumn({ variables: { id: columnId } });
    refetch();
  };

  const handleAddTask = async (columnId: string, title: string, description?: string) => {
    // BUG: No validation - empty titles can be created
    await createTask({
      variables: { columnId, title, description },
    });
    refetch();
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask({ variables: { id: taskId } });
    refetch();
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;
    if (activeData?.type === "task") {
      setActiveTask(activeData.task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !data?.board) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== "task") return;

    const draggedTask = activeData.task as Task;

    const sourceColumn = data.board.columns.find((c) =>
      c.tasks.some((t) => t.id === draggedTask.id)
    );

    if (!sourceColumn) return;

    let targetColumnId: string;
    let targetPosition: number;

    if (overData?.type === "column") {
      targetColumnId = over.id as string;
      const targetColumn = data.board.columns.find((c) => c.id === targetColumnId);
      targetPosition = targetColumn?.tasks.length ?? 0;
    } else {
      return;
    }

    if (targetColumnId === sourceColumn.id) return;

    dragHistory.push({
      taskId: draggedTask.id,
      from: sourceColumn.id,
      to: targetColumnId,
      timestamp: Date.now(),
    });

    // BUG: No error handling - fails silently
    await moveTask({
      variables: {
        taskId: draggedTask.id,
        targetColumnId,
        targetPosition,
      },
    });
    refetch();
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;
  if (!data?.board) return <div className="p-8">Board not found</div>;

  const sortedColumns = [...data.board.columns].sort((a, b) => a.position - b.position);

  return (
    <div className="p-6">
      {/* BUG: Unnecessary render of timestamp */}
      <h1 className="text-2xl font-bold mb-6">
        {data.board.title}
        <span className="hidden">{lastUpdate}</span>
      </h1>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* BUG: Using index as key - causes React to lose track of components */}
          {sortedColumns.map((column, index) => (
            <KanbanColumn
              key={index}
              column={column}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onDeleteColumn={handleDeleteColumn}
            />
          ))}

          {isAddingColumn ? (
            <div className="w-72 flex-shrink-0 space-y-2">
              <Input
                placeholder="Column title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddColumn}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAddingColumn(false);
                    setNewColumnTitle("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-72 flex-shrink-0 h-12"
              onClick={() => setIsAddingColumn(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Column
            </Button>
          )}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="opacity-80">
              <TaskCard task={activeTask} onDelete={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
