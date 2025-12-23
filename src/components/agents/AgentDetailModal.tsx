import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, Download, DollarSign, Sparkles, Bot, Zap, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AgentDetailModalProps {
  listing: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentDetailModal({ listing, open, onOpenChange }: AgentDetailModalProps) {
  const navigate = useNavigate();
  const agent = listing?.custom_agents;

  if (!listing || !agent) return null;

  const handlePurchase = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        toast.error('Please sign in to purchase agents');
        navigate('/auth');
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
        toast.success('Agent installed successfully!');
        onOpenChange(false);
      } else {
        toast.info('Purchase system coming soon');
      }
    } catch (error: any) {
      console.error('Error purchasing agent:', error);
      toast.error('Failed to purchase agent: ' + error.message);
    }
  };

  const handleTryNow = () => {
    navigate('/agent-studio', { state: { previewAgentId: listing.agent_id } });
    onOpenChange(false);
  };

  // Get avatar URL from agent metadata or use dicebear
  const avatarUrl = agent.avatar_url || 
    agent.metadata?.avatar_url || 
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(listing.title)}&backgroundColor=7c3aed`;

  // Parse capabilities
  const capabilities = agent.capabilities || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 rounded-xl border-2 border-primary/20">
              <AvatarImage src={avatarUrl} alt={listing.title} className="object-cover" />
              <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xl">
                <Bot className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold">{listing.title}</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                {listing.tagline || agent.description}
              </DialogDescription>
              <div className="flex items-center gap-4 mt-2">
                {agent.rating_count > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{agent.rating_avg?.toFixed(1) || '0.0'}</span>
                    <span className="text-muted-foreground">({agent.rating_count})</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Download className="w-4 h-4" />
                  {listing.sales_count || 0} installs
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-6 py-4">
            {/* Description */}
            {listing.long_description && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">About</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {listing.long_description}
                </p>
              </div>
            )}

            {/* Capabilities */}
            {capabilities.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Capabilities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {capabilities.map((cap: string) => (
                    <Badge key={cap} variant="secondary" className="text-xs">
                      {cap.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Messages */}
            {listing.preview_messages && listing.preview_messages.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Example Conversations
                </h4>
                <div className="space-y-2">
                  {listing.preview_messages.slice(0, 2).map((msg: any, idx: number) => (
                    <div key={idx} className="bg-muted rounded-lg p-3 text-sm">
                      <p className="text-muted-foreground">{msg.prompt || msg}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            <span className="text-lg font-bold">
              {listing.price_credits === 0 ? 'Free' : `${listing.price_credits} credits`}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTryNow}>
              <Sparkles className="mr-2 h-4 w-4" />
              Try Now
            </Button>
            <Button onClick={handlePurchase}>
              {listing.price_credits === 0 ? 'Install Free' : 'Purchase'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
