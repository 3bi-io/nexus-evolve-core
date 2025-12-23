# AI Routing System

## Overview

The AI Routing System intelligently selects the optimal AI provider for each request based on task complexity, user preferences, cost, and availability.

## Architecture

### Components

```
┌─────────────────┐
│  User Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Intent Analyzer │  ← coordinator-agent
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Router      │  ← lovable-ai-router / useUnifiedAIRouter
└────────┬────────┘
         │
         ├──────────┬──────────┬──────────┐
         ▼          ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
    │ Claude │ │ Gemini │ │  GPT   │ │  HF    │
    └────────┘ └────────┘ └────────┘ └────────┘
```

### 1. Intent Analyzer (`coordinator-agent`)

**Purpose**: Analyzes user messages to determine intent and complexity

**Inputs**:
- User message
- Conversation history
- Session context

**Outputs**:
```typescript
{
  intent: 'general' | 'creative' | 'analytical' | 'code' | 'research',
  complexity: 'low' | 'medium' | 'high',
  confidence: number, // 0-1
  suggestedAgent: string,
  reasoning: string
}
```

**Logic**:
- **Low Complexity**: Simple questions, greetings, basic info
- **Medium Complexity**: Multi-step reasoning, explanations
- **High Complexity**: Complex analysis, code generation, research

### 2. AI Router (`lovable-ai-router` / `useUnifiedAIRouter`)

**Purpose**: Route to optimal AI provider based on intent analysis

#### Routing Rules

| Task Type      | Complexity | Provider    | Model                  | Reason                    |
|----------------|-----------|-------------|------------------------|---------------------------|
| Chat           | Low       | Gemini      | gemini-2.5-flash       | Fast, cheap, sufficient   |
| Chat           | Medium    | Gemini      | gemini-2.5-flash       | Good balance              |
| Chat           | High      | Claude      | claude-sonnet-4-5      | Best reasoning            |
| Code           | Any       | Claude      | claude-sonnet-4-5      | Superior code generation  |
| Creative       | Any       | Gemini/GPT  | gemini-2.5-flash       | Creative output           |
| Image Gen      | Any       | HuggingFace | flux-schnell           | Fast image generation     |
| Embeddings     | Any       | Local       | transformers.js        | Privacy, no cost          |
| Classification | Any       | Local       | transformers.js        | Fast, offline capable     |

#### Provider Selection Algorithm

```typescript
function selectProvider(analysis: IntentAnalysis, priority: Priority): Provider {
  // 1. Check user preferences
  if (userPreferences.forceProvider) {
    return userPreferences.forceProvider;
  }

  // 2. Check task type
  if (analysis.intent === 'code') {
    return 'claude'; // Always use Claude for code
  }

  // 3. Check complexity
  if (analysis.complexity === 'high') {
    return 'claude'; // Claude for complex tasks
  }

  // 4. Check priority
  if (priority === 'speed') {
    return 'gemini'; // Gemini is fastest
  }

  if (priority === 'quality') {
    return 'claude'; // Claude is highest quality
  }

  if (priority === 'cost') {
    return 'gemini'; // Gemini is cheapest
  }

  // 5. Load balancing
  const providers = getAvailableProviders();
  return selectLeastLoadedProvider(providers);
}
```

#### Fallback Chain

```
Primary Provider (e.g., Claude)
  ↓ (on failure)
Fallback 1 (e.g., Gemini)
  ↓ (on failure)
Fallback 2 (e.g., GPT)
  ↓ (on failure)
Error Response
```

**Fallback Triggers**:
- Rate limit (429)
- Service unavailable (503)
- Timeout (> 30s)
- Invalid response

### 3. Provider Adapters

Each AI provider has an adapter that normalizes the interface:

```typescript
interface AIProvider {
  chat(messages: Message[], options: ChatOptions): AsyncIterator<string>;
  complete(prompt: string, options: CompleteOptions): Promise<string>;
  embed(text: string): Promise<number[]>;
  generateImage(prompt: string, options: ImageOptions): Promise<ImageResult>;
}
```

#### Claude Adapter
```typescript
// File: chat-stream-with-routing/index.ts
const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2024-01-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    messages: normalizedMessages,
    stream: true,
  }),
});
```

#### Gemini Adapter
```typescript
// File: lovable-ai-router/index.ts
const geminiResponse = await lovable.chat.completions.create({
  model: 'google/gemini-2.5-flash',
  messages: normalizedMessages,
  stream: true,
});
```

#### HuggingFace Adapter
```typescript
// File: huggingface-inference/index.ts
const hfResponse = await fetch(
  `https://api-inference.huggingface.co/models/${model}`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt }),
  }
);
```

## Performance Optimizations

### 1. Caching
- **Model Responses**: Cache common queries (5 min TTL)
- **Provider Status**: Cache availability checks (1 min TTL)
- **User Preferences**: Cache in React Query (10 min TTL)

### 2. Parallel Requests
```typescript
// Check multiple providers simultaneously
const results = await Promise.race([
  callClaude(message),
  callGemini(message),
]);
```

### 3. Smart Timeouts
- **Fast Models** (Gemini): 10s timeout
- **Complex Models** (Claude): 30s timeout
- **Image Generation**: 60s timeout

### 4. Connection Pooling
- Reuse HTTP connections
- Keep-alive headers
- Connection limits per provider

## Cost Optimization

### Token Tracking
```typescript
{
  provider: 'claude',
  model: 'claude-sonnet-4-5',
  inputTokens: 1250,
  outputTokens: 850,
  totalTokens: 2100,
  estimatedCost: 0.0315, // $0.015/1K tokens
}
```

### Cost Limits
- **Per Request**: Max $0.50
- **Per User/Day**: Max $5.00
- **Anonymous/Day**: Max $0.10

### Cost-Based Routing
```typescript
if (estimatedCost > maxCost) {
  // Downgrade to cheaper model
  return 'gemini';
}
```

## Monitoring & Analytics

### Metrics Tracked
```typescript
{
  requestId: string,
  userId: string,
  provider: string,
  model: string,
  intent: string,
  complexity: string,
  latencyMs: number,
  tokensUsed: number,
  cost: number,
  success: boolean,
  errorType?: string,
  timestamp: string,
}
```

### Key Performance Indicators (KPIs)
- **Latency**: p50, p95, p99 response times
- **Success Rate**: % of successful requests
- **Cost per Request**: Average cost
- **Provider Uptime**: Availability %
- **Fallback Rate**: % of requests using fallback

### Dashboards
- **Real-time**: Live router metrics
- **Historical**: Trends over time
- **Per-Provider**: Provider-specific stats
- **Per-User**: User-specific patterns

## Error Handling

### Error Types
```typescript
enum RouterError {
  RATE_LIMIT = 'rate_limit',
  INSUFFICIENT_CREDITS = 'insufficient_credits',
  PROVIDER_UNAVAILABLE = 'provider_unavailable',
  INVALID_REQUEST = 'invalid_request',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}
```

### Error Responses
```typescript
{
  error: string,
  code: RouterError,
  requestId: string,
  retryAfter?: number, // For rate limits
  upgradeUrl?: string, // For credit issues
  fallbackUsed?: boolean,
}
```

### Retry Strategy
```typescript
const retryConfig = {
  maxRetries: 3,
  backoff: 'exponential', // 1s, 2s, 4s
  retryableErrors: [429, 503, 504],
};
```

## Security

### API Key Management
- Stored in Supabase secrets
- Validated on startup
- Rotated monthly
- Never exposed to client

### Rate Limiting
- **Per User**: 100 req/hour
- **Per IP**: 20 req/hour (anonymous)
- **Per Model**: Varies by provider limits

### Input Validation
```typescript
const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(10000),
  })),
  sessionId: z.string().uuid().optional(),
  forceAgent: z.string().optional(),
});
```

## Future Enhancements

1. **Multi-Model Ensembling**: Combine responses from multiple models
2. **Adaptive Learning**: Learn user preferences over time
3. **Edge Caching**: Cache responses at the edge
4. **WebGPU Inference**: Run models locally for privacy
5. **A/B Testing**: Test different routing strategies
6. **Custom Models**: Support fine-tuned models
7. **Real-time Switching**: Switch providers mid-conversation