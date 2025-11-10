# Notification System

Real-time notification system for alerting users about important events in the AI platform.

## Features

- **Real-time Updates**: Uses Supabase Realtime to instantly display new notifications
- **Auto-Approval Alerts**: Notifies users when capabilities are auto-approved (confidence > 80%) during daily evolution cycle
- **Unread Count Badge**: Shows number of unread notifications in the bell icon
- **Toast Notifications**: Displays toast messages when new notifications arrive
- **Mark as Read**: Click notifications to mark them as read
- **Bulk Actions**: Mark all notifications as read at once
- **Delete Notifications**: Remove individual notifications

## Components

### NotificationBell
Main component that displays the bell icon with unread count badge in the header.

```tsx
import { NotificationBell } from "@/components/notifications/NotificationBell";

<NotificationBell />
```

### NotificationPanel
Dropdown panel showing all notifications with actions.

### NotificationItem
Individual notification item with icon, title, message, and timestamp.

## Hook

### useNotifications
React hook for managing notification state and actions.

```tsx
import { useNotifications } from "@/hooks/useNotifications";

function MyComponent() {
  const {
    notifications,      // All notifications
    unreadCount,        // Number of unread notifications
    isLoading,          // Loading state
    markAsRead,         // Mark single notification as read
    markAllAsRead,      // Mark all as read
    deleteNotification, // Delete notification
    refresh             // Manually refresh notifications
  } = useNotifications();
}
```

## Notification Types

- `capability_approved` - New capability auto-approved (confidence > 80%)
- `evolution_complete` - Daily evolution cycle completed
- `behavior_deactivated` - Ineffective behavior deactivated
- `experiment_concluded` - A/B experiment concluded with winner
- `system_alert` - General system alerts

## Database Schema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Real-time Subscription

The notification system uses Supabase Realtime to listen for new notifications:

```typescript
supabase
  .channel('notifications-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${user.id}`
  }, (payload) => {
    // Handle new notification
  })
  .subscribe();
```

## Creating Notifications

Notifications are automatically created by edge functions during automated processes:

```typescript
// In edge function (e.g., evolve-system)
await supabase
  .from('notifications')
  .insert({
    user_id: user.id,
    type: 'capability_approved',
    title: '✨ New Capability Auto-Approved',
    message: `"${capabilityName}" has been automatically approved and activated.`,
    metadata: {
      capability_name: capabilityName,
      confidence_score: 0.85
    }
  });
```

## Integration

The NotificationBell is integrated into the UnifiedHeader component and appears in:
- Public header (when user is logged in)
- App header (in authenticated pages)

## Styling

Notifications use semantic tokens from the design system:
- Unread notifications have a subtle primary background
- Icons are color-coded by type (success, primary, warning, accent)
- Badge shows unread count with destructive variant
- Hover effects for better UX

## Future Enhancements

- Email/SMS notifications for critical alerts
- Notification preferences (opt-in/opt-out by type)
- Notification history page
- Mark as read without opening
- Notification sound effects
- Desktop push notifications (PWA)
