import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, Download, DollarSign, Bot, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AgentDetailModal } from './AgentDetailModal';
import { cn } from '@/lib/utils';

interface AgentMarketplaceCardProps {
  listing: any;
}

export function AgentMarketplaceCard({ listing }: AgentMarketplaceCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const agent = listing.custom_agents;

  // Get avatar URL from agent metadata or use dicebear
  const avatarUrl = agent?.avatar_url || 
    agent?.metadata?.avatar_url || 
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(listing.title)}&backgroundColor=7c3aed`;

  const handlePurchase = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        toast.error('Please sign in to install agents');
        return;
      }

      if (listing.price_credits === 0) {
        const { error } = await supabase.from('agent_purchases').insert({
          agent_id: listing.agent_id,
          buyer_id: userData.user.id,
          seller_id: listing.seller_id,
          price_paid: 0,
        });

        if (error) throw error;
        toast.success('Agent installed!');
      } else {
        toast.info('Purchase system coming soon');
      }
    } catch (error: any) {
      console.error('Error purchasing agent:', error);
      toast.error('Failed to purchase agent: ' + error.message);
    }
  };

  // Get first 2 capabilities for preview
  const previewCapabilities = agent?.capabilities?.slice(0, 2) || [];

  return (
    <>
      <Card 
        className={cn(
          "p-5 cursor-pointer transition-all duration-200",
          "hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5",
          "group"
        )}
        onClick={() => setShowDetail(true)}
      >
        <div className="space-y-4">
          {/* Header with Avatar */}
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 rounded-lg border border-border group-hover:border-primary/30 transition-colors">
              <AvatarImage src={avatarUrl} alt={listing.title} className="object-cover" />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-0.5 truncate group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              {listing.tagline && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {listing.tagline}
                </p>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4">
            {agent?.rating_count > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">{agent.rating_avg?.toFixed(1) || '0.0'}</span>
                <span className="text-muted-foreground">({agent.rating_count})</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Download className="w-4 h-4" />
              {listing.sales_count || 0}
            </div>
          </div>

          {/* Capabilities Preview */}
          {previewCapabilities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {previewCapabilities.map((cap: string) => (
                <Badge key={cap} variant="secondary" className="text-xs py-0.5">
                  {cap.replace(/_/g, ' ')}
                </Badge>
              ))}
              {(agent?.capabilities?.length || 0) > 2 && (
                <Badge variant="outline" className="text-xs py-0.5">
                  +{agent.capabilities.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {listing.tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">
                {listing.price_credits === 0 ? 'Free' : `${listing.price_credits} credits`}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetail(true);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="sm" className="h-8" onClick={handlePurchase}>
                {listing.price_credits === 0 ? 'Install' : 'Purchase'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <AgentDetailModal 
        listing={listing}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </>
  );
}
