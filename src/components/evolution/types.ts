export type EvolutionLog = {
  id: string;
  log_type: string;
  description: string;
  created_at: string;
};

export type Stats = {
  totalInteractions: number;
  avgRating: number;
  learningRate: number;
  activeCapabilities: number;
};

export type AdaptiveBehavior = {
  id: string;
  behavior_type: string;
  description: string;
  effectiveness_score: number;
  application_count: number;
  created_at: string;
};

export type CronStatus = {
  lastEvolution: string | null;
  lastDiscovery: string | null;
  embeddingsProgress: { total: number; generated: number };
  archivedMemories: number;
};

export type ABExperiment = {
  id: string;
  experiment_name: string;
  variant: string;
  started_at: string;
  ended_at: string | null;
  winner: string | null;
  active: boolean;
  metrics: any;
};

export type ArchivedMemory = {
  id: string;
  context_summary: string;
  created_at: string;
  metadata: any;
};
