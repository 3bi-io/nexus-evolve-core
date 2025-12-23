import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Zap, DollarSign } from "lucide-react";

interface Feature {
  name: string;
  speed: "fast" | "medium" | "slow";
  cost: "low" | "medium" | "high";
  useCase: string;
  model: string;
}

interface FeatureMatrixProps {
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  { name: "Image Generation", speed: "medium", cost: "medium", useCase: "Creative content", model: "gemini-image" },
  { name: "Vision Analysis", speed: "fast", cost: "low", useCase: "Image understanding", model: "grok-2-vision" },
  { name: "Code Analysis", speed: "fast", cost: "low", useCase: "Code review & security", model: "grok-3" },
  { name: "Deep Reasoning", speed: "slow", cost: "high", useCase: "Complex problem solving", model: "grok-3" },
  { name: "Trending Topics", speed: "fast", cost: "low", useCase: "Social intelligence", model: "grok-3" },
  { name: "Sentiment Analysis", speed: "fast", cost: "low", useCase: "Opinion mining", model: "grok-3" },
  { name: "Viral Content", speed: "medium", cost: "medium", useCase: "Content creation", model: "grok-3" },
  { name: "Real-time Search", speed: "fast", cost: "low", useCase: "Information retrieval", model: "grok-3" },
];

export function FeatureMatrix({ features = defaultFeatures }: FeatureMatrixProps) {
  const getSpeedBadge = (speed: string) => {
    const variants = {
      fast: "bg-success/10 text-success border-success/20",
      medium: "bg-warning/10 text-warning border-warning/20",
      slow: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return (
      <Badge variant="outline" className={variants[speed as keyof typeof variants]}>
        <Zap className="w-3 h-3 mr-1" />
        {speed}
      </Badge>
    );
  };

  const getCostBadge = (cost: string) => {
    const variants = {
      low: "bg-success/10 text-success border-success/20",
      medium: "bg-warning/10 text-warning border-warning/20",
      high: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return (
      <Badge variant="outline" className={variants[cost as keyof typeof variants]}>
        <DollarSign className="w-3 h-3 mr-1" />
        {cost}
      </Badge>
    );
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Feature Comparison</h2>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              <TableHead>Speed</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Use Case</TableHead>
              <TableHead>Model</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature) => (
              <TableRow key={feature.name}>
                <TableCell className="font-medium">{feature.name}</TableCell>
                <TableCell>{getSpeedBadge(feature.speed)}</TableCell>
                <TableCell>{getCostBadge(feature.cost)}</TableCell>
                <TableCell className="text-muted-foreground">{feature.useCase}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{feature.model}</code>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
