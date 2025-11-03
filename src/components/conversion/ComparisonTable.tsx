import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

const FEATURES = [
  { name: 'Temporal Memory System', oneiros: true, chatgpt: false, claude: false, traditional: false },
  { name: 'Multi-Agent Orchestration', oneiros: true, chatgpt: false, claude: false, traditional: false },
  { name: 'Voice Conversations', oneiros: true, chatgpt: true, claude: false, traditional: false },
  { name: 'Self-Evolution & Learning', oneiros: true, chatgpt: false, claude: false, traditional: false },
  { name: 'Knowledge Graphs', oneiros: true, chatgpt: false, claude: false, traditional: false },
  { name: 'Agent Marketplace', oneiros: true, chatgpt: false, claude: false, traditional: false },
  { name: 'Social Intelligence', oneiros: true, chatgpt: false, claude: false, traditional: false },
  { name: 'Predictive Capabilities', oneiros: true, chatgpt: false, claude: false, traditional: false },
  { name: 'Emotional Intelligence', oneiros: true, chatgpt: false, claude: false, traditional: false },
  { name: 'Browser AI (local models)', oneiros: true, chatgpt: false, claude: false, traditional: false },
  { name: 'Custom Agent Builder', oneiros: true, chatgpt: true, claude: false, traditional: false },
  { name: 'Enterprise Security', oneiros: true, chatgpt: true, claude: true, traditional: true },
];

const PRODUCTS = [
  { name: 'Oneiros', highlight: true },
  { name: 'ChatGPT', highlight: false },
  { name: 'Claude', highlight: false },
  { name: 'Traditional AI', highlight: false },
];

export function ComparisonTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Why Choose Oneiros?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4 font-semibold">Feature</th>
                {PRODUCTS.map((product) => (
                  <th key={product.name} className="text-center py-4 px-4">
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-semibold">{product.name}</span>
                      {product.highlight && (
                        <Badge variant="default" className="text-xs">Best Choice</Badge>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, idx) => (
                <tr key={idx} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 text-sm">{feature.name}</td>
                  <td className="text-center py-3 px-4">
                    {feature.oneiros ? (
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mx-auto opacity-30" />
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {feature.chatgpt ? (
                      <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mx-auto opacity-30" />
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {feature.claude ? (
                      <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mx-auto opacity-30" />
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {feature.traditional ? (
                      <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mx-auto opacity-30" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}