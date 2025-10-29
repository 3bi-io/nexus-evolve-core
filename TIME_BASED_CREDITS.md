# Time-Based Credit System

## Overview
The platform now uses a **time-based credit system** where each credit provides **300 seconds (5 minutes)** of usage time.

## How It Works

### Credit to Time Conversion
- **1 credit = 300 seconds (5 minutes)**
- **10 credits = 3000 seconds (50 minutes)**
- **100 credits = 30,000 seconds (500 minutes / 8.3 hours)**

### Usage Tracking
1. **Session Start**: When a user begins using the platform, a usage session starts automatically
2. **Real-Time Timer**: A live timer displays remaining time in the upper right corner
3. **Auto Deduction**: Credits are deducted based on elapsed time when the session ends
4. **Warnings**: Users receive alerts at 1 minute remaining

### Session Management

#### Automatic Session Start
- Sessions start automatically when user navigates to the app
- Works for both authenticated users and anonymous visitors
- Requires available credits to start

#### Session End Triggers
- User closes/leaves the app
- Time runs out (0 seconds remaining)
- Manual session termination

#### Credit Deduction
- Credits are deducted when session ends
- Calculation: `credits_used = ceil(elapsed_seconds / 300)`
- Rounds up to nearest credit (e.g., 301 seconds = 2 credits)

## User Experience

### Visual Indicators

#### Usage Timer (Top Right)
```
┌─────────────────────┐
│ 🕐 Time left        │
│    24:35            │
│ ▓▓▓▓▓▓▓░░░ 82%    │
└─────────────────────┘
```

**Color Coding:**
- Green: > 50% remaining
- Yellow: 20-50% remaining  
- Red: < 20% remaining

#### Credit Balance (Navigation)
- Shows total credits remaining
- Converts to total available time
- Links to pricing page

### Alerts & Notifications

**1 Minute Warning:**
```
⏰ 1 minute remaining
Your session will end soon. Save your work!
```

**Session Ended:**
```
❌ Session ended
You've run out of time. Please add more credits to continue.
```

## Technical Implementation

### Database Schema

#### `usage_sessions` Table
```sql
- id: UUID (primary key)
- user_id: UUID (nullable, for authenticated users)
- visitor_credit_id: UUID (nullable, for anonymous users)
- session_id: UUID (chat session reference)
- started_at: TIMESTAMP
- ended_at: TIMESTAMP (nullable)
- elapsed_seconds: INTEGER
- credits_deducted: INTEGER
- is_active: BOOLEAN
- metadata: JSONB
```

### Edge Functions

#### `manage-usage-session`
Handles session lifecycle management.

**Actions:**
1. **start** - Initialize new usage session
   - Checks credit availability
   - Creates session record
   - Returns session ID and remaining time

2. **stop** - End active session
   - Calculates elapsed time
   - Deducts credits
   - Updates session record

3. **check** - Query session status
   - Returns current elapsed time
   - Calculates remaining time
   - Returns credit balance

### Frontend Components

#### `<UsageTimer />`
Real-time countdown timer component.

**Features:**
- Auto-starts on mount
- Updates every second
- Shows warnings
- Auto-stops on unmount or time-out

**Props:** None (uses auth context)

**Location:** Fixed position, top-right corner

## Credit Plans & Time Allocations

### Free Tier
- **5 credits/day**
- **25 minutes/day** (1,500 seconds)

### Starter
- **100 credits/month**
- **8.3 hours/month** (30,000 seconds)

### Professional
- **500 credits/month**
- **41.7 hours/month** (150,000 seconds)

### Enterprise
- **2000 credits/month**
- **166.7 hours/month** (600,000 seconds)

## Migration from Message-Based

### Before (Message-Based)
- 1 credit per chat message
- 2 credits per reasoning task
- Fixed cost regardless of complexity

### After (Time-Based)
- 1 credit = 5 minutes of usage
- Cost based on time spent
- Fairer for long conversations vs quick questions

### Benefits
✅ **Predictable**: Users know exactly how long they can use the service  
✅ **Fair**: Heavy users pay more, light users pay less  
✅ **Flexible**: Encourages longer, deeper interactions  
✅ **Transparent**: Clear time display and warnings  

## Best Practices

### For Users
1. **Monitor Timer**: Keep an eye on remaining time
2. **Save Work**: Don't wait until last second
3. **Upgrade Early**: Add credits before running out
4. **Plan Sessions**: Budget time for tasks

### For Developers
1. **Test Edge Cases**: Zero credits, network failures
2. **Handle Errors**: Session start/stop failures
3. **Optimize Performance**: Minimize session overhead
4. **Monitor Usage**: Track average session lengths

## FAQs

**Q: What happens if I close the tab?**  
A: Session automatically stops and credits are deducted for time used.

**Q: Can I pause a session?**  
A: No, sessions run continuously. Close the app to stop usage.

**Q: Do I get charged if I'm idle?**  
A: Yes, time counts even if inactive. Close the app when not using.

**Q: How accurate is the timer?**  
A: Updates every second on client, final calculation on server.

**Q: What if I lose internet connection?**  
A: Session continues locally, syncs when reconnected.

**Q: Can I see my usage history?**  
A: Yes, view detailed history in Account page.

## Troubleshooting

### Timer Not Showing
- Check if user has credits
- Verify session started successfully
- Check browser console for errors

### Credits Not Deducting
- Ensure session is ending properly
- Check edge function logs
- Verify database updates

### Inaccurate Time
- Server time is source of truth
- Client timer is for display only
- Small discrepancies are normal

## Analytics & Monitoring

### Key Metrics
- Average session length
- Credit consumption rate
- Session abandonment rate
- Time-to-upgrade conversion

### Queries
```sql
-- Average session length
SELECT AVG(elapsed_seconds) as avg_session_seconds
FROM usage_sessions
WHERE ended_at IS NOT NULL;

-- Total time used today
SELECT SUM(elapsed_seconds) as total_seconds
FROM usage_sessions
WHERE DATE(started_at) = CURRENT_DATE;

-- Credits used per user
SELECT user_id, SUM(credits_deducted) as total_credits
FROM usage_sessions
GROUP BY user_id
ORDER BY total_credits DESC;
```

---

**System Status**: ✅ Active  
**Last Updated**: 2025-10-29  
**Version**: 1.0  
