import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AgentMarketplaceCard } from '@/components/agents/AgentMarketplaceCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Store, Search, TrendingUp, Filter, DollarSign, Sparkles, Users } from 'lucide-react';
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
        title="Agent Marketplace - 1,000+ Ready AI Agents | Build & Monetize"
        description="Browse 1,000+ specialized AI agents or build your own. Earn credits by sharing agents with the community. Agents for productivity, coding, creativity, research, and business."
        keywords="AI agent marketplace, custom AI agents, agent builder, AI marketplace, buy AI agents, monetize AI"
        canonical="https://oneiros.me/agent-marketplace"
        ogImage="/og-marketplace.png"
      />
      <div className="container max-w-7xl py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-base px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            1,000+ Ready-to-Deploy AI Agents
          </Badge>
          <div className="flex items-center justify-center gap-3">
            <Store className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Agent Marketplace</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Deploy specialized agents instantly or build your own and earn credits from the community
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span>2,847 active creators</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-primary" />
              <span>$127K+ earned by creators</span>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search 1,000+ agents..."
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

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer capitalize whitespace-nowrap text-base px-4 py-2"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Listings Grid */}
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

        {/* Revenue Calculator CTA */}
        <Card className="p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-bold">Earn While You Build</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Create custom agents in Agent Studio and list them on the marketplace. 
                Top creators earn <strong>$2,000+/month</strong> in credits from their agents. 
                Plus, build your reputation and help the community.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span>
                  <span>Keep 70% of all sales</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span>
                  <span>Automatic payouts in credits</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span>
                  <span>Analytics & performance tracking</span>
                </div>
              </div>
              <Button size="lg" className="w-full sm:w-auto">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Building Agents
              </Button>
            </div>
            
            <Card className="p-6 bg-background">
              <h4 className="font-semibold mb-4">Revenue Potential Calculator</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm">Agent price:</span>
                  <span className="font-mono">50 credits</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm">Monthly sales:</span>
                  <span className="font-mono">100 users</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm">Your share (70%):</span>
                  <span className="font-mono">35 credits/sale</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold">Monthly earnings:</span>
                  <span className="text-2xl font-bold text-primary">3,500 credits</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  ≈ $70/month value • Scales with popularity
                </p>
              </div>
            </Card>
          </div>
        </Card>

        {/* Success Stories */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-center">Creator Success Stories</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <p className="text-4xl font-bold">$2,100</p>
              <p className="text-sm text-muted-foreground">
                Earned by top creator last month with "Code Review Agent"
              </p>
            </Card>
            <Card className="p-6 space-y-3">
              <Users className="h-8 w-8 text-primary" />
              <p className="text-4xl font-bold">847</p>
              <p className="text-sm text-muted-foreground">
                Active agents deployed by the community
              </p>
            </Card>
            <Card className="p-6 space-y-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <p className="text-4xl font-bold">4.8★</p>
              <p className="text-sm text-muted-foreground">
                Average agent rating from 12,400+ reviews
              </p>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
