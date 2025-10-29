import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";

const ForceGraph2D = lazy(() => import("react-force-graph-2d"));
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Network } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type GraphNode = {
  id: string;
  name: string;
  type: "knowledge" | "memory" | "solution" | "pattern";
  val: number;
  color: string;
};

type GraphLink = {
  source: string;
  target: string;
  value: number;
};

export default function KnowledgeGraph() {
  const { user } = useAuth();
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ knowledge: 0, memories: 0, solutions: 0, patterns: 0 });

  const loadGraphData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [knowledgeRes, memoryRes, solutionsRes] = await Promise.all([
        supabase.from("knowledge_base").select("*").eq("user_id", user.id),
        supabase.from("agent_memory").select("*").eq("user_id", user.id),
        supabase.from("problem_solutions").select("*").eq("user_id", user.id),
      ]);

      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];
      const nodeMap = new Map<string, boolean>();

      // Add knowledge nodes
      knowledgeRes.data?.forEach((item) => {
        const nodeId = `k-${item.id}`;
        if (!nodeMap.has(nodeId)) {
          nodes.push({
            id: nodeId,
            name: item.topic || "Unknown",
            type: "knowledge",
            val: 15,
            color: "hsl(262, 83%, 58%)",
          });
          nodeMap.set(nodeId, true);
        }
      });

      // Add memory nodes and create links
      memoryRes.data?.forEach((item) => {
        const nodeId = `m-${item.id}`;
        if (!nodeMap.has(nodeId)) {
          nodes.push({
            id: nodeId,
            name: item.context_summary || "Memory",
            type: item.memory_type as any,
            val: 10,
            color: "hsl(217, 91%, 60%)",
          });
          nodeMap.set(nodeId, true);
        }

        // Link memories to knowledge if they share topics
        if (item.metadata && typeof item.metadata === 'object' && 'topics' in item.metadata) {
          const topics = (item.metadata as any).topics;
          if (Array.isArray(topics)) {
            topics.forEach((topic: string) => {
              knowledgeRes.data?.forEach((kItem) => {
                if (kItem.topic?.toLowerCase().includes(topic.toLowerCase())) {
                  links.push({
                    source: nodeId,
                    target: `k-${kItem.id}`,
                    value: 1,
                  });
                }
              });
            });
          }
        }
      });

      // Add solution nodes
      solutionsRes.data?.forEach((item) => {
        const nodeId = `s-${item.id}`;
        if (!nodeMap.has(nodeId)) {
          nodes.push({
            id: nodeId,
            name: item.problem_description?.substring(0, 30) + "..." || "Solution",
            type: "solution",
            val: 12,
            color: "hsl(142, 76%, 36%)",
          });
          nodeMap.set(nodeId, true);

          // Link solutions to related memories
          memoryRes.data?.forEach((mItem) => {
            if (item.metadata && mItem.metadata) {
              links.push({
                source: nodeId,
                target: `m-${mItem.id}`,
                value: 0.5,
              });
            }
          });
        }
      });

      setGraphData({ nodes, links });
      setStats({
        knowledge: knowledgeRes.data?.length || 0,
        memories: memoryRes.data?.length || 0,
        solutions: solutionsRes.data?.length || 0,
        patterns: memoryRes.data?.filter((m) => m.memory_type === "pattern").length || 0,
      });

      toast({
        title: "Knowledge graph loaded",
        description: `Loaded ${nodes.length} concepts and ${links.length} connections`,
      });
    } catch (error) {
      console.error("Error loading graph:", error);
      toast({
        title: "Failed to load knowledge graph",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Network className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Knowledge Graph</h1>
              <p className="text-muted-foreground">Visual representation of learned concepts and connections</p>
            </div>
          </div>
          <Button onClick={loadGraphData} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.knowledge}</div>
              <p className="text-xs text-muted-foreground">Topics learned</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Memories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.memories}</div>
              <p className="text-xs text-muted-foreground">Context stored</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.solutions}</div>
              <p className="text-xs text-muted-foreground">Problems solved</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.patterns}</div>
              <p className="text-xs text-muted-foreground">Patterns detected</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Concept Network</CardTitle>
            <CardDescription>
              Hover over nodes to see connections. Purple: Knowledge, Blue: Memories, Green: Solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[600px] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : graphData.nodes.length === 0 ? (
              <div className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Network className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No knowledge graph data yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start chatting and extracting learnings to build your knowledge graph
                  </p>
                </div>
              </div>
            ) : (
              <Suspense fallback={
                <div className="h-[600px] flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                </div>
              }>
                <ForceGraph2D
                  graphData={graphData}
                nodeLabel="name"
                nodeAutoColorBy="type"
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                width={1000}
                height={600}
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                  const label = node.name;
                  const fontSize = 12 / globalScale;
                  ctx.font = `${fontSize}px Sans-Serif`;
                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  ctx.fillStyle = node.color;
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
                  ctx.fill();
                  ctx.fillStyle = "white";
                  ctx.fillText(label, node.x, node.y + node.val + fontSize);
                }}
              />
              </Suspense>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
