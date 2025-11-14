import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, DollarSign } from "lucide-react";
import { useAdminAudit } from "@/hooks/useAdminAudit";

interface SubscriptionTier {
  id: string;
  tier_name: string;
  monthly_price: number;
  yearly_price: number;
  monthly_credits: number;
  features: any;
  active: boolean;
  sort_order: number;
}

export function SubscriptionTierManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logAction } = useAdminAudit();
  const [editingTier, setEditingTier] = useState<SubscriptionTier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: tiers, isLoading } = useQuery({
    queryKey: ['admin', 'subscription-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as SubscriptionTier[];
    }
  });

  const updateTierMutation = useMutation({
    mutationFn: async (tier: Partial<SubscriptionTier> & { id: string }) => {
      const { error } = await supabase
        .from('subscription_tiers')
        .update(tier)
        .eq('id', tier.id);
      if (error) throw error;
    },
    onSuccess: async (_, variables) => {
      await logAction({
        action_type: 'update_subscription_tier',
        target_type: 'subscription_tier',
        target_id: variables.id,
        details: variables
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscription-tiers'] });
      toast({ title: "Tier updated successfully" });
      setIsDialogOpen(false);
      setEditingTier(null);
    }
  });

  const handleEdit = (tier: SubscriptionTier) => {
    setEditingTier(tier);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingTier) return;
    updateTierMutation.mutate(editingTier);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscription Tiers</h2>
          <p className="text-muted-foreground">Manage pricing plans and features</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Tiers</CardTitle>
          <CardDescription>View and edit subscription pricing and credits</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead>Monthly</TableHead>
                <TableHead>Yearly</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers?.map((tier) => (
                <TableRow key={tier.id}>
                  <TableCell className="font-medium">{tier.tier_name}</TableCell>
                  <TableCell>${tier.monthly_price}</TableCell>
                  <TableCell>${tier.yearly_price}</TableCell>
                  <TableCell>{tier.monthly_credits.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={tier.active ? "text-green-600" : "text-muted-foreground"}>
                      {tier.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(tier)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subscription Tier</DialogTitle>
            <DialogDescription>Update pricing and credit allocation</DialogDescription>
          </DialogHeader>
          {editingTier && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monthly Price ($)</Label>
                  <Input
                    type="number"
                    value={editingTier.monthly_price}
                    onChange={(e) => setEditingTier({ ...editingTier, monthly_price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Yearly Price ($)</Label>
                  <Input
                    type="number"
                    value={editingTier.yearly_price}
                    onChange={(e) => setEditingTier({ ...editingTier, yearly_price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>Monthly Credits</Label>
                <Input
                  type="number"
                  value={editingTier.monthly_credits}
                  onChange={(e) => setEditingTier({ ...editingTier, monthly_credits: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingTier.active}
                  onCheckedChange={(checked) => setEditingTier({ ...editingTier, active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateTierMutation.isPending}>
              {updateTierMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
