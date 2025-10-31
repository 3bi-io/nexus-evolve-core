import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AgentMarketplaceCard } from '@/components/agents/AgentMarketplaceCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, Search, TrendingUp, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

interface MarketplaceListing {
  id: string;
  agent_id: string;
  title: string;
  tagline: string;
  tags: string[];
  price_credits: number;
  sales_count: number;
  custom_agents: {
    name: string;
    description: string;
    rating_avg: number;
    rating_count: number;
    usage_count: number;
  };
}

export default function AgentMarketplace() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchMarketplace();
  }, []);

  useEffect(() => {
    filterListings();
  }, [searchQuery, selectedCategory, listings]);

  const fetchMarketplace = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_marketplace')
        .select(`
          *,
          custom_agents:agent_id (
            name,
            description,
            rating_avg,
            rating_count,
            usage_count
          )
        `)
        .eq('is_active', true)
        .order('sales_count', { ascending: false });

      if (error) throw error;
      setListings(data || []);
      setFilteredListings(data || []);
    } catch (error) {
      console.error('Error fetching marketplace:', error);
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.tagline?.toLowerCase().includes(query) ||
          listing.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((listing) =>
        listing.tags?.includes(selectedCategory)
      );
    }

    setFilteredListings(filtered);
  };

  const categories = ['all', 'productivity', 'creative', 'research', 'business', 'coding'];

  return (
    <PageLayout>
      <SEO 
        title="Agent Marketplace - Create, Share & Monetize Custom AI Agents"
        description="Browse and deploy specialized AI agents or create your own. Community-driven marketplace with agents for productivity, creativity, research, business, and coding."
        keywords="AI agent marketplace, custom AI agents, agent builder, AI marketplace, buy AI agents"
        canonical="https://oneiros.me/agent-marketplace"
        ogImage="/og-marketplace.png"
      />
      <div className="container max-w-7xl py-8">
        <div className="flex items-center gap-3 mb-8">
          <Store className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Agent Marketplace</h1>
            <p className="text-muted-foreground">
              Discover and install specialized AI agents
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer capitalize whitespace-nowrap"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <AgentMarketplaceCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        <div className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start gap-4">
            <TrendingUp className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Create Your Own Agent</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Build custom agents in the Agent Studio and list them on the marketplace to earn credits.
              </p>
              <Button variant="outline">Go to Agent Studio</Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
