import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { format } from "date-fns";

export function CreditSystemManagement() {
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['admin', 'credit-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['admin', 'subscriptions-credits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('credits_total, credits_remaining');
      if (error) throw error;
      return data;
    }
  });

  const totalDistributed = subscriptions?.reduce((sum, sub) => sum + (sub.credits_total || 0), 0) || 0;
  const totalRemaining = subscriptions?.reduce((sum, sub) => sum + (sub.credits_remaining || 0), 0) || 0;
  const totalConsumed = totalDistributed - totalRemaining;

  if (transactionsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Credit System Management</h2>
        <p className="text-muted-foreground">Monitor credit economy and transactions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Distributed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDistributed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time credits issued</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Total Consumed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalConsumed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Credits spent by users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalRemaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available credits</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Last 100 credit transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance After</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <Badge variant={
                      tx.transaction_type === 'usage' ? 'destructive' :
                      tx.transaction_type === 'purchase' ? 'default' : 'secondary'
                    }>
                      {tx.transaction_type}
                    </Badge>
                  </TableCell>
                  <TableCell className={tx.transaction_type === 'usage' ? 'text-red-600' : 'text-green-600'}>
                    {tx.transaction_type === 'usage' ? '-' : '+'}{tx.credits_amount}
                  </TableCell>
                  <TableCell>{tx.balance_after.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {tx.operation_type || 'N/A'}
                  </TableCell>
                  <TableCell>{format(new Date(tx.created_at), 'MMM d, HH:mm')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
