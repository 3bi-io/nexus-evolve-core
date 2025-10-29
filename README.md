# Self-Learning AI System

A production-ready, self-evolving AI assistant that learns from interactions, builds knowledge graphs, and autonomously improves over time.

## 🌟 Key Features

- **Multi-Agent System**: Specialized agents for reasoning, creative tasks, learning, and coordination
- **Autonomous Evolution**: Daily self-improvement cycles with performance analysis and optimization
- **Semantic Memory**: Vector-based memory with intelligent retrieval and consolidation
- **Knowledge Graphs**: Visual representation of learned concepts and connections
- **A/B Testing**: Built-in experimentation framework for capability evaluation
- **Auto-Discovery**: Automatically identifies and suggests new capabilities

## 🚀 Quick Start

```bash
npm install
npm run dev
```

### Required Secrets (in Supabase Dashboard)
- `OPENAI_API_KEY` - For embeddings and chat
- `LOVABLE_API_KEY` - For AI routing

## 📚 Edge Functions

- **chat-stream-with-routing**: Main chat with intelligent agent routing
- **coordinator-agent**: Analyzes intent and recommends agents
- **reasoning-agent**: Deep analytical thinking (GPT-4)
- **creative-agent**: Brainstorming and ideation
- **learning-agent**: Meta-learning analysis
- **semantic-search**: Vector-based memory retrieval
- **evolve-system**: Daily autonomous improvement (cron)
- **discover-capabilities**: Weekly capability discovery (cron)
- **system-health**: Health monitoring
- **validate-secrets**: API key validation

## 🗄️ Database Tables

- `interactions` - Chat messages and responses
- `agent_memory` - Vector-based memory (with embeddings)
- `knowledge_base` - Structured knowledge
- `adaptive_behaviors` - Learned patterns
- `capability_modules` - System capabilities
- `ab_experiments` - A/B testing
- `user_preferences` - User settings
- `cron_job_logs` - Cron execution logs
- `evolution_logs` - System evolution history

## 🔧 Cron Job Setup

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Daily evolution at 2 AM
SELECT cron.schedule('daily-evolution', '0 2 * * *', 
  $$ SELECT net.http_post(url:='https://PROJECT_REF.supabase.co/functions/v1/evolve-system', 
     headers:='{"Authorization": "Bearer ANON_KEY"}'::jsonb) $$);

-- Weekly discovery on Sundays at 3 AM  
SELECT cron.schedule('weekly-discovery', '0 3 * * 0',
  $$ SELECT net.http_post(url:='https://PROJECT_REF.supabase.co/functions/v1/discover-capabilities',
     headers:='{"Authorization": "Bearer ANON_KEY"}'::jsonb) $$);
```

## 🐛 Troubleshooting

**Embeddings not generating?**
- Check OpenAI API key validity
- Run `validate-secrets` function

**Cron jobs not running?**
- Verify pg_cron extension enabled
- Check Supabase logs

**Health check failing?**
- Run `system-health` function from Evolution Dashboard
- Review error messages

## 📈 Features Implemented

### Priority 1: Stability ✅
- ErrorBoundary with UI fallback
- Comprehensive error handling in edge functions  
- Cron job monitoring (`cron_job_logs` table)
- Rate limiting (2-second debounce on manual actions)

### Priority 2: Documentation ✅
- Complete README with architecture
- Edge function documentation
- Cron job setup instructions
- System health monitoring

### Priority 3: UX ✅
- First-time user onboarding (4-step tour)
- Contextual tooltips throughout
- React Query caching (5-10 min)

### Priority 4: Data Integrity ✅
- User preferences table for settings persistence
- Memory decay mechanism in evolve-system
- OpenAI API key validation
- Performance indexes on all tables

### Priority 5: A/B Testing ✅
- A/B experiment framework in place
- Auto-evaluation after 7 days
- Winner determination logic

### Priority 6: Performance ✅
- Lazy loading for Knowledge Graph
- Database indexes for fast queries
- React Query caching configuration

## 📄 License

MIT
