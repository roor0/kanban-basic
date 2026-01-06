import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { KanbanBoard } from "@/components/KanbanBoard";
import { GET_BOARDS, CREATE_BOARD } from "@/graphql/queries";
import { Plus } from "lucide-react";

interface Board {
  id: string;
  title: string;
  createdAt: string;
}

function App() {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, loading, refetch } = useQuery<{ boards: Board[] }>(GET_BOARDS);
  const [createBoard] = useMutation(CREATE_BOARD);

  const handleCreateBoard = async () => {
    // BUG: No error handling - fails silently
    if (newBoardTitle.trim()) {
      const result = await createBoard({ variables: { title: newBoardTitle } });
      setNewBoardTitle("");
      setIsDialogOpen(false);
      refetch();
      if (result.data?.createBoard) {
        setSelectedBoardId(result.data.createBoard.id);
      }
    }
  };

  if (selectedBoardId) {
    return (
      <div>
        <div className="border-b p-4 flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedBoardId(null)}>
            Back to Boards
          </Button>
        </div>
        <KanbanBoard boardId={selectedBoardId} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Kanban Boards</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> New Board
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Board</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Board title"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                />
                <Button onClick={handleCreateBoard} className="w-full">
                  Create Board
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : data?.boards.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No boards yet. Create one to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.boards.map((board) => (
              <button
                key={board.id}
                onClick={() => setSelectedBoardId(board.id)}
                className="p-6 border rounded-lg text-left hover:bg-accent transition-colors"
              >
                <h2 className="text-xl font-semibold">{board.title}</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Created {new Date(board.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
