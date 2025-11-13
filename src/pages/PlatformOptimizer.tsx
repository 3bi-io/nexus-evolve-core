import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageLoading } from '@/components/ui/loading-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ErrorBoundaryWrapper } from "@/components/ErrorBoundaryWrapper";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Sparkles, Play, AlertTriangle, CheckCircle2, Clock, 
  TrendingUp, Shield, Zap, Eye, Settings, RefreshCw,
  Code, FileCode, Activity, BarChart3, Search, Filter, Github
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PlatformAnalysisRunner } from '@/components/admin/sections/PlatformAnalysisRunner';
import { GitHubSettings } from '@/components/admin/sections/GitHubSettings';

interface Improvement {
  id: string;
  improvement_type: string;
  severity: string;
  target_file: string;
  target_component: string;
  issue_description: string;
  improved_code: string;
  rationale: string;
  impact_score: number;
  confidence_score: number;
  ai_model_used: string;
  status: string;
  auto_apply_eligible: boolean;
  created_at: string;
}

interface AnalysisRun {
  id: string;
  run_type: string;
  improvements_found: number;
  critical_issues: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  providers_used: string[];
  analysis_duration_ms: number;
  status: string;
  started_at: string;
  completed_at: string;
}

interface AutoApplyConfig {
  enabled: boolean;
  auto_apply_performance: boolean;
  auto_apply_security: boolean;
  auto_apply_accessibility: boolean;
  auto_apply_code_quality: boolean;
  min_confidence_score: number;
  max_changes_per_run: number;
  github_auto_commit: boolean;
  github_create_pr: boolean;
}

export default function PlatformOptimizer() {
  const { user } = useAuth();
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [analysisRuns, setAnalysisRuns] = useState<AnalysisRun[]>([]);
  const [config, setConfig] = useState<AutoApplyConfig | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedImprovement, setSelectedImprovement] = useState<Improvement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadData();
    
    // Set up real-time subscriptions
    const improvementsChannel = supabase
      .channel('improvements-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'platform_improvements' },
        () => loadImprovements()
      )
      .subscribe();

    const runsChannel = supabase
      .channel('runs-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'improvement_analysis_runs' },
        () => loadAnalysisRuns()
      )
      .subscribe();

    return () => {
      improvementsChannel.unsubscribe();
      runsChannel.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadImprovements(),
      loadAnalysisRuns(),
      loadConfig()
    ]);
  };

  const loadImprovements = async () => {
    const { data } = await supabase
      .from('platform_improvements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (data) setImprovements(data);
  };

  const loadAnalysisRuns = async () => {
    const { data } = await supabase
      .from('improvement_analysis_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);
    
    if (data) setAnalysisRuns(data);
  };

  const loadConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('platform_optimizer_config')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) setConfig(data as any);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const runAnalysis = async () => {
    setIsRunning(true);
    toast.info('Starting AI platform analysis...');

    try {
      const { data, error } = await supabase.functions.invoke('ai-platform-optimizer', {
        body: { runType: 'manual' }
      });

      if (error) throw error;

      toast.success(`Analysis complete! Found ${data.improvementsFound} improvements`);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to run analysis');
    } finally {
      setIsRunning(false);
    }
  };

  const updateConfig = async (updates: Partial<AutoApplyConfig>) => {
    if (!config) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('platform_optimizer_config')
        .upsert({
          ...(config as any),
          ...updates,
          user_id: user.id,
        });

      if (error) {
        toast.error('Failed to update configuration');
      } else {
        setConfig({ ...config, ...updates });
        toast.success('Configuration updated');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Failed to update configuration');
    }
  };

  const applyImprovement = async (improvement: Improvement, createPR: boolean = false) => {
    const { error } = await supabase
      .from('platform_improvements')
      .update({ status: 'approved', applied_at: new Date().toISOString() })
      .eq('id', improvement.id);

    if (error) {
      toast.error('Failed to apply improvement');
    } else {
      toast.success('Improvement approved!');
      
      // Create GitHub PR if requested
      if (createPR && config) {
        await createGitHubPR(improvement);
      }
      
      loadImprovements();
    }
  };

  const createGitHubPR = async (improvement: Improvement) => {
    try {
      toast.info('Creating GitHub pull request...');

      const { data, error } = await supabase.functions.invoke('github-pr-creator', {
        body: {
          improvementId: improvement.id,
          repoUrl: (config as any)?.github_repo_url,
          baseBranch: (config as any)?.github_base_branch || 'main',
          title: `${improvement.improvement_type}: ${improvement.target_component || improvement.target_file}`,
          description: `${improvement.issue_description}\n\n**Rationale:** ${improvement.rationale}\n\n**Impact Score:** ${improvement.impact_score}/10\n**Confidence:** ${(improvement.confidence_score * 100).toFixed(0)}%`,
          fileChanges: [{
            path: improvement.target_file,
            content: improvement.improved_code,
          }],
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(
          <div>
            Pull request created!{' '}
            <a 
              href={data.pr_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              View PR #{data.pr_number}
            </a>
          </div>,
          { duration: 5000 }
        );
        loadImprovements();
      } else {
        throw new Error(data.error || 'Failed to create PR');
      }
    } catch (error: any) {
      console.error('Error creating GitHub PR:', error);
      toast.error(`Failed to create PR: ${error.message}`);
    }
  };

  const rejectImprovement = async (improvement: Improvement) => {
    const { error } = await supabase
      .from('platform_improvements')
      .update({ status: 'rejected' })
      .eq('id', improvement.id);

    if (error) {
      toast.error('Failed to reject improvement');
    } else {
      toast.success('Improvement rejected');
      loadImprovements();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'accessibility': return <Eye className="h-4 w-4" />;
      case 'code_quality': return <Code className="h-4 w-4" />;
      case 'ux': return <Sparkles className="h-4 w-4" />;
      default: return <FileCode className="h-4 w-4" />;
    }
  };

  // Filter improvements
  const filteredImprovements = improvements.filter(imp => {
    if (searchQuery && !imp.issue_description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !imp.target_file.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus !== 'all' && imp.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && imp.severity !== filterSeverity) return false;
    if (filterType !== 'all' && imp.improvement_type !== filterType) return false;
    return true;
  });

  const stats = {
    total: improvements.length,
    pending: improvements.filter(i => i.status === 'pending').length,
    approved: improvements.filter(i => i.status === 'approved').length,
    applied: improvements.filter(i => i.status === 'applied').length,
    critical: improvements.filter(i => i.severity === 'critical').length
  };

  return (
    <ErrorBoundaryWrapper
      fallbackTitle="Platform Optimizer Error"
      fallbackMessage="The platform optimizer encountered an error. Please try refreshing the page."
    >
      <AppLayout title="Platform Optimizer" showBottomNav>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Platform Optimizer
            </h1>
            <p className="text-muted-foreground mt-1">
              Continuous AI-powered platform improvements running every 6 hours
            </p>
          </div>
          <Button 
            onClick={runAnalysis} 
            disabled={isRunning}
            size="lg"
            className="gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Analysis Now
              </>
            )}
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Improvements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Applied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.applied}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="scan" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scan">Run Scan</TabsTrigger>
            <TabsTrigger value="improvements">
              Improvements
              {stats.pending > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {stats.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="runs">Analysis Runs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-4">
            <PlatformAnalysisRunner />
          </TabsContent>

          <TabsContent value="improvements" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-5">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search improvements..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="accessibility">Accessibility</SelectItem>
                      <SelectItem value="code_quality">Code Quality</SelectItem>
                      <SelectItem value="ux">UX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            {/* Results count */}
            {filteredImprovements.length > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {filteredImprovements.length} of {improvements.length} improvements
                </span>
                {(searchQuery || filterStatus !== 'all' || filterSeverity !== 'all' || filterType !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                      setFilterSeverity('all');
                      setFilterType('all');
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {improvements.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No improvements found yet</p>
                  <Button onClick={runAnalysis} className="mt-4">Run First Analysis</Button>
                </CardContent>
              </Card>
            ) : filteredImprovements.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No improvements match your filters</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                      setFilterSeverity('all');
                      setFilterType('all');
                    }}
                    className="mt-4"
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredImprovements.map((improvement) => (
                  <motion.div
                    key={improvement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">{getTypeIcon(improvement.improvement_type)}</div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-lg">
                                  {improvement.target_component || improvement.target_file}
                                </CardTitle>
                                <Badge variant={getSeverityColor(improvement.severity) as any}>
                                  {improvement.severity}
                                </Badge>
                                <Badge variant="outline">
                                  {improvement.improvement_type}
                                </Badge>
                                {improvement.auto_apply_eligible && (
                                  <Badge variant="secondary" className="gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Auto-apply eligible
                                  </Badge>
                                )}
                              </div>
                              <CardDescription>{improvement.issue_description}</CardDescription>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Impact: {improvement.impact_score.toFixed(1)}/10</span>
                                <span>Confidence: {(improvement.confidence_score * 100).toFixed(0)}%</span>
                                <span>{improvement.ai_model_used}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {improvement.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => applyImprovement(improvement, false)}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                {(config as any)?.github_repo_url && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => applyImprovement(improvement, true)}
                                  >
                                    Create PR
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => rejectImprovement(improvement)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {improvement.status === 'approved' && (config as any)?.github_repo_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => createGitHubPR(improvement)}
                              >
                                Create PR
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedImprovement(improvement)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {selectedImprovement?.id === improvement.id && (
                        <CardContent className="space-y-4 border-t pt-4">
                          <div>
                            <Label className="text-sm font-semibold">Rationale</Label>
                            <p className="text-sm text-muted-foreground mt-1">{improvement.rationale}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-semibold">Improved Code</Label>
                            <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">
                              <code>{improvement.improved_code}</code>
                            </pre>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="runs" className="space-y-4">
            <div className="grid gap-4">
              {analysisRuns.map((run) => (
                <Card key={run.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          {run.run_type.charAt(0).toUpperCase() + run.run_type.slice(1)} Run
                        </CardTitle>
                        <CardDescription>
                          {new Date(run.started_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge variant={run.status === 'completed' ? 'default' : 'secondary'}>
                        {run.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Found</div>
                        <div className="text-xl font-bold">{run.improvements_found}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Critical</div>
                        <div className="text-xl font-bold text-red-500">{run.critical_issues}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">High</div>
                        <div className="text-xl font-bold text-orange-500">{run.high_priority}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Medium</div>
                        <div className="text-xl font-bold text-yellow-500">{run.medium_priority}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Duration</div>
                        <div className="text-xl font-bold">
                          {(run.analysis_duration_ms / 1000).toFixed(1)}s
                        </div>
                      </div>
                    </div>
                    {run.providers_used && run.providers_used.length > 0 && (
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">AI Providers:</span>
                        {run.providers_used.map((provider) => (
                          <Badge key={provider} variant="outline">{provider}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <GitHubSettings />
            
            {config && (
              <>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Full automation is enabled.</strong> The system will automatically analyze
                    and suggest improvements every 6 hours. High-confidence improvements can be auto-applied
                    based on the settings below.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Auto-Apply Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure which types of improvements can be automatically applied
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Auto-Apply</Label>
                        <div className="text-sm text-muted-foreground">
                          Master switch for automatic improvement application
                        </div>
                      </div>
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(checked) => updateConfig({ enabled: checked })}
                      />
                    </div>

                    <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Security Fixes
                          </Label>
                          <div className="text-sm text-muted-foreground">
                            Automatically apply security vulnerability fixes
                          </div>
                        </div>
                        <Switch
                          checked={config.auto_apply_security}
                          onCheckedChange={(checked) => updateConfig({ auto_apply_security: checked })}
                          disabled={!config.enabled}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Performance Optimizations
                          </Label>
                          <div className="text-sm text-muted-foreground">
                            Automatically apply performance improvements
                          </div>
                        </div>
                        <Switch
                          checked={config.auto_apply_performance}
                          onCheckedChange={(checked) => updateConfig({ auto_apply_performance: checked })}
                          disabled={!config.enabled}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Accessibility Improvements
                          </Label>
                          <div className="text-sm text-muted-foreground">
                            Automatically apply accessibility fixes
                          </div>
                        </div>
                        <Switch
                          checked={config.auto_apply_accessibility}
                          onCheckedChange={(checked) => updateConfig({ auto_apply_accessibility: checked })}
                          disabled={!config.enabled}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Code Quality
                          </Label>
                          <div className="text-sm text-muted-foreground">
                            Automatically apply code quality improvements
                          </div>
                        </div>
                        <Switch
                          checked={config.auto_apply_code_quality}
                          onCheckedChange={(checked) => updateConfig({ auto_apply_code_quality: checked })}
                          disabled={!config.enabled}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Minimum Confidence Score</Label>
                      <div className="text-sm text-muted-foreground mb-2">
                        Only apply improvements with confidence above: {(config.min_confidence_score * 100).toFixed(0)}%
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={config.min_confidence_score * 100}
                        onChange={(e) => updateConfig({ min_confidence_score: parseInt(e.target.value) / 100 })}
                        className="w-full"
                        disabled={!config.enabled}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Max Changes Per Run</Label>
                      <div className="text-sm text-muted-foreground mb-2">
                        Maximum number of improvements to apply per analysis: {config.max_changes_per_run}
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={config.max_changes_per_run}
                        onChange={(e) => updateConfig({ max_changes_per_run: parseInt(e.target.value) })}
                        className="w-full"
                        disabled={!config.enabled}
                      />
                    </div>

                    <Alert>
                      <AlertDescription>
                        <strong>Note:</strong> GitHub API integration is required for automatic code commits.
                        Currently, improvements are marked as "approved" but require manual application.
                        Connect your GitHub account in project settings to enable full automation.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
      </AppLayout>
    </ErrorBoundaryWrapper>
  );
}
