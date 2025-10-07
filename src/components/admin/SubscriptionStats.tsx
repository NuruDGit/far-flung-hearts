import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, TrendingUp, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  conversionRate: string;
}

export const SubscriptionStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
    conversionRate: '0%'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total users
      const { count: totalCount, error: totalError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // This would need to be updated based on your actual subscription tracking
      // For now, showing placeholder data
      const total = totalCount || 0;
      const premium = 0; // You'd query your subscriptions table here
      const free = total - premium;
      const rate = total > 0 ? ((premium / total) * 100).toFixed(1) : '0';

      setStats({
        totalUsers: total,
        premiumUsers: premium,
        freeUsers: free,
        conversionRate: `${rate}%`
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load subscription stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-heart"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premiumUsers}</div>
            <Badge variant="default" className="mt-2">$6.99/mo</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.freeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Free Tier</p>
                <p className="text-sm text-muted-foreground">100 messages/day, 3 mood logs/day</p>
              </div>
              <Badge variant="outline">{stats.freeUsers} users</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-love-light/20">
              <div>
                <p className="font-medium">Premium Monthly - $6.99/month</p>
                <p className="text-sm text-muted-foreground">Unlimited features, no branding</p>
              </div>
              <Badge variant="default">{stats.premiumUsers} users</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-love-light/20">
              <div>
                <p className="font-medium">Premium Annual - $59/year</p>
                <p className="text-sm text-muted-foreground">Save 30% - Best value!</p>
              </div>
              <Badge variant="default">0 users</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
