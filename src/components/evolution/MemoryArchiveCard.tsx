import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, Brain } from "lucide-react";
import { ArchivedMemory } from "./types";

interface MemoryArchiveCardProps {
  archivedMemories: ArchivedMemory[];
  onRestore: (memoryId: string) => void;
}

export const MemoryArchiveCard = ({ archivedMemories, onRestore }: MemoryArchiveCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="w-5 h-5" />
          Low-Usage Memories
        </CardTitle>
        <CardDescription>Memories with minimal retrieval (potential candidates for archival)</CardDescription>
      </CardHeader>
      <CardContent>
        {archivedMemories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>All memories are actively used!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {archivedMemories.slice(0, 20).map((memory) => (
              <div key={memory.id} className="flex items-start justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <div className="flex-1">
                  <p className="text-sm text-foreground line-clamp-2">{memory.context_summary}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(memory.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRestore(memory.id)}
                  className="ml-2"
                >
                  Restore
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
