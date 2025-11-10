# Automated Systems Documentation

## Overview

This document describes all automated systems in the AI platform that run on scheduled intervals to improve performance, manage resources, and enable autonomous evolution.

## Cron Jobs

All cron jobs are configured in `CRON_ACTIVATION_SQL.sql` and must be activated in Supabase by running the SQL script.

### 1. Daily Evolution Cycle
**Schedule:** Daily at 2:00 AM UTC  
**Function:** `evolve-system`  
**Purpose:** Performs comprehensive system evolution

**What it does:**
- **Performance Analysis:** Calculates avg quality ratings and trend over 30 days
- **Knowledge Consolidation:** Archives unused memories, boosts frequently accessed ones, decays old ones
- **Adaptive Behavior Optimization:** Deactivates ineffective behaviors (effectiveness_score < 0.3, applied >10 times)
- **A/B Test Evaluation:** Concludes experiments older than 7 days, determines winners
- **Capability Auto-Activation:** Auto-approves capability suggestions with confidence_score > 0.8

**Monitoring:**
```sql
-- Check latest evolution logs
SELECT * FROM evolution_logs WHERE log_type = 'evolution_cycle' ORDER BY created_at DESC LIMIT 5;
```

### 2. Auto-Prune Memories
**Schedule:** Daily at 3:00 AM UTC  
**Function:** `auto-prune-memories`  
**Purpose:** Removes low-value memories to save storage

**What it does:**
- Checks user preferences for `auto_pruning_enabled`
- Prunes memories based on:
  - Age threshold (default: 60 days)
  - Relevance threshold (default: 0.3)
- Removes corresponding temporal scores from database
- Deletes memories from Mem0 API

**User Control:**
Users can configure pruning in their preferences:
```typescript
{
  auto_pruning_enabled: boolean,
  max_memory_age_days: number,  // default: 60
  min_relevance_score: number    // default: 0.3
}
```

### 3. Discover Capabilities
**Schedule:** Daily at 4:00 AM UTC  
**Function:** `discover-capabilities`  
**Purpose:** Analyzes user patterns to suggest new capabilities

**What it does:**
- Fetches recent interactions (last 30 days)
- Calculates interaction statistics (avg rating, low-rated topics)
- Uses AI to analyze capability gaps
- Stores suggestions in `capability_suggestions` table
- Auto-approves suggestions with confidence_score > 0.8

**Monitoring:**
```sql
-- View recent capability suggestions
SELECT * FROM capability_suggestions ORDER BY created_at DESC LIMIT 10;

-- View auto-approved capabilities
SELECT * FROM capability_suggestions WHERE status = 'approved' AND confidence_score > 0.8;
```

### 4. Execute Scheduled Agents
**Schedule:** Every 15 minutes  
**Function:** `execute-scheduled-agent`  
**Purpose:** Runs custom agents on their defined schedules

**What it does:**
- Queries `agent_schedules` for due executions
- Triggers `custom-agent-executor` for each agent
- Updates next execution time based on cron configuration
- Optionally sends results to webhook URLs

**Schedule Types:**
- Daily (e.g., "0 9 * * *" = 9 AM daily)
- Interval-based (next_execution_at updated after each run)

### 5. Scheduled Trend Monitor
**Schedule:** Every 6 hours  
**Function:** `scheduled-trend-monitor`  
**Purpose:** Monitors social trends, sentiment, competitors

### 6. Content Generation Worker
**Schedule:** Every 5 minutes  
**Function:** `content-generation-worker`  
**Purpose:** Processes queued content generation tasks

### 7. Automation Pipeline Executor
**Schedule:** Every 10 minutes  
**Function:** `automation-pipeline-executor`  
**Purpose:** Executes scheduled automation pipelines

### 8. Cleanup Expired Cache
**Schedule:** Every hour  
**Function:** Database function `cleanup_expired_cache()`  
**Purpose:** Removes expired AI response cache entries

### 9. Reset Daily Credits
**Schedule:** Daily at 12:00 AM UTC  
**Function:** `reset-daily-credits`  
**Purpose:** Resets visitor daily credits and cleans up old data

## Collaborative AI Services

### Cross-Agent Learning
**Manual Trigger:** Via Evolution Dashboard or API call  
**Function:** `cross-agent-learner`

**Actions:**
1. `record` - Records a learning event from a specific agent
2. `get_shared_learnings` - Retrieves learnings shared to an agent
3. `analyze_best_practices` - Analyzes top-performing strategies per agent type

**How it works:**
- High-value learnings (success_score > 0.8) are automatically shared to other agents
- Each agent can access learnings from other agent types
- Best practices are grouped by agent type for targeted optimization

**Example Usage:**
```typescript
// Record a successful strategy
await supabase.functions.invoke('cross-agent-learner', {
  body: {
    action: 'record',
    agentType: 'reasoning',
    learningEvent: 'Used chain-of-thought to solve complex problem',
    successScore: 0.95,
    context: { problemType: 'multi-step-logic' }
  }
});

// Get shared learnings
await supabase.functions.invoke('cross-agent-learner', {
  body: {
    action: 'get_shared_learnings',
    agentType: 'creative'
  }
});
```

### Multi-Agent Orchestration
**Manual Trigger:** Via API call or automation  
**Function:** `multi-agent-orchestrator`

**What it does:**
- Invokes multiple specialized agents in parallel
- Synthesizes their responses into unified output
- Logs collaboration details and results
- Tracks performance metrics per agent type

**Agents Available:**
- `reasoning` - Logical analysis, problem-solving
- `creative` - Creative ideation, storytelling
- `learning` - Adaptive learning, pattern recognition
- `coordinator` - Multi-task coordination

**Example Usage:**
```typescript
await supabase.functions.invoke('multi-agent-orchestrator', {
  body: {
    task: 'Design a new feature for the platform',
    sessionId: 'session-123',
    requestedAgents: ['reasoning', 'creative', 'coordinator']
  }
});
```

## Activation Instructions

### Step 1: Enable Extensions
Run in Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Step 2: Activate Cron Jobs
1. Go to: https://supabase.com/dashboard/project/coobieessxvnujkkiadc/sql/new
2. Copy and paste entire `CRON_ACTIVATION_SQL.sql` script
3. Click "Run" to execute
4. Verify with: `SELECT * FROM cron.job;`

### Step 3: Monitor Execution
```sql
-- View recent job runs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- View job execution history
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-evolution-cycle') 
ORDER BY start_time DESC;
```

## Troubleshooting

### Cron Job Not Running
1. Check if job is scheduled: `SELECT * FROM cron.job WHERE jobname = 'job-name-here';`
2. Check for execution errors: `SELECT * FROM cron.job_run_details WHERE status = 'failed' ORDER BY start_time DESC;`
3. Verify edge function exists and is deployed
4. Check edge function logs for errors

### Edge Function Errors
1. View logs: https://supabase.com/dashboard/project/coobieessxvnujkkiadc/functions/{function_name}/logs
2. Common issues:
   - Missing API keys in Supabase secrets
   - Authentication errors (verify `verify_jwt = false` in config.toml for cron-triggered functions)
   - Rate limiting from external APIs
   - Database permission issues

### Evolution Not Improving Performance
1. Check if enough interactions exist (need >10 for meaningful analysis)
2. Verify user ratings are being recorded in interactions table
3. Check evolution_logs for detailed results: `SELECT * FROM evolution_logs ORDER BY created_at DESC LIMIT 10;`
4. Ensure adaptive_behaviors table has entries to optimize

### Memory Pruning Too Aggressive
1. Update user preferences to increase thresholds:
   ```sql
   UPDATE user_preferences 
   SET max_memory_age_days = 90, min_relevance_score = 0.2
   WHERE user_id = 'your-user-id';
   ```
2. Disable auto-pruning: `UPDATE user_preferences SET auto_pruning_enabled = false WHERE user_id = 'your-user-id';`

## Maintenance Commands

### Unschedule a Job
```sql
SELECT cron.unschedule('job-name-here');
```

### Reschedule a Job
```sql
-- Unschedule first
SELECT cron.unschedule('daily-evolution-cycle');

-- Then create new schedule
SELECT cron.schedule(
  'daily-evolution-cycle',
  '0 3 * * *',  -- New time: 3 AM instead of 2 AM
  $$ ... $$
);
```

### Force Manual Execution
Use the Evolution Dashboard or call edge functions directly via Supabase Functions invoke.

## Security Notes

- All cron jobs use the anon key for authentication
- Edge functions triggered by cron should have `verify_jwt = false` in config.toml
- User-specific operations (like memory pruning) are filtered by user_id in the database
- Admin operations require proper role checks (super_admin, admin)

## Cost Considerations

**Daily Costs (estimated):**
- Evolution Cycle: ~100-200 credits (AI analysis)
- Capability Discovery: ~100-150 credits (AI analysis)
- Memory Pruning: ~10-50 credits (Mem0 API calls)
- Scheduled Agents: Variable (depends on user configurations)
- Other automations: ~50-100 credits total

**Total estimated:** 260-500 credits/day for full automation suite

**Optimization tips:**
- Disable unused cron jobs
- Increase intervals for non-critical jobs
- Set user preferences to reduce memory pruning frequency
- Monitor edge function logs for optimization opportunities
