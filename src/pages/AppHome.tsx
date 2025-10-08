import { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Clock, Zap, Camera, LogOut, Users, Plus, Flame, MessageSquareQuote, Users2, MoreVertical, Smile, Settings, User, Calendar, Crown, Target, TrendingUp, Video } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  const [moodCount, setMoodCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

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
          setLoadingStreak(true);
          const { data: streakData } = await supabase.rpc('calculate_pair_streak', {
            target_pair_id: pair.id
          });
          setStreak(streakData || 0);
          setLoadingStreak(false);
          
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-heart"></div>
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
      <div className="container mx-auto p-4 max-w-md lg:max-w-4xl pt-6 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-love-deep">
              {getGreeting()}, {getUserDisplayName()}!
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-love-coral/10 hover:text-love-coral transition-colors">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm border border-love-coral/20">
              <DropdownMenuItem 
                onClick={() => navigate('/app/profile')}
                className="cursor-pointer hover:bg-love-light/20"
              >
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/app/mood')}
                className="cursor-pointer hover:bg-love-light/20"
              >
                <Smile className="mr-2 h-4 w-4" />
                Mood Tracker
                {!hasFeatureAccess(subscription.tier, 'moodLogging') && (
                  <Badge variant="outline" className="ml-auto text-xs">Free</Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  if (hasFeatureAccess(subscription.tier, 'moodAnalytics')) {
                    navigate('/app/mood/analytics');
                  } else {
                    toast.error('Mood Analytics requires Premium');
                    navigate('/app/subscription');
                  }
                }}
                className="cursor-pointer hover:bg-love-light/20"
              >
                <Zap className="mr-2 h-4 w-4" />
                Mood Analytics
                {!hasFeatureAccess(subscription.tier, 'moodAnalytics') && (
                  <Badge variant="outline" className="ml-auto text-xs bg-love-heart/10 text-love-heart border-love-heart/30">Premium</Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  if (hasFeatureAccess(subscription.tier, 'goals')) {
                    navigate('/app/goals');
                  } else {
                    toast.error('Goals requires Premium');
                    navigate('/app/subscription');
                  }
                }}
                className="cursor-pointer hover:bg-love-light/20"
              >
                <Heart className="mr-2 h-4 w-4" />
                Relationship Goals
                {!hasFeatureAccess(subscription.tier, 'goals') && (
                  <Badge variant="outline" className="ml-auto text-xs bg-love-heart/10 text-love-heart border-love-heart/30">Premium</Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/app/messages')}
                className="cursor-pointer hover:bg-love-light/20"
              >
                <MessageSquareQuote className="mr-2 h-4 w-4" />
                Messages
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-love-coral/20" />
              <DropdownMenuItem 
                onClick={signOut}
                className="cursor-pointer hover:bg-red-50 text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Solo Mode - Invite Partner Banner */}
        {!pair && (
          <Card className="mb-6 bg-gradient-to-r from-love-heart to-love-coral text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Ready to connect?</h3>
                  <p className="text-sm opacity-90">Invite your partner to unlock all features</p>
                </div>
                <Link to="/pair-setup">
                  <Button size="sm" variant="secondary" className="bg-white text-love-heart hover:bg-white/90">
                    <Plus className="w-4 h-4 mr-1" />
                    Invite
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weather Widget - Show partner's city weather (or user's city if no partner) */}
        {pair && (
          <WeatherWidget 
            partnerCity={partner?.city || userProfile?.city} 
            partnerCountry={partner?.country || userProfile?.country}
            partnerName={partner?.first_name || partner?.display_name}
          />
        )}

        {/* Partner Card - Only show if paired */}
        {pair && partner && (
          <Card className="mb-6 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="flex items-center relative">
                  <div className="w-14 h-14 rounded-full love-gradient p-1 shadow-lg z-10">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={userProfile?.avatar_url} />
                      <AvatarFallback className="bg-love-gradient text-white">
                        {userProfile?.display_name?.charAt(0).toUpperCase() || userProfile?.first_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="w-14 h-14 rounded-full love-gradient p-1 shadow-lg -ml-4">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={partner.avatar_url} />
                      <AvatarFallback className="bg-love-gradient text-white">
                        {partner.display_name?.charAt(0).toUpperCase() || <Heart size={20} />}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{partner.display_name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Active now
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Clock className="h-5 w-5 mx-auto mb-1 text-love-coral" />
                  <p className="text-sm text-muted-foreground">Their time</p>
                  <p className="font-semibold">{currentTime}</p>
                </div>
                <div>
                  <Flame className="h-5 w-5 mx-auto mb-1 text-accent" />
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="font-semibold">
                    {loadingStreak ? '--' : `${streak} ${streak === 1 ? 'day' : 'days'}`}
                  </p>
                </div>
                <div>
                  <MessageSquareQuote className="h-5 w-5 mx-auto mb-1 text-love-deep" />
                  <p className="text-sm text-muted-foreground">Messages</p>
                  <p className="font-semibold">{messageCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Solo Mode - Demo Partner Card */}
        {!pair && (
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border-dashed border-2 border-love-coral/30">
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
              <div className="flex justify-between text-center opacity-50">
                <div>
                  <Clock className="h-5 w-5 mx-auto mb-1 text-love-coral" />
                  <p className="text-sm text-muted-foreground">Their time</p>
                  <p className="font-semibold">--:--</p>
                </div>
                <div>
                  <Flame className="h-5 w-5 mx-auto mb-1 text-love-heart" />
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="font-semibold">-- days</p>
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
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer active:scale-95 focus:ring-2 focus:ring-love-heart/20 transition-transform bg-white/80 backdrop-blur-sm ${!pair ? 'opacity-50' : ''}`}
              onClick={pair ? action.action : () => {}}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mx-auto mb-2`}>
                  <action.icon className="text-white" size={20} />
                </div>
                <p className="text-sm font-medium">{action.label}</p>
                {!pair && (
                  <p className="text-xs text-muted-foreground mt-1">Pair to unlock</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

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
          <div className="grid md:grid-cols-2 gap-4">
            {/* Daily Question Card */}
            <Card className="group bg-card/95 backdrop-blur-sm border-0 shadow-lg active:shadow-xl focus:ring-2 focus:ring-love-heart/20 transition-all duration-300 overflow-hidden">
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
              <Card className="group bg-card/95 backdrop-blur-sm border-0 shadow-lg active:shadow-xl focus:ring-2 focus:ring-love-deep/20 transition-all duration-300 overflow-hidden">
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
            <Card className="group bg-card/95 backdrop-blur-sm border-0 shadow-lg active:shadow-xl focus:ring-2 focus:ring-primary/20 transition-all duration-300 overflow-hidden">
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
                <Card className="bg-gradient-to-r from-love-heart/10 via-card to-love-coral/10 border-love-heart/30 border shadow-lg hover:shadow-xl transition-all duration-300">
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