import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, Heart, BarChart3, PieChart, Activity, Users2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { subDays, subWeeks, subMonths, format } from 'date-fns';
import AppNavigation from '@/components/AppNavigation';
import MoodChart from '@/components/mood/MoodChart';
import MoodInsights from '@/components/mood/MoodInsights';
import PartnerSupport from '@/components/mood/PartnerSupport';

interface MoodData {
  id: string;
  emoji: string;
  date: string;
  notes?: string;
  user_id: string;
}

interface Pair {
  id: string;
  user_a: string;
  user_b: string;
  status: string;
}

interface Profile {
  id: string;
  display_name?: string;
}

const MoodAnalytics = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [userMoods, setUserMoods] = useState<MoodData[]>([]);
  const [partnerMoods, setPartnerMoods] = useState<MoodData[]>([]);
  const [todayPartnerMood, setTodayPartnerMood] = useState<MoodData | null>(null);
  const [pair, setPair] = useState<Pair | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMoodData();
    }
  }, [user, selectedPeriod]);

  const getDateRange = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'week':
        return { start: subDays(now, 7), end: now };
      case 'month':
        return { start: subDays(now, 30), end: now };
      case 'year':
        return { start: subDays(now, 365), end: now };
      default:
        return { start: subDays(now, 7), end: now };
    }
  };

  const fetchMoodData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user's pair
      const { data: pairData } = await supabase
        .from('pairs')
        .select('*')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .eq('status', 'active')
        .single();

      if (pairData) {
        setPair(pairData);
        
        // Get partner profile
        const partnerId = pairData.user_a === user.id ? pairData.user_b : pairData.user_a;
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', partnerId)
          .single();
        
        setPartnerProfile(profileData);

        // Get today's partner mood
        const today = new Date().toISOString().split('T')[0];
        const { data: todayMood } = await supabase
          .from('mood_logs')
          .select('*')
          .eq('user_id', partnerId)
          .eq('date', today)
          .single();
        
        setTodayPartnerMood(todayMood);
      }

      // Get mood data for selected period
      const { start, end } = getDateRange();
      const startDate = format(start, 'yyyy-MM-dd');
      const endDate = format(end, 'yyyy-MM-dd');

      // Get user's moods
      const { data: userMoodData } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      setUserMoods(userMoodData || []);

      // Get partner's moods if pair exists
      if (pairData) {
        const partnerId = pairData.user_a === user.id ? pairData.user_b : pairData.user_a;
        const { data: partnerMoodData } = await supabase
          .from('mood_logs')
          .select('*')
          .eq('user_id', partnerId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true });

        setPartnerMoods(partnerMoodData || []);
      }

    } catch (error) {
      console.error('Error fetching mood data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Activity className="text-love-heart" size={28} />
              Mood Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your emotional journey and support each other
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Select
              value={selectedPeriod}
              onValueChange={(value) => setSelectedPeriod(value as 'week' | 'month' | 'year')}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="year">Past Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp size={16} />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 size={16} />
              <span className="hidden sm:inline">Charts</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <Heart size={16} />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
          </TabsList>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <MoodInsights 
              data={userMoods} 
              partnerData={partnerMoods}
              period={selectedPeriod}
            />
            
            {/* Recent Moods Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="text-love-heart" size={20} />
                    Your Recent Moods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userMoods.length > 0 ? (
                    <div className="space-y-3">
                      {userMoods.slice(-5).reverse().map((mood) => (
                        <div key={mood.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{mood.emoji}</span>
                            <div>
                              <div className="text-sm font-medium">
                                {new Date(mood.date).toLocaleDateString()}
                              </div>
                              {mood.notes && (
                                <div className="text-xs text-muted-foreground truncate max-w-48">
                                  {mood.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No mood data for this period
                    </p>
                  )}
                </CardContent>
              </Card>

              {partnerMoods.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users2 className="text-love-coral" size={20} />
                      Partner's Recent Moods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {partnerMoods.slice(-5).reverse().map((mood) => (
                        <div key={mood.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{mood.emoji}</span>
                            <div>
                              <div className="text-sm font-medium">
                                {new Date(mood.date).toLocaleDateString()}
                              </div>
                              {mood.notes && (
                                <div className="text-xs text-muted-foreground truncate max-w-48">
                                  {mood.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Mood Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <MoodChart 
                    data={userMoods}
                    type="line"
                    title={`Your Mood Over ${selectedPeriod === 'week' ? 'Past Week' : selectedPeriod === 'month' ? 'Past Month' : 'Past Year'}`}
                    period={selectedPeriod}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mood Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <MoodChart 
                    data={userMoods}
                    type="doughnut"
                    title="Mood Breakdown"
                    period={selectedPeriod}
                  />
                </CardContent>
              </Card>

              {partnerMoods.length > 0 && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Partner's Mood Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MoodChart 
                        data={partnerMoods}
                        type="line"
                        title="Partner's Mood Journey"
                        period={selectedPeriod}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Partner's Mood Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MoodChart 
                        data={partnerMoods}
                        type="doughnut"
                        title="Partner's Mood Breakdown"
                        period={selectedPeriod}
                      />
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            {pair && partnerProfile ? (
              <PartnerSupport 
                partnerMood={todayPartnerMood}
                pairId={pair.id}
                partnerId={pair.user_a === user?.id ? pair.user_b : pair.user_a}
                partnerName={partnerProfile.display_name || 'Your partner'}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users2 className="text-love-coral" size={20} />
                    Partner Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    Connect with a partner to unlock mood support features! 💕
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MoodAnalytics;