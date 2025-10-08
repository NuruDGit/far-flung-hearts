import { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Clock, Zap, Camera, LogOut, Users, Plus, Flame, MessageSquareQuote, Users2, MoreVertical, Smile, Settings, User, Calendar, Crown, Target, TrendingUp, Video, ChevronDown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useActivePair } from '@/hooks/useActivePair';
import AppNavigation from '@/components/AppNavigation';
import ProximaFloatingChat from '@/components/ProximaFloatingChat';
import MoodLogger from '@/components/MoodLogger';
import WeatherWidget from '@/components/WeatherWidget';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { LockedFeatureCard } from '@/components/LockedFeatureCard';
import { AchievementBadge } from '@/components/AchievementBadge';
import { UpgradeCTA } from '@/components/UpgradeCTA';
import { hasFeatureAccess, SUBSCRIPTION_TIERS } from '@/config/subscriptionFeatures';
import { toast } from 'sonner';
import { ReunionCountdown } from '@/components/ReunionCountdown';
import { DailyQuestionDialog } from '@/components/DailyQuestionDialog';

const AppHome = () => {
  const { user, signOut, subscription } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Update clock every minute instead of every render
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 60000); // Update every 60 seconds
    return () => clearInterval(timer);
  }, []);
  const { pair, loading: pairLoading } = useActivePair();
  const [partner, setPartner] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyQuestion, setDailyQuestion] = useState<any>(null);
  const [questionAnswers, setQuestionAnswers] = useState<any[]>([]);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [streak, setStreak] = useState<number>(0);
  const [loadingStreak, setLoadingStreak] = useState(true);
  const [showStreakDetails, setShowStreakDetails] = useState(false);
  const [moodCount, setMoodCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  // Function to recalculate streak
  const recalculateStreak = async () => {
    if (!pair) return;
    
    setLoadingStreak(true);
    const { data: streakData } = await supabase.rpc('calculate_pair_streak', {
      target_pair_id: pair.id
    });
    
    const newStreak = streakData || 0;
    
    // Show toast if streak increased
    if (newStreak > streak && streak > 0) {
      toast.success(`🔥 Streak increased to ${newStreak} days!`);
    }
    
    setStreak(newStreak);
    setLoadingStreak(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || pairLoading) return;

      try {
        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setUserProfile(profileData);

        if (pair) {
          
          // Calculate streak
          await recalculateStreak();
          
          // Get partner profile (using safe view - excludes email, phone, birth_date)
          const partnerId = pair.user_a === user.id ? pair.user_b : pair.user_a;
          const { data: partnerData } = await supabase
            .from('profiles_partner_safe')
            .select('*')
            .eq('id', partnerId)
            .single();
          
          setPartner(partnerData);

          // Get daily question for the pair
          const { data: questionData } = await supabase.rpc('get_or_create_daily_question', {
            target_pair_id: pair.id
          });
          
          if (questionData && questionData.length > 0) {
            setDailyQuestion(questionData[0]);
            
            // Get answers for this question
            const { data: answersData } = await supabase
              .from('daily_question_answers')
              .select('*')
              .eq('daily_question_id', questionData[0].id);
            
            setQuestionAnswers(answersData || []);
          }

          // Get stats for achievements
          const today = new Date().toISOString().split('T')[0];
          const { data: moodData } = await supabase
            .from('mood_logs')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today);
          setMoodCount(moodData?.length || 0);

          const { data: eventData } = await supabase
            .from('events')
            .select('*')
            .eq('pair_id', pair.id);
          setEventCount(eventData?.length || 0);

          const { data: messageData } = await supabase
            .from('messages')
            .select('*')
            .eq('pair_id', pair.id);
          setMessageCount(messageData?.length || 0);
        }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLoadingStreak(false);
        } finally {
          setLoading(false);
        }
    };

    fetchUserData();

    // Subscribe to answer updates
    if (pair && dailyQuestion) {
      const channel = supabase
        .channel('daily_question_answers_updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'daily_question_answers',
            filter: `daily_question_id=eq.${dailyQuestion.id}`,
          },
          (payload) => {
            setQuestionAnswers(prev => [...prev, payload.new as any]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, pair, pairLoading, dailyQuestion]);

  // Real-time subscriptions for streak updates
  useEffect(() => {
    if (!pair) return;

    console.log('Setting up realtime subscriptions for streak updates');

    // Subscribe to new messages in the pair
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `pair_id=eq.${pair.id}`
        },
        (payload) => {
          console.log('New message detected, recalculating streak', payload);
          recalculateStreak();
        }
      )
      .subscribe();

    // Subscribe to new mood logs in the pair
    const moodLogsChannel = supabase
      .channel('mood-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mood_logs',
          filter: `pair_id=eq.${pair.id}`
        },
        (payload) => {
          console.log('New mood log detected, recalculating streak', payload);
          recalculateStreak();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscriptions');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(moodLogsChannel);
    };
  }, [pair?.id, streak]);

  const handleAnswerQuestion = () => {
    if (!pair || !dailyQuestion || !user) return;
    
    const userAnswer = questionAnswers.find(a => a.user_id === user.id);
    const partnerAnswer = questionAnswers.find(a => a.user_id !== user.id);
    
    // If there are any answers, allow viewing the answers page
    if (questionAnswers.length > 0) {
      navigate(`/app/daily-question-answers?questionId=${dailyQuestion.id}`);
    } else {
      // No answers yet, show dialog to answer
      setShowQuestionDialog(true);
    }
  };

  const handleAnswerSubmitted = async () => {
    // Refresh answers
    if (dailyQuestion) {
      const { data: answersData } = await supabase
        .from('daily_question_answers')
        .select('*')
        .eq('daily_question_id', dailyQuestion.id);
      
      setQuestionAnswers(answersData || []);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-love-light via-white to-love-coral/10">
        <AppNavigation />
        <div className="container mx-auto p-4 max-w-md md:max-w-2xl lg:max-w-4xl pt-6 pb-24 md:pb-28 lg:pb-8">
          <div className="space-y-6 animate-fade-in">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            
            {/* Partner Card Skeleton */}
            <Card>
              <CardHeader className="pb-4">
                <Skeleton className="h-14 w-full" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Actions Skeleton */}
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
            
            {/* Cards Skeleton */}
            <div className="grid md:grid-cols-2 gap-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Allow solo mode - don't redirect if no pair

  const quickActions = [
    {
      icon: Heart,
      label: "Send Love",
      action: () => sendLoveMessage(),
      color: "bg-love-heart"
    },
    {
      icon: Zap,
      label: "Quick Ping",
      action: () => sendQuickPing(),
      color: "bg-love-coral"
    },
    {
      icon: Camera,
      label: "Share Sky",
      action: () => sharePhoto(),
      color: "bg-love-deep"
    }
  ];

  const sendLoveMessage = async () => {
    if (!pair || !user) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          pair_id: pair.id,
          sender_id: user.id,
          type: 'text',
          body: { message: '💖 Sent you some love!', type: 'love_tap' }
        });

      if (error) throw error;
      
      toast.success('Love sent! 💕');
    } catch (error) {
      console.error('Error sending love:', error);
      toast.error('Failed to send love');
    }
  };

  const sendQuickPing = async () => {
    if (!pair || !user) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          pair_id: pair.id,
          sender_id: user.id,
          type: 'text',
          body: { message: '👋 Thinking of you!', type: 'ping' }
        });

      if (error) throw error;
      
      toast.success('Ping sent! 👋');
    } catch (error) {
      console.error('Error sending ping:', error);
      toast.error('Failed to send ping');
    }
  };

  const sharePhoto = () => {
    // For now, navigate to messages where they can share photos
    // In the future, this could open camera directly
    toast.info('Opening messages to share a photo! 📸');
    setTimeout(() => {
      window.location.href = '/app/messages';
    }, 1000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserDisplayName = () => {
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    return userProfile?.display_name || 'there';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-love-light via-white to-love-coral/10">
      <AppNavigation />
      <div className="container mx-auto p-4 max-w-md md:max-w-2xl lg:max-w-4xl pt-2 md:pt-6 pb-24 md:pb-28 lg:pb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-love-deep">
              {getGreeting()}, {getUserDisplayName()}!
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
              {partner ? `Connected with ${partner.first_name || partner.display_name}` : 'Exploring solo'}
              <Badge 
                variant={subscription.tier === 'premium' ? 'secondary' : 'outline'}
                className={subscription.tier !== 'free' ? 'bg-gradient-to-r from-love-heart to-love-coral text-white border-0' : ''}
              >
                {subscription.tier === 'premium' && <Crown className="w-3 h-3 mr-1" />}
                {SUBSCRIPTION_TIERS[subscription.tier].name}
              </Badge>
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-love-coral/10 hover:text-love-coral transition-colors"
            onClick={() => navigate('/app/profile')}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>

        {/* Solo Mode - Invite Partner Banner */}
        {!pair && (
          <Card className="mb-6 bg-gradient-to-r from-love-heart to-love-coral text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Users className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Ready to connect?</h3>
                  <p className="text-sm opacity-90">Invite your partner to unlock all features</p>
                </div>
                <Link to="/pair-setup">
                  <Button size="sm" variant="secondary" className="bg-white text-love-heart hover:bg-white/90 hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4 mr-1" />
                    Invite
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* HERO: Quick Actions - Most Important CTAs */}
        {pair && (
          <div className="mb-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                size="lg" 
                onClick={() => navigate('/app/messages')}
                className="h-20 bg-gradient-to-br from-love-heart to-love-coral hover:shadow-xl hover:scale-105 transition-all duration-300 text-white border-0"
              >
                <div className="flex flex-col items-center gap-1">
                  <MessageSquareQuote className="h-6 w-6" />
                  <span className="text-sm font-semibold">Send Message</span>
                </div>
              </Button>
              <Button 
                size="lg" 
                onClick={() => navigate('/app/mood')}
                className="h-20 bg-gradient-to-br from-love-deep to-love-heart hover:shadow-xl hover:scale-105 transition-all duration-300 text-white border-0"
              >
                <div className="flex flex-col items-center gap-1">
                  <Smile className="h-6 w-6" />
                  <span className="text-sm font-semibold">Log Mood</span>
                </div>
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline"
                onClick={() => navigate('/app/calendar')}
                className="h-16 hover:bg-love-light/50 hover:border-love-coral transition-all"
              >
                <div className="flex flex-col items-center gap-1">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs">Calendar</span>
                </div>
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/app/goals')}
                className="h-16 hover:bg-love-light/50 hover:border-love-coral transition-all"
              >
                <div className="flex flex-col items-center gap-1">
                  <Target className="h-5 w-5" />
                  <span className="text-xs">Goals</span>
                </div>
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/app/messages')}
                className="h-16 hover:bg-love-light/50 hover:border-love-coral transition-all"
              >
                <div className="flex flex-col items-center gap-1">
                  <Video className="h-5 w-5" />
                  <span className="text-xs">Video Call</span>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Daily Question - Highlighted for Engagement */}
        {pair && dailyQuestion && (
          <Card 
            onClick={handleAnswerQuestion}
            className="mb-6 bg-gradient-to-br from-love-heart/10 via-love-coral/5 to-love-deep/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in border-2 border-love-coral/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-love-heart/5 to-love-coral/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-love-heart to-love-coral flex items-center justify-center shadow-lg">
                    <MessageSquareQuote className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Daily Question</CardTitle>
                    <p className="text-xs text-muted-foreground">Share your thoughts together</p>
                  </div>
                </div>
                <Badge variant={questionAnswers.length === 2 ? "default" : "secondary"} className="bg-love-coral text-white">
                  {questionAnswers.length}/2
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-base font-medium text-love-deep mb-3">"{dailyQuestion.question_text}"</p>
              <div className="flex items-center gap-2 text-sm">
                {questionAnswers.length === 0 && (
                  <span className="text-muted-foreground">Be the first to answer!</span>
                )}
                {questionAnswers.length === 1 && (
                  <span className="text-muted-foreground">One answer • Tap to respond</span>
                )}
                {questionAnswers.length === 2 && (
                  <span className="text-love-heart font-medium">Both answered! • Tap to view</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compact Partner Card - Only show if paired */}
        {pair && partner && (
          <Collapsible defaultOpen={false} className="mb-6">
            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in border-0 shadow-lg overflow-hidden">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-4 cursor-pointer hover:bg-love-light/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center relative">
                        <div className="w-12 h-12 rounded-full love-gradient p-1 shadow-lg z-10">
                          <Avatar className="w-full h-full">
                            <AvatarImage src={userProfile?.avatar_url} />
                            <AvatarFallback className="bg-love-gradient text-white text-sm">
                              {userProfile?.display_name?.charAt(0).toUpperCase() || userProfile?.first_name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="w-12 h-12 rounded-full love-gradient p-1 shadow-lg -ml-3">
                          <Avatar className="w-full h-full">
                            <AvatarImage src={partner.avatar_url} />
                            <AvatarFallback className="bg-love-gradient text-white text-sm">
                              {partner.display_name?.charAt(0).toUpperCase() || <Heart size={16} />}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      <div className="text-left">
                        <h2 className="text-base font-semibold">{partner.display_name}</h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          Active now
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Time Together */}
                    <div className="text-center p-3 rounded-lg bg-gradient-to-br from-love-light to-love-coral/10 hover:shadow-md transition-shadow">
                      <Clock className="mx-auto mb-2 text-love-heart" size={24} />
                      <p className="text-xs text-muted-foreground">Together</p>
                      <p className="font-semibold text-sm">
                        {pair?.created_at ? 
                          Math.floor((new Date().getTime() - new Date(pair.created_at).getTime()) / (1000 * 60 * 60 * 24)) 
                          : 0} days
                      </p>
                    </div>

                    {/* Streak */}
                    <div className="text-center p-3 rounded-lg bg-gradient-to-br from-love-heart/10 to-love-coral/10 hover:shadow-md transition-all">
                      <div className="relative mx-auto mb-2 w-8 h-8 flex items-center justify-center">
                        {streak > 0 && <div className="absolute inset-0 bg-love-heart/20 rounded-full animate-pulse" />}
                        <Flame className={`relative z-10 ${streak > 0 ? 'text-love-heart' : 'text-muted-foreground'}`} size={24} />
                      </div>
                      <p className="text-xs text-muted-foreground">Streak</p>
                      <p className="font-semibold text-sm flex items-center justify-center gap-1">
                        {loadingStreak ? '...' : streak} days
                      </p>
                    </div>

                    {/* Messages Sent */}
                    <div className="text-center p-3 rounded-lg bg-gradient-to-br from-love-deep/10 to-love-heart/10 hover:shadow-md transition-shadow">
                      <Heart className="mx-auto mb-2 text-love-deep" size={24} />
                      <p className="text-xs text-muted-foreground">Messages</p>
                      <p className="font-semibold text-sm">{messageCount}</p>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Weather Widget - Contextual */}
        {pair && partner?.city && (
          <WeatherWidget 
            partnerCity={partner?.city} 
            partnerCountry={partner?.country}
            partnerName={partner?.first_name || partner?.display_name}
          />
        )}

        {/* Collapsible Progress & Stats Section */}
        {pair && (
          <Collapsible defaultOpen={false} className="mb-6">
            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in border-0 shadow-lg overflow-hidden">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-4 cursor-pointer hover:bg-love-light/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-love-heart" />
                      <CardTitle className="text-base">Your Progress & Achievements</CardTitle>
                    </div>
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 space-y-4">
                  {/* Streak Details */}
                  {streak > 0 && (
                    <div className="p-4 bg-gradient-to-br from-love-heart/10 to-love-coral/10 rounded-lg border border-love-coral/20">
                      <div className="flex items-center gap-3 mb-2">
                        <Flame className="h-6 w-6 text-love-heart" />
                        <div>
                          <p className="font-semibold text-love-deep">
                            {streak === 1 && "Great start! Keep it going! 🎉"}
                            {streak >= 2 && streak < 7 && "You're on fire! 🔥"}
                            {streak >= 7 && streak < 30 && "Amazing dedication! ⭐"}
                            {streak >= 30 && "Legendary streak! 🏆"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {streak} day{streak !== 1 ? 's' : ''} of daily connection
                          </p>
                        </div>
                      </div>
                      {streak >= 7 && (
                        <div className="pt-2 mt-2 border-t border-love-coral/20">
                          <p className="text-xs font-medium text-love-heart">🎯 Milestone Unlocked!</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Activity Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-love-light/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Smile className="h-4 w-4 text-love-heart" />
                        <p className="text-xs text-muted-foreground">Mood Logs</p>
                      </div>
                      <p className="text-lg font-semibold">{moodCount}</p>
                    </div>
                    <div className="p-3 bg-love-light/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-love-deep" />
                        <p className="text-xs text-muted-foreground">Events</p>
                      </div>
                      <p className="text-lg font-semibold">{eventCount}</p>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Solo Mode - Demo Partner Card */}
        {!pair && (
          <Card className="mb-6 bg-white/60 backdrop-blur-sm border-dashed border-2 border-love-coral/30 hover:border-love-coral/50 transition-all duration-300 animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-muted-foreground">Your Partner</h2>
                  <p className="text-sm text-muted-foreground">Will appear here when connected</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center opacity-50">
                <div className="hover:bg-accent/5 rounded-lg p-2 transition-colors">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-love-coral" />
                  <p className="text-sm text-muted-foreground">Their time</p>
                  <p className="font-semibold">--:--</p>
                </div>
                <div className="hover:bg-accent/5 rounded-lg p-2 transition-colors">
                  <Flame className="h-5 w-5 mx-auto mb-1 text-love-heart" />
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="font-semibold">-- days</p>
                </div>
                <div className="hover:bg-accent/5 rounded-lg p-2 transition-colors">
                  <MessageSquareQuote className="h-5 w-5 mx-auto mb-1 text-love-deep" />
                  <p className="text-sm text-muted-foreground">Messages</p>
                  <p className="font-semibold">--</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Tier Upgrade CTA - Show for Free users */}
        {subscription.tier === 'free' && (
          <div className="mb-6">
            <UpgradeCTA />
          </div>
        )}

        {/* Quick Actions */}
        <Card className="mb-6 bg-gradient-to-r from-love-heart to-love-coral text-white hover:shadow-xl transition-all duration-300 border-0 shadow-lg animate-fade-in">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={index}
                    variant="secondary"
                    className={`h-auto py-4 flex-col gap-2 hover:scale-105 transition-transform ${!pair ? 'opacity-50 cursor-not-allowed' : 'hover-scale'}`}
                    onClick={pair ? action.action : () => toast.info('Connect with your partner to unlock this feature')}
                    disabled={!pair}
                  >
                    <IconComponent size={24} />
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Features */}
        <div className="space-y-6">
          {/* Featured Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Today's Features</h2>
              <p className="text-sm text-muted-foreground">
                {pair ? "Stay connected with your partner" : "Features available when you connect"}
              </p>
            </div>
          </div>

          {/* Mood Logger - Full Width Featured */}
          <div className="relative">
            <MoodLogger compact={true} pairId={pair?.id} />
          </div>

          {/* Interactive Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Question Card */}
            <Card className="group bg-card/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-love-coral/5 to-love-heart/5 opacity-0 group-active:opacity-100 group-focus:opacity-100 transition-opacity duration-300" />
              <CardContent className="relative p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-love-coral/20 to-love-heart/20 flex items-center justify-center group-active:scale-110 group-focus:scale-110 transition-transform duration-300">
                    <MessageSquareQuote className="text-love-coral h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">Today's Question</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {pair && dailyQuestion ? dailyQuestion.question_text : "Daily questions help you connect deeper with your partner"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {pair && dailyQuestion && questionAnswers.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                          {questionAnswers.length}/2 answered
                        </div>
                      )}
                      <Button 
                        size="sm" 
                        className={`${questionAnswers.length > 0
                          ? 'bg-secondary' 
                          : 'bg-gradient-to-r from-love-heart to-love-coral active:from-love-coral active:to-love-heart active:scale-95 focus:ring-2 focus:ring-love-heart/20'} transition-all duration-200 font-medium transform`}
                        disabled={!pair || !dailyQuestion} 
                        onClick={handleAnswerQuestion}
                      >
                        {pair && dailyQuestion 
                          ? (questionAnswers.length > 0 ? "View Answers" : "Answer Now") 
                          : "Preview"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memory Vault Card */}
            {hasFeatureAccess(subscription.tier, 'memoryVault') ? (
              <Card className="group bg-card/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-br from-love-deep/5 to-love-soft/5 opacity-0 group-active:opacity-100 group-focus:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-love-deep/20 to-love-soft/20 flex items-center justify-center group-active:scale-110 group-focus:scale-110 transition-transform duration-300">
                      <Camera className="text-love-deep h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
                          Memory Vault
                          {subscription.tier === 'premium' && (
                            <Badge className="text-xs bg-gradient-to-r from-love-deep to-love-heart text-white border-0">
                              <Crown className="w-3 h-3 mr-1" />
                              Unlimited
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {pair ? "Your shared photos and precious moments together" : "Collect and share your special memories"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {pair && (
                          <div className="flex items-center gap-1 text-xs text-love-heart bg-love-light px-2 py-1 rounded-full">
                            <div className="w-1.5 h-1.5 bg-love-coral rounded-full"></div>
                            Active vault
                          </div>
                        )}
                        <Button 
                          size="sm" 
                          variant={pair ? "default" : "secondary"}
                          disabled={!pair} 
                          onClick={() => navigate('/app/memory-vault')}
                          className="transition-all duration-200 font-medium"
                        >
                          {pair ? "Browse Vault" : "Preview"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <UpgradePrompt 
                featureName="Memory Vault"
                requiredTier="premium"
              />
            )}

            {/* Calendar Card */}
            <Card className="group bg-card/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-active:opacity-100 group-focus:opacity-100 transition-opacity duration-300" />
              <CardContent className="relative p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-love-heart/20 to-love-coral/20 flex items-center justify-center group-active:scale-110 group-focus:scale-110 transition-transform duration-300">
                    <Calendar className="text-love-heart h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">Shared Calendar</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {pair ? "Plan dates and sync your schedules together" : "Organize your events and special dates"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant={pair ? "default" : "secondary"}
                        onClick={() => navigate('/app/calendar')}
                        className="transition-all duration-200 font-medium"
                      >
                        {pair ? "View Calendar" : "Preview"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Solo Mode - Invite Partner or Complete Profile */}
          {!pair && (() => {
            // Check if profile is complete
            const isProfileComplete = userProfile?.first_name && 
                                     userProfile?.display_name && 
                                     userProfile?.birth_date;
            
            if (isProfileComplete) {
              // Profile complete - prompt to invite partner
              return (
                <Card className="bg-gradient-to-r from-love-heart/10 via-card to-love-coral/10 border-love-heart/30 border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-r from-love-heart to-love-coral flex items-center justify-center shadow-lg">
                        <Heart className="text-white h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg">Invite Your Partner</h3>
                        <p className="text-muted-foreground">Connect with your partner to unlock all features together</p>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex items-center gap-1 text-xs text-love-heart bg-love-light px-2 py-1 rounded-full">
                            <Heart className="w-3 h-3" />
                            Ready to pair
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-love-heart to-love-coral hover:from-love-coral hover:to-love-heart text-white font-medium"
                            onClick={() => navigate('/pair-setup')}
                          >
                            Invite Partner
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            } else {
              // Profile incomplete
              return (
                <Card className="bg-gradient-to-r from-love-light/30 via-card to-love-soft/30 border-love-heart/20 border shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-r from-love-heart to-love-coral flex items-center justify-center shadow-lg">
                        <Users className="text-white h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg">Complete Your Profile</h3>
                        <p className="text-muted-foreground">Set up your profile and get ready to connect with your partner</p>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
                            <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                            Profile incomplete
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-love-heart to-love-coral hover:from-love-coral hover:to-love-heart text-white font-medium"
                            onClick={() => navigate('/app/profile')}
                          >
                            Setup Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
          })()}
          
          {/* Achievements Section for Free Users */}
          {subscription.tier === 'free' && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-love-deep mb-4">Your Progress 🏆</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <AchievementBadge
                  icon={Smile}
                  title="Mood Tracker"
                  description="Log your moods daily"
                  progress={moodCount}
                  total={3}
                />
                <AchievementBadge
                  icon={MessageSquareQuote}
                  title="Love Letters"
                  description="Send messages to your partner"
                  progress={messageCount}
                  total={10}
                />
                <AchievementBadge
                  icon={Calendar}
                  title="Event Planner"
                  description="Create calendar events together"
                  progress={eventCount}
                  total={5}
                />
                <AchievementBadge
                  icon={Flame}
                  title="Streak Keeper"
                  description="Maintain your daily streak"
                  progress={streak}
                  total={7}
                />
              </div>
            </div>
          )}

          {/* Reunion Countdown Widget */}
          {pair && (
            <div className="mt-6">
              <ReunionCountdown pairId={pair.id} />
            </div>
          )}


          {/* Locked Features Preview - Tier-aware */}
          {subscription.tier === 'free' && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-love-deep mb-4">Unlock Premium Features ✨</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <LockedFeatureCard
                  icon={TrendingUp}
                  title="Mood Analytics"
                  description="Track mood patterns and get insights about your relationship"
                  requiredTier="premium"
                  preview="See trends, get AI recommendations, partner support alerts"
                />
                <LockedFeatureCard
                  icon={Target}
                  title="Unlimited Goals"
                  description="Create unlimited relationship goals and track progress together"
                  requiredTier="premium"
                  preview="Kanban boards, AI suggestions, task assignments"
                />
                <LockedFeatureCard
                  icon={Video}
                  title="Video Calls"
                  description="Connect face-to-face with up to 30-minute video calls"
                  requiredTier="premium"
                  preview="HD quality, call history, quality tracking"
                />
                <LockedFeatureCard
                  icon={Zap}
                  title="Unlimited AI Chat"
                  description="Get unlimited relationship advice from Proxima AI"
                  requiredTier="premium"
                  preview="Personalized advice, book recommendations, date ideas"
                />
              </div>
            </div>
          )}

          {/* Smart Upgrade CTA - only shows for free users */}
          <div className="mt-6">
            <UpgradeCTA />
          </div>

          {/* Upgrade Banner for Free Users */}
          {subscription.tier === 'free' && (
            <Card className="bg-gradient-to-r from-love-heart via-love-coral to-love-deep text-white border-0 shadow-xl mt-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Unlock Premium Features
                    </h3>
                    <p className="text-white/90 text-sm mb-4">
                      Get unlimited mood tracking, analytics, goals, memory vault, and video calls
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                        Mood Analytics
                      </Badge>
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                        Unlimited Goals
                      </Badge>
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                        Video Calls
                      </Badge>
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                        Unlimited AI
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    size="lg"
                    className="bg-white text-love-heart hover:bg-white/90 font-bold whitespace-nowrap"
                    onClick={() => navigate('/app/subscription')}
                  >
                    Upgrade Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <ProximaFloatingChat />

      {/* Daily Question Dialog */}
      {pair && dailyQuestion && user && (
        <DailyQuestionDialog
          open={showQuestionDialog}
          onOpenChange={setShowQuestionDialog}
          question={dailyQuestion}
          pairId={pair.id}
          userId={user.id}
          partnerAnswered={questionAnswers.some(a => a.user_id !== user.id)}
          onAnswerSubmitted={handleAnswerSubmitted}
        />
      )}
    </div>
  );
};

export default AppHome;