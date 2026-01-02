# Temporal Intelligence & Memory Processing (TIMP)

## Technical Whitepaper v1.0

**Platform**: Oneiros AI  
**Last Updated**: January 2026  
**Status**: Production

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [System Architecture](#system-architecture)
4. [Core Algorithm](#core-algorithm)
5. [Data Model](#data-model)
6. [Data Flow](#data-flow)
7. [Automated Pruning System](#automated-pruning-system)
8. [Frontend Integration](#frontend-integration)
9. [Security & Privacy](#security--privacy)
10. [Performance Optimization](#performance-optimization)
11. [Integration Points](#integration-points)
12. [Future Roadmap](#future-roadmap)
13. [Appendices](#appendices)

---

## Executive Summary

Temporal Intelligence & Memory Processing (TIMP) is an advanced memory management system that mimics human cognitive memory patterns. Unlike traditional flat storage systems, TIMP dynamically prioritizes information based on three key factors:

- **Recency**: How recently was the memory accessed?
- **Frequency**: How often is the memory retrieved?
- **Importance**: What is the intrinsic value of the memory?

This approach ensures that relevant, frequently-used information surfaces quickly while outdated or rarely-accessed data gracefully fades, optimizing both retrieval performance and storage efficiency.

---

## Problem Statement

### Challenges with Traditional AI Memory Systems

| Problem | Impact |
|---------|--------|
| **Flat Storage** | All memories treated equally, leading to irrelevant context retrieval |
| **Unbounded Growth** | Memory stores grow indefinitely, degrading performance |
| **No Temporal Awareness** | Recent interactions aren't prioritized over old ones |
| **Static Importance** | No mechanism to learn which memories matter most |
| **Context Pollution** | Outdated information interferes with current tasks |

### TIMP Solution

TIMP addresses these challenges by implementing a biologically-inspired memory model where memories compete for relevance based on their temporal characteristics and usage patterns.

---

## System Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  useTemporalMemory Hook  │  MemoryGraph Page  │  MemoryArchive  │
│  (React Hook)            │  (Visualization)   │  (Low-usage UI) │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  mem0-memory         │  auto-prune-memories  │  semantic-search │
│  (Edge Function)     │  (Scheduled Job)      │  (Edge Function) │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  memory_temporal_scores  │  agent_memory  │  user_preferences   │
│  (Temporal Metadata)     │  (Core Store)  │  (User Settings)    │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────────┤
│                         Mem0 AI API                             │
│                    (Memory Storage Provider)                    │
└─────────────────────────────────────────────────────────────────┘
```

### Component Details

#### Frontend Components

| Component | File | Purpose |
|-----------|------|---------|
| `useTemporalMemory` | `src/hooks/useTemporalMemory.ts` | React hook providing temporal memory operations |
| `MemoryGraph` | `src/pages/MemoryGraph.tsx` | Interactive graph visualization of memory network |
| `MemoryArchiveCard` | `src/components/evolution/MemoryArchiveCard.tsx` | UI for managing low-relevance memories |

#### Backend Services

| Service | File | Purpose |
|---------|------|---------|
| `mem0-memory` | `supabase/functions/mem0-memory/index.ts` | Core memory operations with Mem0 API |
| `auto-prune-memories` | `supabase/functions/auto-prune-memories/index.ts` | Scheduled cleanup of low-relevance memories |
| `semantic-search` | `supabase/functions/semantic-search/index.ts` | Vector-based semantic memory search |

#### Database Objects

| Object | Type | Purpose |
|--------|------|---------|
| `memory_temporal_scores` | Table | Stores temporal metadata for each memory |
| `user_memory_preferences` | Table | Stores user pruning preferences |
| `memory_pruning_logs` | Table | Logs automated pruning operations |
| `calculate_temporal_relevance` | Function | Computes relevance score |

---

## Core Algorithm

### Temporal Relevance Formula

The core of TIMP is the **Temporal Relevance Score (TRS)**, calculated as:

```
TRS = (Importance × W_i) + (AccessFrequency × W_f) + (RecencyDecay × W_r)
```

Where:
- `W_i = 0.4` (Importance weight)
- `W_f = 0.3` (Frequency weight)
- `W_r = 0.3` (Recency weight)

### Component Calculations

#### 1. Importance Score (0.0 - 1.0)

Base importance assigned at memory creation, influenced by:
- Explicit user marking
- Content analysis (keywords, entities)
- Interaction context (was this pivotal in a conversation?)

#### 2. Access Frequency Score

```
AccessFrequency = min(access_count / 10, 1.0)
```

Normalized to 0-1 range, saturating at 10 accesses.

#### 3. Recency Decay

Exponential decay based on time since last access:

```
RecencyDecay = e^(-decay_rate × days_since_access)
```

Default `decay_rate = 0.1` provides gradual decay:

| Days Since Access | Recency Score |
|-------------------|---------------|
| 0 | 1.000 |
| 1 | 0.905 |
| 7 | 0.497 |
| 14 | 0.247 |
| 30 | 0.050 |
| 60 | 0.002 |

### PostgreSQL Implementation

```sql
CREATE OR REPLACE FUNCTION calculate_temporal_relevance(
  p_importance_score NUMERIC,
  p_access_count INTEGER,
  p_decay_rate NUMERIC,
  p_last_accessed TIMESTAMPTZ
) RETURNS NUMERIC AS $$
DECLARE
  days_since_access NUMERIC;
  recency_score NUMERIC;
  frequency_score NUMERIC;
  relevance NUMERIC;
BEGIN
  -- Calculate days since last access
  days_since_access := EXTRACT(EPOCH FROM (NOW() - p_last_accessed)) / 86400;
  
  -- Exponential decay for recency
  recency_score := EXP(-p_decay_rate * days_since_access);
  
  -- Normalize frequency (cap at 10 accesses)
  frequency_score := LEAST(p_access_count::NUMERIC / 10.0, 1.0);
  
  -- Weighted combination
  relevance := (p_importance_score * 0.4) + 
               (frequency_score * 0.3) + 
               (recency_score * 0.3);
  
  RETURN ROUND(relevance, 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

## Data Model

### memory_temporal_scores Table

```sql
CREATE TABLE memory_temporal_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  memory_id TEXT NOT NULL,
  access_count INTEGER DEFAULT 1,
  importance_score REAL DEFAULT 0.5,
  decay_rate REAL DEFAULT 0.1,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  calculated_relevance REAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, memory_id)
);

-- Performance indexes
CREATE INDEX idx_temporal_scores_user_relevance 
  ON memory_temporal_scores(user_id, calculated_relevance DESC);
  
CREATE INDEX idx_temporal_scores_last_accessed 
  ON memory_temporal_scores(last_accessed);
```

### user_memory_preferences Table

```sql
CREATE TABLE user_memory_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  auto_pruning_enabled BOOLEAN DEFAULT true,
  pruning_aggressiveness TEXT DEFAULT 'moderate',
  min_age_days INTEGER DEFAULT 90,
  relevance_threshold REAL DEFAULT 0.3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### memory_pruning_logs Table

```sql
CREATE TABLE memory_pruning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pruned_count INTEGER DEFAULT 0,
  storage_saved_kb INTEGER DEFAULT 0,
  threshold_used REAL,
  pruned_memory_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Data Flow

### Memory Search Flow

```
User Query
    │
    ▼
┌─────────────────────┐
│ useTemporalMemory   │
│ searchWithTemporal()│
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ mem0-memory         │
│ Edge Function       │
│ action: "search"    │
└─────────────────────┘
    │
    ├──────────────────────┐
    ▼                      ▼
┌─────────────┐    ┌──────────────────┐
│ Mem0 API    │    │ Supabase DB      │
│ Search      │    │ Get Scores       │
└─────────────┘    └──────────────────┘
    │                      │
    └──────────┬───────────┘
               ▼
    ┌─────────────────────┐
    │ Update Access       │
    │ - increment count   │
    │ - update timestamp  │
    │ - recalc relevance  │
    └─────────────────────┘
               │
               ▼
    ┌─────────────────────┐
    │ Re-rank Results     │
    │ by TRS Score        │
    └─────────────────────┘
               │
               ▼
    ┌─────────────────────┐
    │ Return Sorted       │
    │ Memories            │
    └─────────────────────┘
```

### Memory Creation Flow

```
New Memory Content
    │
    ▼
┌─────────────────────┐
│ mem0-memory         │
│ action: "add"       │
└─────────────────────┘
    │
    ├──────────────────────┐
    ▼                      ▼
┌─────────────┐    ┌──────────────────┐
│ Mem0 API    │    │ Supabase DB      │
│ Store       │    │ Create Score     │
│ Memory      │    │ Record           │
└─────────────┘    └──────────────────┘
    │                      │
    │              ┌───────┴───────┐
    │              │ Initialize:   │
    │              │ - access = 0  │
    │              │ - importance  │
    │              │ - decay rate  │
    │              └───────────────┘
    │                      │
    └──────────┬───────────┘
               ▼
         Return Memory ID
```

---

## Automated Pruning System

### Pruning Algorithm

The `auto-prune-memories` edge function runs on a schedule (default: daily) to remove low-relevance memories.

```typescript
// User preferences stored in user_memory_preferences table
interface UserMemoryPreferences {
  auto_pruning_enabled: boolean;       // Enable automatic pruning (default: true)
  pruning_aggressiveness: string;      // 'conservative' | 'moderate' | 'aggressive'
  min_age_days: number;                // Minimum age before eligible (default: 90)
  relevance_threshold: number;         // Base threshold (default: 0.3)
}
```

### Aggressiveness Levels

| Level | Threshold Multiplier | Description |
|-------|---------------------|-------------|
| Conservative | 0.7× | Only prune very low relevance (threshold × 0.7) |
| Moderate | 1.0× | Standard threshold |
| Aggressive | 1.3× | Prune more aggressively (threshold × 1.3) |

### Pruning Logic

```typescript
// From auto-prune-memories edge function
for (const userPref of users || []) {
  const userId = userPref.user_id;
  const aggressiveness = userPref.pruning_aggressiveness;
  const minAgeDays = userPref.min_age_days;
  const relevanceThreshold = userPref.relevance_threshold;

  // Adjust threshold based on aggressiveness
  let adjustedThreshold = relevanceThreshold;
  if (aggressiveness === 'conservative') adjustedThreshold *= 0.7;
  if (aggressiveness === 'aggressive') adjustedThreshold *= 1.3;

  // Get all memories for user from Mem0
  const memories = await fetchMemoriesFromMem0(userId);

  // Get temporal scores for these memories
  const { data: scores } = await supabase
    .from('memory_temporal_scores')
    .select('*')
    .eq('user_id', userId);

  const prunedMemoryIds: string[] = [];
  let storageSaved = 0;

  for (const memory of memories.results || []) {
    const score = scores?.find(s => s.memory_id === memory.id);
    if (!score) continue;

    // Calculate age in days
    const ageInDays = (Date.now() - new Date(score.created_at).getTime()) / (1000 * 60 * 60 * 24);

    // Decide if memory should be pruned
    const shouldPrune = 
      ageInDays >= minAgeDays && 
      (score.calculated_relevance || 0) < adjustedThreshold;

    if (shouldPrune) {
      // Delete from Mem0 and local database
      await deleteFromMem0(memory.id);
      await supabase
        .from('memory_temporal_scores')
        .delete()
        .eq('user_id', userId)
        .eq('memory_id', memory.id);
      
      prunedMemoryIds.push(memory.id);
      storageSaved += 1; // Estimate: 1KB per memory
    }
  }

  // Log pruning action
  if (prunedMemoryIds.length > 0) {
    await supabase.from('memory_pruning_logs').insert({
      user_id: userId,
      pruned_count: prunedMemoryIds.length,
      storage_saved_kb: storageSaved,
      threshold_used: adjustedThreshold,
      pruned_memory_ids: prunedMemoryIds,
    });
  }
}
```

---

## Frontend Integration

### useTemporalMemory Hook API

```typescript
interface UseTemporalMemoryReturn {
  loading: boolean;
  updateMemoryAccess: (memoryId: string) => Promise<void>;
  getTemporalScores: () => Promise<TemporalScore[]>;
  searchWithTemporal: (query: string, limit?: number) => Promise<Memory[]>;
  getAllMemoriesWithTemporal: () => Promise<Memory[]>;
}

// Usage
const { 
  loading, 
  searchWithTemporal, 
  getTemporalScores 
} = useTemporalMemory();

// Search memories with temporal ranking
const results = await searchWithTemporal("project requirements", 10);
```

### MemoryGraph Visualization

The `MemoryGraph` page provides an interactive visualization of the user's memory network using React Flow.

#### Features

| Feature | Description |
|---------|-------------|
| **Node Coloring** | Green (high relevance) → Yellow → Red (low relevance) |
| **Node Size** | Proportional to importance score |
| **Edge Connections** | Based on semantic similarity |
| **Time Filter** | Slider to filter by recency |
| **Statistics** | Total, high-relevance, low-relevance counts |
| **Minimap** | Overview navigation |

#### Relevance Color Mapping

```typescript
const getNodeColor = (relevance: number): string => {
  if (relevance >= 0.7) return '#22c55e'; // Green - High
  if (relevance >= 0.4) return '#eab308'; // Yellow - Medium
  return '#ef4444';                        // Red - Low
};
```

---

## Security & Privacy

### Row Level Security (RLS)

All temporal memory tables implement strict RLS policies:

```sql
-- Users can only access their own temporal scores
CREATE POLICY "Users can view own temporal scores"
  ON memory_temporal_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own temporal scores"
  ON memory_temporal_scores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own temporal scores"
  ON memory_temporal_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own temporal scores"
  ON memory_temporal_scores FOR DELETE
  USING (auth.uid() = user_id);
```

### Data Encryption

- All data encrypted at rest (Supabase default)
- TLS 1.3 for data in transit
- Mem0 API communications over HTTPS

### Privacy Controls

- Users can delete all their memories
- Pruning logs retained for 30 days only
- No cross-user memory sharing without explicit consent

---

## Performance Optimization

### Database Indexes

```sql
-- Primary lookup pattern: user + relevance ranking
CREATE INDEX idx_temporal_scores_user_relevance 
  ON memory_temporal_scores(user_id, calculated_relevance DESC);

-- Pruning queries: last accessed time
CREATE INDEX idx_temporal_scores_last_accessed 
  ON memory_temporal_scores(last_accessed);

-- Memory ID lookups
CREATE INDEX idx_temporal_scores_memory_id 
  ON memory_temporal_scores(memory_id);
```

### Caching Strategy

| Cache Layer | TTL | Purpose |
|-------------|-----|---------|
| Edge Function | 60s | Hot memory scores |
| React Query | 5m | Frontend state |
| Browser | Session | Current view |

### Frontend Optimizations

```typescript
// Memoized score calculations
const processedMemories = useMemo(() => {
  return memories.map(m => ({
    ...m,
    displayRelevance: calculateDisplayRelevance(m)
  }));
}, [memories]);

// Debounced search
const debouncedSearch = useCallback(
  debounce((query: string) => searchWithTemporal(query), 300),
  []
);
```

---

## Integration Points

### Multi-Agent System Integration

TIMP integrates with the Multi-Agent Orchestration System (Phase 3C):

```typescript
// Coordinator Agent uses TIMP for context
async function getAgentContext(userId: string, query: string) {
  const temporalMemories = await searchWithTemporal(query, 5);
  
  return {
    relevantMemories: temporalMemories,
    userPreferences: await getUserPreferences(userId),
    recentInteractions: await getRecentInteractions(userId)
  };
}
```

### Semantic Search Combination

TIMP enhances semantic search results with temporal re-ranking:

```typescript
async function hybridSearch(query: string, userId: string) {
  // 1. Get semantic matches from vector search
  const semanticResults = await semanticSearch(query);
  
  // 2. Get temporal scores for matched memories
  const temporalScores = await getTemporalScores(
    semanticResults.map(r => r.id)
  );
  
  // 3. Combine scores: 60% semantic + 40% temporal
  const hybridScores = semanticResults.map(result => ({
    ...result,
    finalScore: (result.similarity * 0.6) + 
                (temporalScores[result.id]?.relevance || 0) * 0.4
  }));
  
  // 4. Re-rank by hybrid score
  return hybridScores.sort((a, b) => b.finalScore - a.finalScore);
}
```

---

## Future Roadmap

### Phase 1: Enhanced Controls (Q1 2026)

- [ ] Manual importance adjustment UI
- [ ] Memory pinning (prevent decay)
- [ ] Custom decay rate per memory
- [ ] Bulk operations interface

### Phase 2: Memory Consolidation (Q2 2026)

- [ ] Automatic similar memory merging
- [ ] Concept clustering
- [ ] Summary generation for memory groups
- [ ] Contradiction detection

### Phase 3: Cross-Session Learning (Q3 2026)

- [ ] Session-to-session pattern detection
- [ ] Predictive memory prefetching
- [ ] Context carryover optimization
- [ ] Long-term trend analysis

### Phase 4: Advanced Features (Q4 2026)

- [ ] Collaborative memory sharing
- [ ] Team memory pools
- [ ] Memory export/import
- [ ] Integration with external knowledge bases

---

## Appendices

### Appendix A: Edge Function API Reference

#### mem0-memory

| Action | Method | Parameters | Returns |
|--------|--------|------------|---------|
| `add` | POST | `messages`, `user_id`, `metadata` | `{ memory_id }` |
| `search` | POST | `query`, `user_id`, `limit` | `Memory[]` |
| `get` | POST | `user_id` | `Memory[]` |
| `delete` | POST | `memory_id`, `user_id` | `{ success }` |
| `update` | POST | `memory_id`, `messages` | `{ success }` |

### Appendix B: Database Function Reference

#### calculate_temporal_relevance

```sql
-- Signature (actual implementation in database)
calculate_temporal_relevance(
  p_access_count INTEGER,
  p_importance_score REAL,
  p_last_accessed TIMESTAMPTZ,
  p_decay_rate REAL
) RETURNS REAL
```

### Appendix C: Configuration Defaults

```typescript
const TIMP_DEFAULTS = {
  // Scoring weights
  IMPORTANCE_WEIGHT: 0.4,
  FREQUENCY_WEIGHT: 0.3,
  RECENCY_WEIGHT: 0.3,
  
  // Decay settings
  DEFAULT_DECAY_RATE: 0.1,
  FREQUENCY_SATURATION: 10,
  
  // Pruning settings (user_memory_preferences defaults)
  PRUNE_MIN_AGE_DAYS: 90,
  PRUNE_THRESHOLD: 0.3,
  DEFAULT_AGGRESSIVENESS: 'moderate',
  
  // Aggressiveness multipliers
  AGGRESSIVENESS_MULTIPLIERS: {
    conservative: 0.7,
    moderate: 1.0,
    aggressive: 1.3
  },
  
  // Memory defaults
  DEFAULT_ACCESS_COUNT: 1,
  DEFAULT_IMPORTANCE_SCORE: 0.5,
  
  // Limits
  MAX_SEARCH_RESULTS: 50
};

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Oneiros AI Team | Initial release |

---

*This document is part of the Oneiros AI Platform technical documentation.*
