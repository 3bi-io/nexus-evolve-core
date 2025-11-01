import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnterpriseRouter } from '@/hooks/useEnterpriseRouter';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Plus, Trophy } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const ABTestingPanel = () => {
  const { abTests, createABTest, endABTest, loading } = useEnterpriseRouter();
  const [newTest, setNewTest] = useState({
    name: '',
    variantA: { provider: 'lovable', model: 'google/gemini-2.5-flash' },
    variantB: { provider: 'huggingface', model: 'gpt2' }
  });
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreate = async () => {
    if (!newTest.name) return;
    setCreating(true);
    await createABTest(newTest.name, newTest.variantA, newTest.variantB);
    setCreating(false);
    setDialogOpen(false);
    setNewTest({
      name: '',
      variantA: { provider: 'lovable', model: 'google/gemini-2.5-flash' },
      variantB: { provider: 'huggingface', model: 'gpt2' }
    });
  };

  const handleEnd = async (testId: string, winner?: string) => {
    await endABTest(testId, winner);
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
          <h2 className="text-2xl font-bold">A/B Testing</h2>
          <p className="text-muted-foreground">
            Compare provider performance with split testing
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Test
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create A/B Test</DialogTitle>
              <DialogDescription>
                Compare two providers or models to find the best option
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Test Name</Label>
                <Input
                  placeholder="e.g., Chat Speed Test"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Variant A Provider</Label>
                  <Select
                    value={newTest.variantA.provider}
                    onValueChange={(v) => setNewTest({
                      ...newTest,
                      variantA: { ...newTest.variantA, provider: v }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lovable">Lovable AI</SelectItem>
                      <SelectItem value="huggingface">HuggingFace</SelectItem>
                      <SelectItem value="browser">Browser AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Variant B Provider</Label>
                  <Select
                    value={newTest.variantB.provider}
                    onValueChange={(v) => setNewTest({
                      ...newTest,
                      variantB: { ...newTest.variantB, provider: v }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lovable">Lovable AI</SelectItem>
                      <SelectItem value="huggingface">HuggingFace</SelectItem>
                      <SelectItem value="browser">Browser AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleCreate}
                disabled={creating || !newTest.name}
                className="w-full"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Test'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {abTests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No A/B tests yet. Create one to compare providers.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {abTests.map(test => {
            const totalCalls = test.variant_a_calls + test.variant_b_calls;
            const aSuccessRate = test.variant_a_calls > 0 ? test.variant_a_success * 100 : 0;
            const bSuccessRate = test.variant_b_calls > 0 ? test.variant_b_success * 100 : 0;

            return (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {test.test_name}
                        {test.active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Ended</Badge>
                        )}
                        {test.winner && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {test.winner}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Started {new Date(test.started_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {test.active && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEnd(test.id, test.variant_a_config.provider)}
                        >
                          Choose A
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEnd(test.id, test.variant_b_config.provider)}
                        >
                          Choose B
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEnd(test.id)}
                        >
                          End
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Variant A</h4>
                        <Badge>{test.variant_a_config.provider}</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Calls</span>
                          <span className="font-medium">{test.variant_a_calls}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Success Rate</span>
                          <span className="font-medium">{aSuccessRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Latency</span>
                          <span className="font-medium">{test.variant_a_avg_latency.toFixed(0)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Cost</span>
                          <span className="font-medium">${test.variant_a_total_cost.toFixed(4)}</span>
                        </div>
                      </div>
                      {totalCalls > 0 && (
                        <Progress
                          value={(test.variant_a_calls / totalCalls) * 100}
                          className="h-2"
                        />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Variant B</h4>
                        <Badge>{test.variant_b_config.provider}</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Calls</span>
                          <span className="font-medium">{test.variant_b_calls}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Success Rate</span>
                          <span className="font-medium">{bSuccessRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Latency</span>
                          <span className="font-medium">{test.variant_b_avg_latency.toFixed(0)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Cost</span>
                          <span className="font-medium">${test.variant_b_total_cost.toFixed(4)}</span>
                        </div>
                      </div>
                      {totalCalls > 0 && (
                        <Progress
                          value={(test.variant_b_calls / totalCalls) * 100}
                          className="h-2"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
