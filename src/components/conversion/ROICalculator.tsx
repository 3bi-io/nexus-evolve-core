import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, Clock, DollarSign } from 'lucide-react';

export function ROICalculator() {
  const [teamSize, setTeamSize] = useState(5);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  
  const hourlyRate = 75; // Average hourly rate
  const productivityMultiplier = 3; // Oneiros makes teams 3x faster
  
  const weeklyTimeSaved = hoursPerWeek * productivityMultiplier;
  const monthlyTimeSaved = weeklyTimeSaved * 4;
  const yearlyTimeSaved = monthlyTimeSaved * 12;
  
  const weeklySavings = weeklyTimeSaved * hourlyRate * teamSize;
  const monthlySavings = weeklySavings * 4;
  const yearlySavings = monthlySavings * 12;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Calculate Your ROI
        </CardTitle>
        <CardDescription>
          See how much time and money your team could save with Oneiros
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Team Size: {teamSize} people</Label>
            <Slider
              value={[teamSize]}
              onValueChange={(value) => setTeamSize(value[0])}
              min={1}
              max={50}
              step={1}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Hours spent on AI tasks per week: {hoursPerWeek}h</Label>
            <Slider
              value={[hoursPerWeek]}
              onValueChange={(value) => setHoursPerWeek(value[0])}
              min={1}
              max={40}
              step={1}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              Time Saved
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">{weeklyTimeSaved}h</p>
              <p className="text-sm text-muted-foreground">per week</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <DollarSign className="h-4 w-4" />
              Money Saved
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">
                ${monthlySavings.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
          <p className="font-semibold text-sm">Annual Impact:</p>
          <p className="text-3xl font-bold text-primary">
            ${yearlySavings.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            That's {yearlyTimeSaved.toLocaleString()} hours saved per year
          </p>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          * Based on $75/hour average rate and 3x productivity increase
        </p>
      </CardContent>
    </Card>
  );
}