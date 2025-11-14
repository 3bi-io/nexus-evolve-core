import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Share2, Eye } from "lucide-react";
import { format } from "date-fns";

export function SocialManagement() {
  const { data: viralContent, isLoading: contentLoading } = useQuery({
    queryKey: ['admin', 'viral-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viral_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  const { data: shares, isLoading: sharesLoading } = useQuery({
    queryKey: ['admin', 'viral-shares'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viral_shares')
        .select('*')
        .order('shared_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  const totalViews = viralContent?.length || 0;
  const totalShares = shares?.length || 0;

  if (contentLoading || sharesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Social & Viral Management</h2>
        <p className="text-muted-foreground">Track viral content and social engagement</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Viral Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{viralContent?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Total Shares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShares.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Viral Content</CardTitle>
          <CardDescription>High-performing content across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viralContent?.map((content) => (
                <TableRow key={content.id}>
                  <TableCell>
                    <Badge variant="outline">{content.content_type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium max-w-md truncate">
                    {content.content?.substring(0, 50) || 'Content'}
                  </TableCell>
                  <TableCell className="font-bold">{content.shared ? 'Shared' : 'Not shared'}</TableCell>
                  <TableCell>
                    <Badge variant={content.shared ? 'default' : 'secondary'}>
                      {content.shared ? 'Active' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(content.created_at), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Shares</CardTitle>
          <CardDescription>Latest social sharing activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Shared At</TableHead>
                <TableHead>Success</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shares?.map((share) => (
                <TableRow key={share.id}>
                  <TableCell>
                    <Badge>{share.platform}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(share.created_at), 'MMM d, HH:mm')}</TableCell>
                  <TableCell>
                    <Badge variant="default">Shared</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
