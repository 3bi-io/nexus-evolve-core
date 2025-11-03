import { useEffect, useState, useCallback } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SEO } from "@/components/SEO";
import { useTemporalMemory } from "@/hooks/useTemporalMemory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Brain, Calendar } from "lucide-react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { toast } from "sonner";

interface Memory {
  id: string;
  content: any;
  created_at: string;
  temporal_relevance?: number;
}

const MemoryGraph = () => {
  const { getAllMemoriesWithTemporal, getTemporalScores, loading } = useTemporalMemory();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [timeFilter, setTimeFilter] = useState<number>(365); // Days
  const [stats, setStats] = useState({ total: 0, highRelevance: 0, lowRelevance: 0 });

  const loadMemories = useCallback(async () => {
    try {
      const [memoriesData, scoresData] = await Promise.all([
        getAllMemoriesWithTemporal(),
        getTemporalScores(),
      ]);

      setMemories(memoriesData);

      // Build graph structure
      const graphNodes: Node[] = memoriesData
        .filter((m) => {
          const age = (Date.now() - new Date(m.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return age <= timeFilter;
        })
        .map((memory, index) => {
          const score = scoresData.find((s) => s.memory_id === memory.id);
          const relevance = score?.calculated_relevance || 0.5;

          return {
            id: memory.id,
            type: "default",
            data: {
              label: typeof memory.content === "string" 
                ? memory.content.slice(0, 50) + "..." 
                : JSON.stringify(memory.content).slice(0, 50) + "...",
              relevance,
              accessCount: score?.access_count || 0,
              lastAccessed: score?.last_accessed,
            },
            position: {
              x: (index % 10) * 250,
              y: Math.floor(index / 10) * 150,
            },
            style: {
              background: relevance > 0.7 ? "hsl(var(--success))" : relevance > 0.4 ? "hsl(var(--warning))" : "hsl(var(--muted))",
              color: "hsl(var(--foreground))",
              border: "2px solid hsl(var(--border))",
              borderRadius: "8px",
              padding: "10px",
              fontSize: "12px",
              width: 200,
            },
          };
        });

      // Create edges based on temporal proximity (memories created within 1 day of each other)
      const graphEdges: Edge[] = [];
      for (let i = 0; i < graphNodes.length - 1; i++) {
        const current = memoriesData[i];
        const next = memoriesData[i + 1];
        const timeDiff = Math.abs(
          new Date(current.created_at).getTime() - new Date(next.created_at).getTime()
        ) / (1000 * 60 * 60 * 24);

        if (timeDiff <= 1) {
          graphEdges.push({
            id: `e${current.id}-${next.id}`,
            source: current.id,
            target: next.id,
            type: "smoothstep",
            animated: true,
            style: { stroke: "hsl(var(--primary))", strokeWidth: 1 },
          });
        }
      }

      setNodes(graphNodes);
      setEdges(graphEdges);

      // Calculate stats
      const highRelevance = scoresData.filter((s) => s.calculated_relevance > 0.7).length;
      const lowRelevance = scoresData.filter((s) => s.calculated_relevance < 0.3).length;
      setStats({
        total: graphNodes.length,
        highRelevance,
        lowRelevance,
      });

      toast.success(`Loaded ${graphNodes.length} memories`);
    } catch (error) {
      console.error("Error loading memories:", error);
      toast.error("Failed to load memory graph");
    }
  }, [getAllMemoriesWithTemporal, getTemporalScores, timeFilter]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  return (
    <PageLayout title="Memory Graph" showBottomNav={true}>
      <SEO
        title="Memory Graph - Visualize Your AI Knowledge Network"
        description="Interactive visualization of your Oneiros.me memory network. Explore temporal connections and memory relevance scores."
        keywords="memory graph, knowledge network, AI visualization, memory management"
        canonical="https://oneiros.me/memory-graph"
      />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Memory Graph</h1>
            <p className="text-muted-foreground">
              Interactive visualization of your memory network
            </p>
          </div>
          <Button onClick={loadMemories} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Total Memories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">High Relevance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">{stats.highRelevance}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Low Relevance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">{stats.lowRelevance}</p>
            </CardContent>
          </Card>
        </div>

        {/* Time Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Time Filter: Last {timeFilter} days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={[timeFilter]}
              onValueChange={([value]) => setTimeFilter(value)}
              min={7}
              max={365}
              step={7}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>7 days</span>
              <span>1 year</span>
            </div>
          </CardContent>
        </Card>

        {/* Graph Visualization */}
        <Card className="h-[600px]">
          <CardContent className="p-0 h-full">
            {nodes.length > 0 ? (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-left"
              >
                <Background variant={BackgroundVariant.Dots} />
                <Controls />
                <MiniMap
                  nodeColor={(node) => {
                    const relevance = node.data.relevance || 0.5;
                    return relevance > 0.7 ? "#22c55e" : relevance > 0.4 ? "#f59e0b" : "#6b7280";
                  }}
                />
              </ReactFlow>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No memories found. Start chatting to create your knowledge graph!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-4 flex gap-4 items-center justify-center text-sm">
          <div className="flex items-center gap-2">
            <Badge className="bg-success">High Relevance</Badge>
            <span className="text-muted-foreground">&gt; 0.7</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-warning">Medium Relevance</Badge>
            <span className="text-muted-foreground">0.4 - 0.7</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Low Relevance</Badge>
            <span className="text-muted-foreground">&lt; 0.4</span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MemoryGraph;
