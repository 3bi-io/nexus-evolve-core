# System Architecture Overview

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Layers](#architecture-layers)
4. [Data Flow](#data-flow)
5. [Security Model](#security-model)

## System Overview

This is a production-grade AI-powered application built with modern web technologies, providing intelligent chat interactions, agent marketplace, and advanced AI routing capabilities.

### Key Features
- **Multi-Agent System**: Custom AI agents with specialized capabilities
- **Intelligent AI Routing**: Automatic selection of optimal AI providers
- **Credit System**: Time-based credits with anonymous user support
- **Real-time Collaboration**: Multi-user sessions and shared conversations
- **Mobile-First Design**: PWA with offline capabilities
- **Enterprise Features**: Admin dashboard, analytics, and monitoring

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation

### Backend
- **Platform**: Supabase (PostgreSQL + Edge Functions)
- **Runtime**: Deno (Edge Functions)
- **Authentication**: Supabase Auth (JWT-based)
- **Database**: PostgreSQL 15 with pgvector extension
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime (WebSocket)

### AI Providers
- **Primary**: Lovable AI Gateway (Claude, Gemini, GPT)
- **Fallbacks**: Direct API integrations
  - Anthropic (Claude Sonnet 4.5)
  - Google (Gemini 2.5 Flash)
  - OpenAI (GPT-4o)
  - HuggingFace (Image generation, embeddings)
  - Replicate (Advanced models)

### Observability
- **Error Tracking**: Custom error tracking system
- **Performance Monitoring**: Web Vitals, custom metrics
- **Analytics**: User events, feature usage
- **Logs**: Structured logging in edge functions

## Architecture Layers

### 1. Presentation Layer (Frontend)
```
src/
├── pages/          # Route components
├── components/     # Reusable UI components
│   ├── ui/        # Base UI primitives
│   ├── chat/      # Chat-specific components
│   ├── agents/    # Agent management
│   ├── admin/     # Admin dashboard
│   └── mobile/    # Mobile-optimized components
├── hooks/         # Custom React hooks
├── contexts/      # React contexts (Auth, etc.)
└── lib/           # Utility libraries
```

**Key Patterns**:
- Component composition with Radix UI
- Custom hooks for business logic
- Semantic color tokens for theming
- Mobile-first responsive design

### 2. Application Layer (Edge Functions)
```
supabase/functions/
├── chat-stream-with-routing/    # Main chat handler
├── check-and-deduct-credits/    # Credit management
├── claude-chat/                  # Claude integration
├── coordinator-agent/            # Multi-agent orchestrator
├── lovable-ai-router/           # AI provider routing
├── validate-secrets/            # API key validation
└── _shared/                     # Shared utilities
    ├── cors.ts
    ├── rate-limit.ts
    ├── error-handler.ts
    └── credit-utils.ts
```

**Key Features**:
- Serverless architecture
- Automatic scaling
- Built-in CORS handling
- Standardized error responses

### 3. Data Layer (PostgreSQL)
```
Database Schema:
├── Core Tables
│   ├── profiles          # User profiles
│   ├── user_roles        # Role-based access control
│   ├── credit_transactions
│   └── visitor_credits
├── AI & Agents
│   ├── custom_agents
│   ├── agent_memory
│   ├── agent_executions
│   ├── interactions
│   └── llm_observations
├── Collaboration
│   ├── sessions
│   ├── session_messages
│   └── shared_sessions
└── Analytics
    ├── user_events
    ├── router_analytics
    └── model_performance
```

**Security**:
- Row-Level Security (RLS) on all tables
- Security definer functions for role checks
- Audit logging for sensitive operations

## Data Flow

### 1. Chat Message Flow
```
User Input
  ↓
ChatInterface Component
  ↓
check-and-deduct-credits Edge Function
  ↓
chat-stream-with-routing Edge Function
  ↓
AI Router (lovable-ai-router)
  ↓
Selected AI Provider (Claude/Gemini/GPT)
  ↓
Stream Response to Client
  ↓
Update Database (interactions, agent_memory)
```

### 2. Authentication Flow
```
User Login
  ↓
Supabase Auth (JWT)
  ↓
AuthContext Provider
  ↓
React Query Cache
  ↓
Protected Routes
```

### 3. Credit System Flow
```
User Action
  ↓
Check User Type (Auth vs Anonymous)
  ↓
Anonymous: visitor_credits (IP-based, daily reset)
Auth: profiles.credits (persistent)
  ↓
Deduct Credits
  ↓
Log Transaction
  ↓
Update UI
```

## Security Model

### Authentication
- **Method**: JWT tokens via Supabase Auth
- **Storage**: HTTP-only cookies (server) + localStorage (client)
- **Refresh**: Automatic token refresh
- **Expiry**: Configurable session timeout

### Authorization
- **Model**: Role-Based Access Control (RBAC)
- **Roles**: `user`, `admin`, `super_admin`
- **Implementation**: `user_roles` table + `has_role()` function
- **Enforcement**: RLS policies on all tables

### Row-Level Security (RLS)
All tables have RLS enabled with policies enforcing:
- Users can only access their own data
- Admins can access user data (with logging)
- Super admins have full access
- Service role bypasses RLS (for system operations)

### API Security
- **Rate Limiting**: IP-based rate limits on edge functions
- **CORS**: Configured per function
- **Input Validation**: Zod schemas for request validation
- **SQL Injection**: Protected via parameterized queries
- **XSS**: React's built-in escaping + CSP headers

### Data Privacy
- **Encryption**: At rest (PostgreSQL) and in transit (TLS)
- **PII Handling**: Minimal collection, secure storage
- **Audit Logging**: All admin actions logged
- **Data Retention**: Configurable retention policies

## Scalability Considerations

### Horizontal Scaling
- **Edge Functions**: Auto-scale with Supabase
- **Database**: Connection pooling, read replicas
- **Storage**: Distributed object storage

### Performance Optimization
- **Caching**: React Query for client-side caching
- **Indexing**: Strategic database indexes on hot paths
- **Code Splitting**: Lazy-loaded routes and components
- **CDN**: Static assets served via CDN

### Monitoring
- **Health Checks**: `/health` endpoint on critical functions
- **Metrics**: Custom metrics logged to `user_events`
- **Alerts**: Configured for error rates, response times
- **Logs**: Structured logging with request IDs

## Deployment

### Environments
- **Development**: Local Supabase + Vite dev server
- **Preview**: Automatic preview deployments
- **Production**: Supabase hosted backend + CDN frontend

### CI/CD Pipeline
```
Git Push
  ↓
Run Tests (Vitest)
  ↓
Build Frontend (Vite)
  ↓
Deploy Edge Functions (Supabase CLI)
  ↓
Run Database Migrations
  ↓
Deploy to Production
```

## Future Architecture Enhancements

1. **Microservices**: Break large edge functions into smaller, focused services
2. **Event-Driven**: Implement event bus for async operations
3. **GraphQL**: Consider GraphQL layer for complex queries
4. **WebSockets**: Real-time features beyond Supabase Realtime
5. **Multi-Region**: Deploy to multiple regions for lower latency