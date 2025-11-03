import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const PAIN_POINTS = [
  'AI forgets context from previous conversations',
  'Switching between multiple AI tools wastes time',
  'No way to customize AI for your specific needs',
];

const DREAM_OUTCOMES = [
  'AI that remembers everything and learns from every interaction',
  'One platform with 9 integrated AI systems working together',
  'Build custom agents and share them with your team',
];

export function ProblemSolution() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="p-6 border-destructive/20 bg-destructive/5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-semibold">Tired of AI That Forgets?</h3>
        </div>
        <ul className="space-y-3">
          {PAIN_POINTS.map((pain, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="text-destructive mt-0.5">✗</span>
              <span className="text-muted-foreground">{pain}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6 border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Imagine AI That Evolves</h3>
        </div>
        <ul className="space-y-3">
          {DREAM_OUTCOMES.map((dream, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">✓</span>
              <span>{dream}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}