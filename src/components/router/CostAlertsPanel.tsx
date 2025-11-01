import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnterpriseRouter } from '@/hooks/useEnterpriseRouter';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Bell, Loader2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const CostAlertsPanel = () => {
  const { costAlerts, createCostAlert, loading } = useEnterpriseRouter();
  const [newAlert, setNewAlert] = useState({
    type: 'daily_spend',
    threshold: 1.0,
    period: 'daily' as 'hourly' | 'daily' | 'weekly' | 'monthly'
  });
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    await createCostAlert(newAlert.type, newAlert.threshold, newAlert.period);
    setCreating(false);
    setDialogOpen(false);
    setNewAlert({
      type: 'daily_spend',
      threshold: 1.0,
      period: 'daily'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cost Alerts</h2>
          <p className="text-muted-foreground">
            Set budget alerts and spending notifications
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Cost Alert</DialogTitle>
              <DialogDescription>
                Get notified when spending exceeds your threshold
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Alert Type</Label>
                <Input
                  placeholder="e.g., Daily Spend Alert"
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Threshold ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="1.00"
                  value={newAlert.threshold}
                  onChange={(e) => setNewAlert({
                    ...newAlert,
                    threshold: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Period</Label>
                <Select
                  value={newAlert.period}
                  onValueChange={(v: any) => setNewAlert({ ...newAlert, period: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreate}
                disabled={creating || !newAlert.type || newAlert.threshold <= 0}
                className="w-full"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Alert'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {costAlerts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No cost alerts configured. Create one to monitor spending.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {costAlerts.map(alert => {
            const percentage = (alert.current_amount / alert.threshold_amount) * 100;
            const isTriggered = !!alert.triggered_at;
            const isNearLimit = percentage >= 80;

            return (
              <Card key={alert.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {alert.alert_type}
                        {isTriggered ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Triggered
                          </Badge>
                        ) : isNearLimit ? (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Bell className="h-3 w-3" />
                            Near Limit
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {alert.period.charAt(0).toUpperCase() + alert.period.slice(1)} budget
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Spend</span>
                      <span className="font-medium">
                        ${alert.current_amount.toFixed(2)} / ${alert.threshold_amount.toFixed(2)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% used</span>
                      <span>${(alert.threshold_amount - alert.current_amount).toFixed(2)} remaining</span>
                    </div>
                  </div>

                  {isTriggered && alert.triggered_at && (
                    <div className="p-3 bg-destructive/10 rounded-lg text-sm">
                      <p className="font-medium text-destructive">
                        Alert triggered on {new Date(alert.triggered_at).toLocaleString()}
                      </p>
                      <p className="text-muted-foreground mt-1">
                        Spending exceeded ${alert.threshold_amount.toFixed(2)} threshold
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
