import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Download, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AgentMarketplaceCardProps {
  listing: any;
}

export function AgentMarketplaceCard({ listing }: AgentMarketplaceCardProps) {
  const agent = listing.custom_agents;

  const handlePurchase = async () => {
    try {
      if (listing.price_credits === 0) {
        // Free agent - just create a purchase record
        const { error } = await supabase.from('agent_purchases').insert({
          agent_id: listing.agent_id,
          buyer_id: (await supabase.auth.getUser()).data.user?.id,
          seller_id: listing.seller_id,
          price_paid: 0,
        });

        if (error) throw error;
        toast.success('Agent installed!');
      } else {
        // Paid agent - would integrate with credit system
        toast.info('Purchase system coming soon');
      }
    } catch (error: any) {
      console.error('Error purchasing agent:', error);
      toast.error('Failed to purchase agent: ' + error.message);
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
          {listing.tagline && (
            <p className="text-sm text-muted-foreground">{listing.tagline}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {agent.rating_count > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">{agent.rating_avg.toFixed(1)}</span>
              <span className="text-muted-foreground">({agent.rating_count})</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Download className="w-4 h-4" />
            {listing.sales_count}
          </div>
        </div>

        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {listing.tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold">
              {listing.price_credits === 0 ? 'Free' : `${listing.price_credits} credits`}
            </span>
          </div>
          <Button size="sm" onClick={handlePurchase}>
            {listing.price_credits === 0 ? 'Install' : 'Purchase'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
