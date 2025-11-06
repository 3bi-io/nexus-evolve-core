import { Activity, Zap, Lock, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function TrustIndicators() {
  const indicators = [
    {
      icon: Activity,
      label: 'API Status',
      value: 'Operational',
      color: 'text-green-500',
    },
    {
      icon: Zap,
      label: 'Avg Response',
      value: '<500ms',
      color: 'text-blue-500',
    },
    {
      icon: Lock,
      label: 'Security',
      value: 'Enterprise',
      color: 'text-purple-500',
    },
    {
      icon: TrendingUp,
      label: 'Uptime',
      value: '99.9%',
      color: 'text-primary',
    },
  ];

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {indicators.map((indicator) => (
          <div key={indicator.label} className="flex flex-col items-center gap-2">
            <indicator.icon className={`w-5 h-5 ${indicator.color}`} />
            <div className="text-center">
              <div className="text-sm font-semibold">{indicator.value}</div>
              <div className="text-xs text-muted-foreground">{indicator.label}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
