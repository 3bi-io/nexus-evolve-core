import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { useMobile } from '@/hooks/useMobile';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layout/ResponsiveContainer';
import { ResponsiveSection, MobileSafeArea, TouchTarget } from '@/components/layout/ResponsiveSection';
import { AgentMarketplaceCard } from '@/components/agents/AgentMarketplaceCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Store, Search, TrendingUp, Filter, DollarSign, Sparkles, Users, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { useResponsive } from '@/hooks/useResponsive';
import { CardLoading } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';

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
  const { isMobile: isMobileResponsive } = useResponsive();
  const { isMobile } = useMobile();

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

  const handleRefresh = async () => {
    await fetchMarketplace();
  };

  const content = (
    <ResponsiveContainer size="xl" padding="md">
      <MobileSafeArea bottom>
        <div className="space-y-6 md:space-y-8">
          {/* Hero Section */}
          <ResponsiveSection spacing="md">
            <div className="text-center space-y-4">
              <Badge variant="secondary" className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Beta Marketplace
              </Badge>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <Store className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Agent Marketplace</h1>
              </div>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                1,000+ specialized agents ready to deploy instantly. Build your own and earn forever. 
                Access marketplace anytime from sidebar (Agents → Marketplace).
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="hidden md:inline-flex"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </ResponsiveSection>

          {/* Search & Filters */}
          <ResponsiveSection spacing="sm">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <TouchTarget>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </Button>
              </TouchTarget>
            </div>
          </ResponsiveSection>

          {/* Categories */}
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {categories.map((category) => (
                <TouchTarget key={category}>
                  <Badge
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    className="cursor-pointer capitalize whitespace-nowrap px-4 flex items-center"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                </TouchTarget>
              ))}
            </div>
          </ScrollArea>

          {/* Listings Grid */}
          {loading ? (
            <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
              {[...Array(6)].map((_, i) => (
                <CardLoading key={i} />
              ))}
            </ResponsiveGrid>
          ) : filteredListings.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No agents found"
              description="Try adjusting your search or filters to find the perfect agent for your needs"
            />
          ) : (
            <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
              {filteredListings.map((listing) => (
                <AgentMarketplaceCard key={listing.id} listing={listing} />
              ))}
            </ResponsiveGrid>
          )}

          {/* Revenue Calculator CTA */}
          <ResponsiveSection spacing="md" background="muted">
            <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
              <ResponsiveGrid cols={{ mobile: 1, tablet: 1, desktop: 2 }} gap="lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-8 w-8 text-primary" />
                    <h3 className="text-xl md:text-2xl font-bold">Earn While You Build</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Build once, earn forever. Create custom agents in Agent Studio (accessible from sidebar) 
                    and list them on the marketplace. Top creators earn <strong>$2,000+/month</strong> in credits. 
                    Your agents work across the entire unified platform and integrate with all 9 AI systems.
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
                  <TouchTarget>
                    <Button size="lg" className="w-full sm:w-auto">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Start Building Agents
                    </Button>
                  </TouchTarget>
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
              </ResponsiveGrid>
            </Card>
          </ResponsiveSection>

          {/* Success Stories */}
          <ResponsiveSection spacing="md">
            <h3 className="text-2xl font-bold text-center mb-6">Creator Success Stories</h3>
            <ResponsiveGrid cols={{ mobile: 1, tablet: 3, desktop: 3 }} gap="md">
              <Card className="p-6 space-y-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                <p className="text-4xl font-bold">$2,100</p>
                <p className="text-sm text-muted-foreground">
                  Earned by top creator last month with "Code Review Agent"
                </p>
              </Card>
              <Card className="p-6 space-y-3">
                <Users className="h-8 w-8 text-primary" />
                <p className="text-4xl font-bold">1,000+</p>
                <p className="text-sm text-muted-foreground">
                  Specialized agents ready to deploy across the platform
                </p>
              </Card>
              <Card className="p-6 space-y-3">
                <Sparkles className="h-8 w-8 text-primary" />
                <p className="text-4xl font-bold">4.8★</p>
                <p className="text-sm text-muted-foreground">
                  Average agent rating from 12,400+ reviews
                </p>
              </Card>
            </ResponsiveGrid>
          </ResponsiveSection>
        </div>
      </MobileSafeArea>
    </ResponsiveContainer>
  );

  return (
    <AppLayout title="Agent Marketplace" showBottomNav>
      <SEO
        title="Agent Marketplace - 1,000+ Specialized Agents | Deploy Instantly"
        description="Browse 1,000+ specialized AI agents ready to deploy. Build your own in Agent Studio and monetize across the unified platform. 70% creator revenue share. Accessible from sidebar."
        keywords="AI agent marketplace, custom AI agents, agent builder, monetize AI agents, deploy agents, agent marketplace platform"
        canonical="https://oneiros.me/agent-marketplace"
        ogImage="/og-platform-automation.png"
      />
      {isMobile ? (
        <PullToRefresh onRefresh={handleRefresh}>
          {content}
        </PullToRefresh>
      ) : (
        content
      )}
    </AppLayout>
  );
}
