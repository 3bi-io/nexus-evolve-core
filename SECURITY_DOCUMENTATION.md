# Security Documentation

## Overview
This document outlines the security measures implemented in the AI Assistant platform, including authentication, authorization, data protection, and best practices.

---

## 1. Authentication & Authorization

### User Authentication
- **Provider**: Supabase Auth
- **Methods**: Email/Password, Magic Links, OAuth (Google, GitHub)
- **Session Management**: JWT tokens with automatic refresh
- **Password Security**: 
  - Minimum 8 characters required
  - Leaked password protection enabled
  - Bcrypt hashing (handled by Supabase)

### Role-Based Access Control (RBAC)

#### User Roles
Stored in `user_roles` table with enum type `app_role`:
- `super_admin`: Full system access, can manage users and view all data
- `admin`: Can manage content and moderate users
- `moderator`: Can moderate content
- `user`: Standard user access (default)

#### Role Checking Functions
```sql
-- Check if user has specific role
has_role(_user_id uuid, _role app_role) → boolean

-- Check if user is admin (super_admin or admin)
is_admin(_user_id uuid) → boolean
```

**Security**: These functions use `SECURITY DEFINER` with `SET search_path = public` to prevent privilege escalation.

---

## 2. Row-Level Security (RLS)

All tables have RLS enabled with policies based on user ownership or role.

### Policy Patterns

#### User-Owned Data
```sql
-- Users can view their own data
CREATE POLICY "Users can view own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data"
ON table_name FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

#### Admin Access
```sql
-- Super admins can view all data
CREATE POLICY "Super admins can view all"
ON table_name FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));
```

### Critical Tables with RLS

| Table | Policies | Notes |
|-------|----------|-------|
| `interactions` | User-owned + Super Admin | Contains all chat messages |
| `sessions` | User-owned + Super Admin | User session history |
| `agent_memory` | User-owned + Super Admin | AI context and memories |
| `knowledge_base` | User-owned + Super Admin | User knowledge entries |
| `credit_transactions` | Read-only for users | Credit usage logs |
| `user_subscriptions` | User read-only | Subscription details |
| `visitor_credits` | Service role only | Anonymous user tracking |
| `rate_limit_log` | Service role only | Rate limiting data |

---

## 3. Data Protection

### Encryption

#### At Rest
- Database: PostgreSQL encryption via Supabase
- Backups: Encrypted by Supabase platform
- Secrets: Encrypted vault storage

#### In Transit
- All connections use TLS 1.2+
- Strict HTTPS enforcement
- Secure WebSocket connections

#### IP Address Encryption
```sql
-- Encrypt visitor IP addresses
encrypt_ip(ip_address text, encryption_key text) → text

-- Decrypt when needed (admin only)
decrypt_ip(encrypted_ip text, encryption_key text) → text
```

### Sensitive Data Handling

**Personally Identifiable Information (PII)**:
- IP addresses: Encrypted and hashed
- Emails: Stored in Supabase Auth (encrypted)
- User content: Encrypted at rest

**Credit Card Data**: 
- Never stored in our database
- Handled entirely by Stripe

---

## 4. Rate Limiting

### Edge Function Rate Limiting

Implemented via shared middleware (`_shared/rate-limit.ts`):

```typescript
import { checkRateLimit, getClientIP } from '../_shared/rate-limit.ts';

// In edge function
const clientIP = getClientIP(req);
const rateLimit = await checkRateLimit({
  maxRequests: 100,
  windowMinutes: 60,
  identifier: clientIP
});

if (!rateLimit.allowed) {
  return createRateLimitResponse(rateLimit, corsHeaders);
}
```

### Rate Limit Policies

| Function | Max Requests | Window | Identifier |
|----------|--------------|--------|------------|
| `chat-stream-with-routing` | 60 | 1 hour | User ID |
| `manage-usage-session` | 100 | 1 hour | IP or User ID |
| `check-and-deduct-credits` | 200 | 1 hour | IP or User ID |
| `send-low-credit-alert` | N/A | Cron only | N/A |

### Database Rate Limiting

Implemented via `check_rate_limit()` function for anonymous users:
- 100 requests per hour per IP
- IP-based tracking via hashed addresses
- Automatic cleanup of old logs

---

## 5. Edge Function Security

### JWT Verification

Most edge functions require valid JWT:
```toml
[functions.function-name]
verify_jwt = true  # Default
```

### Public Functions (JWT Disabled)

Only the following functions are public:
- `check-and-deduct-credits`: Handles both auth and anon
- `manage-usage-session`: Handles both auth and anon
- `reasoning-agent`: Public API endpoint
- `reset-daily-credits`: Cron job only
- `process-subscription-renewals`: Cron job only
- `send-low-credit-alert`: Cron job only
- `process-referral-conversion`: Webhook/internal

**Security Measures for Public Functions**:
1. Rate limiting on all endpoints
2. Input validation using Zod schemas
3. IP-based tracking for anonymous users
4. Signature verification for webhooks

### CORS Configuration

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

**Production Recommendation**: Restrict `Access-Control-Allow-Origin` to your domain.

---

## 6. Input Validation

### Client-Side Validation

Using Zod schemas for all forms:
```typescript
import { z } from 'zod';

const messageSchema = z.object({
  message: z.string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message too long"),
  sessionId: z.string().uuid(),
});
```

### Server-Side Validation

All edge functions validate inputs:
```typescript
// In edge function
const schema = z.object({
  userId: z.string().uuid().optional(),
  ipAddress: z.string().ip().optional(),
});

const validated = schema.safeParse(data);
if (!validated.success) {
  return new Response(
    JSON.stringify({ error: 'Invalid input' }),
    { status: 400, headers: corsHeaders }
  );
}
```

### SQL Injection Prevention

- **No raw SQL in edge functions**: Use Supabase client methods
- **Parameterized queries**: All DB functions use proper parameters
- **Input sanitization**: Zod validation before DB operations

---

## 7. SECURITY DEFINER Functions

### What are SECURITY DEFINER Functions?

Functions that execute with the privileges of the function owner, not the caller. Required for RLS bypass in specific cases.

### Security Best Practices

All SECURITY DEFINER functions MUST:
1. Set `search_path = public` to prevent privilege escalation
2. Validate all inputs
3. Use explicit schema qualification (`public.table_name`)
4. Have clear documentation

### Current SECURITY DEFINER Functions

| Function | Purpose | Risk Level |
|----------|---------|------------|
| `has_role()` | Check user roles | Low |
| `is_admin()` | Check admin status | Low |
| `encrypt_ip()` | Encrypt IP addresses | Low |
| `decrypt_ip()` | Decrypt IP addresses | Medium |
| `process_referral_signup()` | Process referrals | Low |
| `check_rate_limit()` | Rate limit checking | Low |
| `cleanup_rate_limit_logs()` | Clean old logs | Low |
| `initialize_user_subscription()` | Auto-create subscriptions | Medium |
| `create_user_referral_code()` | Auto-create referral codes | Low |

**All functions have been updated with `SET search_path = public`** ✅

---

## 8. Secrets Management

### Environment Variables

Stored in Supabase Vault:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `LOVABLE_API_KEY`

### Access Control

- Service role key: Only used in edge functions
- Never exposed to client
- Rotated regularly (recommended)

---

## 9. Credit System Security

### Credit Deduction Flow

1. Client requests operation
2. Edge function validates JWT (if required)
3. `check-and-deduct-credits` function called
4. Credits deducted atomically
5. Transaction logged immutably

### Anti-Fraud Measures

- **Double-spend prevention**: Atomic transactions
- **Usage tracking**: All operations logged
- **Rate limiting**: Prevents abuse
- **IP tracking**: Anonymous user monitoring

### Visitor Credit System

- Daily credit limits (5 credits)
- Consecutive day tracking
- Automatic reset at midnight UTC
- GDPR compliance (30-day data retention)

---

## 10. Monitoring & Logging

### Security Events Logged

- Authentication attempts
- Credit transactions
- Rate limit violations
- Failed API calls
- Admin actions

### Log Retention

| Log Type | Retention | Location |
|----------|-----------|----------|
| Credit transactions | Indefinite | `credit_transactions` |
| Rate limit logs | 2 hours | `rate_limit_log` |
| Cron job logs | 90 days | `cron_job_logs` |
| Edge function logs | 7 days | Supabase Dashboard |
| Auth logs | 7 days | Supabase Dashboard |

---

## 11. Compliance

### GDPR Compliance

- **Right to erasure**: User data deletion via cascade
- **Data minimization**: Only essential data collected
- **IP anonymization**: IP addresses encrypted
- **Retention policies**: Automatic cleanup of old data

### Data Processing

- All user content encrypted at rest
- Minimal data shared with third parties
- Clear privacy policy and terms of service

---

## 12. Production Checklist

### Before Going Live

- [x] Enable leaked password protection in Supabase Auth
- [x] Set `search_path` on all SECURITY DEFINER functions
- [x] Review and document all security functions
- [x] Implement rate limiting on edge functions
- [x] Test all RLS policies
- [ ] Restrict CORS to production domain
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Review and rotate API keys
- [ ] Enable 2FA for admin accounts
- [ ] Set up incident response plan

### Supabase Auth Configuration

**URL Configuration** (Auth > URL Configuration):
- Site URL: `https://yourapp.com`
- Redirect URLs: Add production and preview URLs

**Security Settings** (Auth > Providers):
- Enable leaked password protection ✅
- Set minimum password requirements
- Configure rate limits

---

## 13. Security Contacts

For security issues or vulnerabilities:
- Email: security@yourapp.com
- Bug Bounty: [Link to bug bounty program]

---

## Last Updated
2025-10-29 - Phase 5: Security Hardening Complete