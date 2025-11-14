import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Flag, CheckCircle, XCircle } from "lucide-react";
import { useAdminAudit } from "@/hooks/useAdminAudit";
import { format } from "date-fns";

interface AgentReview {
  id: string;
  agent_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  is_verified_purchase: boolean;
}

interface CustomAgent {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  user_id: string;
}

export function ContentModeration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logAction } = useAdminAudit();

  const { data: flaggedReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['admin', 'flagged-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_reviews')
        .select('*')
        .lte('rating', 2)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as AgentReview[];
    }
  });

  const { data: publicAgents, isLoading: agentsLoading } = useQuery({
    queryKey: ['admin', 'public-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_agents')
        .select('*')
        .eq('is_public', true)
        .eq('is_template', false)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as CustomAgent[];
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('agent_reviews')
        .delete()
        .eq('id', reviewId);
      if (error) throw error;
      return reviewId;
    },
    onSuccess: async (reviewId) => {
      await logAction({
        action_type: 'delete_review',
        target_type: 'agent_review',
        target_id: reviewId,
        details: { action: 'moderation_delete' }
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'flagged-reviews'] });
      toast({ title: "Review deleted successfully" });
    }
  });

  const updateAgentVisibilityMutation = useMutation({
    mutationFn: async ({ agentId, isPublic }: { agentId: string; isPublic: boolean }) => {
      const { error } = await supabase
        .from('custom_agents')
        .update({ is_public: isPublic })
        .eq('id', agentId);
      if (error) throw error;
      return { agentId, isPublic };
    },
    onSuccess: async ({ agentId, isPublic }) => {
      await logAction({
        action_type: 'update_agent_visibility',
        target_type: 'custom_agent',
        target_id: agentId,
        details: { is_public: isPublic, action: 'moderation' }
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'public-agents'] });
      toast({ title: `Agent ${!isPublic ? 'hidden' : 'approved'}` });
    }
  });

  if (reviewsLoading || agentsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Content Moderation</h2>
        <p className="text-muted-foreground">Review and moderate user-generated content</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Flagged Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedReviews?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Reviews with rating ≤ 2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Public Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publicAgents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">Flagged Reviews</TabsTrigger>
          <TabsTrigger value="agents">Public Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Low-Rated Reviews</CardTitle>
              <CardDescription>Reviews that may need moderation</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedReviews?.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <Badge variant="destructive">{review.rating} ⭐</Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{review.review_text}</TableCell>
                      <TableCell>{format(new Date(review.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {review.is_verified_purchase ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReviewMutation.mutate(review.id)}
                          disabled={deleteReviewMutation.isPending}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Public Custom Agents</CardTitle>
              <CardDescription>Agents visible to all users</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publicAgents?.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell className="max-w-md truncate">{agent.description}</TableCell>
                      <TableCell>{format(new Date(agent.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateAgentVisibilityMutation.mutate({
                            agentId: agent.id,
                            isPublic: false
                          })}
                          disabled={updateAgentVisibilityMutation.isPending}
                        >
                          Hide
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
