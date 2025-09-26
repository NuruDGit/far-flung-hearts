import { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Clock, Zap, Camera, LogOut, Users, Plus, Flame, MessageSquareQuote, Users2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import AppNavigation from '@/components/AppNavigation';
import ProximaFloatingChat from '@/components/ProximaFloatingChat';
import MoodLogger from '@/components/MoodLogger';
import WeatherWidget from '@/components/WeatherWidget';
import { toast } from 'sonner';

const AppHome = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [pair, setPair] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyQuestion, setDailyQuestion] = useState<any>(null);
  const [streak, setStreak] = useState<number>(0);
  const [loadingStreak, setLoadingStreak] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setUserProfile(profileData);

        // Get pair
        const { data: pairData } = await supabase
          .from('pairs')
          .select('*')
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
          .eq('status', 'active')
          .single();

        if (pairData) {
          setPair(pairData);
          
          // Calculate streak
          setLoadingStreak(true);
          const { data: streakData } = await supabase.rpc('calculate_pair_streak', {
            target_pair_id: pairData.id
          });
          setStreak(streakData || 0);
          setLoadingStreak(false);
          
          // Get partner profile
          const partnerId = pairData.user_a === user.id ? pairData.user_b : pairData.user_a;
          const { data: partnerData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', partnerId)
            .single();
          
          setPartner(partnerData);
          console.log('Partner data fetched:', partnerData);

          // Get daily question for the pair
          const { data: questionData } = await supabase.rpc('get_or_create_daily_question', {
            target_pair_id: pairData.id
          });
          
          if (questionData && questionData.length > 0) {
            setDailyQuestion(questionData[0]);
          }

        }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLoadingStreak(false);
        } finally {
          setLoading(false);
        }
    };

    fetchUserData();
  }, [user]);

  const handleAnswerQuestion = async () => {
    if (!pair || !dailyQuestion) return;
    
    try {
      // Mark question as answered
      await supabase
        .from('daily_questions')
        .update({ 
          answered_by: user.id, 
          answered_at: new Date().toISOString() 
        })
        .eq('id', dailyQuestion.id);

      // Navigate to messages with the question pre-filled
      const message = `Today's Question: ${dailyQuestion.question_text}`;
      localStorage.setItem('prefilledMessage', message);
      window.location.href = '/app/messages';
    } catch (error) {
      console.error('Error marking question as answered:', error);
      toast.error('Failed to process question');
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
          <div>
            <h1 className="text-2xl font-bold text-love-deep">
              {getGreeting()}, {getUserDisplayName()}!
            </h1>
            <p className="text-muted-foreground">
              {partner ? `Connected with ${partner.first_name || partner.display_name}` : 'Exploring solo'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-5 w-5" />
          </Button>
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
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
                  <p className="font-semibold">{new Date().toLocaleTimeString()}</p>
                </div>
                <div>
                  <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="font-semibold">
                    {loadingStreak ? '--' : `${streak} ${streak === 1 ? 'day' : 'days'}`}
                  </p>
                </div>
                <div>
                  <MessageSquareQuote className="h-5 w-5 mx-auto mb-1 text-love-deep" />
                  <p className="text-sm text-muted-foreground">Messages</p>
                  <p className="font-semibold">--</p>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer hover:scale-105 transition-transform bg-white/80 backdrop-blur-sm ${!pair ? 'opacity-50' : ''}`}
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
        <div className="grid lg:grid-cols-2 gap-3 space-y-3 lg:space-y-0">
          <div className="lg:col-span-2">
            {/* Mood Logger */}
            <MoodLogger compact={true} pairId={pair?.id} />
          </div>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-love-coral/20 flex items-center justify-center">
                   <MessageSquareQuote className="text-love-coral" size={16} />
                 </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Today's Question</h3>
                    <p className="text-sm text-muted-foreground">
                      {pair && dailyQuestion ? dailyQuestion.question_text : "Preview: Daily questions to share together"}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant={pair && dailyQuestion && !dailyQuestion.answered_by ? "love" : "outline"} 
                    disabled={!pair || !dailyQuestion} 
                    onClick={handleAnswerQuestion}
                  >
                    {pair && dailyQuestion ? (dailyQuestion.answered_by ? "Answered ✓" : "Answer") : "Preview"}
                  </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-love-deep/20 flex items-center justify-center">
                  <Camera className="text-love-deep" size={16} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Memory Vault</h3>
                   <p className="text-sm text-muted-foreground">
                     {pair ? "Your shared photos and videos" : "Your shared memories will appear here"}
                   </p>
                </div>
                 <Button size="sm" variant="outline" disabled={!pair} onClick={() => navigate('/memory-vault')}>
                   {pair ? "View" : "Preview"}
                 </Button>
              </div>
            </CardContent>
          </Card>

          {/* Solo Mode - Personal Profile Setup */}
          {!pair && (
            <Card className="bg-white/80 backdrop-blur-sm border-love-heart/20 lg:col-span-2">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-love-heart/20 flex items-center justify-center">
                    <Users className="text-love-heart" size={16} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Complete Your Profile</h3>
                    <p className="text-sm text-muted-foreground">Set up your profile while you explore</p>
                  </div>
                  <Button size="sm" variant="love">Setup</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <ProximaFloatingChat />
    </div>
  );
};

export default AppHome;