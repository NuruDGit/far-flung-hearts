import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useActivePair } from '@/hooks/useActivePair';
import AppNavigation from '@/components/AppNavigation';
import MoodLogger from '@/components/MoodLogger';
import WeatherWidget from '@/components/WeatherWidget';
import { toast } from 'sonner';
import {
  WelcomeHeader,
  PartnerStatusWidget,
  QuickActionsWidget,
  StatsWidget,
  DailyQuestionWidget
} from '@/components/DashboardWidgets';
import { SoloDashboard } from '@/components/SoloDashboard';
import { Button } from '@/components/ui/button';
import { Plus, Users, Gift, Gamepad2, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const AppHome = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { pair, loading: pairLoading } = useActivePair();

  const [partner, setPartner] = useState<any>(null);
  // Initialize with fallback metadata to avoid 'Greeting flicker'
  const [userProfile, setUserProfile] = useState<any>(() => {
    if (!user) return null;
    const meta = user.user_metadata;
    return {
      id: user.id,
      display_name: meta?.display_name || meta?.full_name || meta?.first_name || user.email?.split('@')[0],
      first_name: meta?.first_name,
      city: meta?.city,
      relationship_start_date: meta?.relationship_start_date
    };
  });
  const [loading, setLoading] = useState(true);

  // Data States
  const [dailyQuestion, setDailyQuestion] = useState<any>(null);
  const [questionAnswers, setQuestionAnswers] = useState<any[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [moodCount, setMoodCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchUserData = async () => {
      // 1. Always fetch User Profile if we have a user
      if (user) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, display_name, first_name, avatar_url, city, country, relationship_start_date')
            .eq('id', user.id)
            .maybeSingle();

          if (profileError) {
            console.error('AppHome: Profile fetch error:', profileError);
          }

          setUserProfile(profileData);
          if (profileData) {
            console.log("AppHome: Fetched profile successfully:", profileData.display_name);
          } else {
            console.warn("AppHome: No profile data found for user:", user.id);
          }

          // Check if mandatory onboarding fields are present
          if (!pairLoading && profileData && (!profileData.display_name || !profileData.city || !profileData.relationship_start_date)) {
            // Only redirect if NOT loading pair (to avoid race conditions) and profile is incomplete
            // But wait, the user may be invited and joined via code, so we should check carefully.
            // For now, simple check:
            if (!profileData.city) { navigate('/onboarding'); }
          }

          // BETTER APPROACH: explicit check effect below

        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }

      // 2. Fetch pair data IF pair exists
      if (user && pair) {
        try {
          // Get partner
          // Get partner
          const partnerId = pair.user_a === user.id ? pair.user_b : pair.user_a;
          const { data: partnerData } = await supabase
            .from('profiles') // Assuming RLS allows reading basic partner info
            .select('*')
            .eq('id', partnerId)
            .single();

          setPartner(partnerData);

          // Get Streak
          const { data: streakData } = await supabase.rpc('calculate_pair_streak', {
            target_pair_id: pair.id
          });
          setStreak(streakData || 0);

          // Get Question
          const { data: questionData } = await supabase.rpc('get_or_create_daily_question', {
            target_pair_id: pair.id
          });

          if (questionData && questionData.length > 0) {
            setDailyQuestion(questionData[0]);
            const { data: answersData } = await supabase
              .from('daily_question_answers')
              .select('*')
              .eq('daily_question_id', questionData[0].id);
            setQuestionAnswers(answersData || []);
          }

          // Get counts
          const today = new Date().toISOString().split('T')[0];
          const { count: moodC } = await supabase.from('mood_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('date', today);
          setMoodCount(moodC || 0);

          const { count: msgC } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('pair_id', pair.id);
          setMessageCount(msgC || 0);
        } catch (error) {
          console.error('Error fetching pair data:', error);
        }
      }

      // 3. Mark loading as done. We don't wait for everything if pairLoading is true.
      // But we generally want to wait for at least the initial profile fetch.
      if (!pairLoading) {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, pair, pairLoading]);

  // --- Handlers ---
  const handleAnswerQuestion = () => {
    if (!dailyQuestion) return;
    if (questionAnswers.length > 0) {
      navigate(`/app/daily-question-answers?questionId=${dailyQuestion.id}`);
    } else {
      // In a real app, open the dialog. For now, navigate to answers page as fallback or trigger dialog
      navigate(`/app/daily-question-answers?questionId=${dailyQuestion.id}`);
    }
  };

  const sendLoveMessage = async () => {
    if (!pair) return;
    toast.promise(
      supabase.from('messages').insert({
        pair_id: pair.id,
        sender_id: user?.id,
        type: 'text',
        body: { message: '💖 Sent you some love!', type: 'love_tap' }
      }),
      {
        loading: 'Sending love...',
        success: 'Love sent! 💕',
        error: 'Failed to send'
      }
    );
  };

  const sendPing = async () => {
    if (!pair) return;
    toast.promise(
      supabase.from('messages').insert({
        pair_id: pair.id,
        sender_id: user?.id,
        type: 'text',
        body: { message: '👋 Thinking of you!', type: 'ping' }
      }),
      {
        loading: 'Sending ping...',
        success: 'Ping sent! 👋',
        error: 'Failed to send'
      }
    );
  };

  // --- Onboarding Check ---
  useEffect(() => {
    if (userProfile && !loading) {
      // If profile is loaded but missing critical info, redirect to onboarding
      // We check for 'city' as a proxy for completed onboarding (Step 2)
      if (!userProfile.city || !userProfile.display_name) {
        navigate('/onboarding');
      }
    }
  }, [userProfile, loading, navigate]);

  // --- Render ---

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-muted/20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="min-h-screen bg-[#FDFBFB]">
      <AppNavigation />

      <main className="container mx-auto px-4 py-6 max-w-5xl space-y-8 pb-24 md:pb-12">
        {/* Header Section - Only show if paired, otherwise SoloDashboard handles it */}
        {pair && <WelcomeHeader userProfile={userProfile} partner={partner} />}

        {/* Pair Stats & Status */}
        {pair ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            {/* 1. Status Card */}
            <div className="md:col-span-2 lg:col-span-2">
              <PartnerStatusWidget
                partner={partner}
                userProfile={userProfile}
                pair={pair}
              />
            </div>

            {/* 2. Weather or Compact Stats */}
            <div className="h-full">
              {partner?.city ? (
                <WeatherWidget
                  partnerCity={partner.city}
                  partnerCountry={partner.country}
                  partnerName={partner.first_name}
                />
              ) : (
                <StatsWidget streak={streak} moodCount={moodCount} messageCount={messageCount} />
              )}
            </div>
          </div>
        ) : (
          // No Pair State - Enhanced Solo Dashboard
          <SoloDashboard userProfile={userProfile} />
        )}

        {/* Quick Actions & Daily Feature */}
        {pair && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {/* Daily Question - Highlighted */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                Today's Conversation
              </h2>
              <DailyQuestionWidget
                question={dailyQuestion}
                answers={questionAnswers}
                onClick={handleAnswerQuestion}
              />
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <QuickActionsWidget
                onSendLove={sendLoveMessage}
                onPing={sendPing}
                onSharePhoto={() => navigate('/app/messages')}
              />
            </div>
          </div>
        )}

        {/* Features Grid */}
        {pair && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <h2 className="text-lg font-semibold mb-4">Explore</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="ghost"
                className="h-auto py-6 flex flex-col gap-3 bg-white hover:bg-white hover:shadow-md border border-border/50 transition-all group"
                onClick={() => navigate('/app/mood')}
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Smile size={20} />
                </div>
                <span className="font-medium text-sm">Mood Log</span>
              </Button>

              <Button
                variant="ghost"
                className="h-auto py-6 flex flex-col gap-3 bg-white hover:bg-white hover:shadow-md border border-border/50 transition-all group"
                onClick={() => navigate('/app/wishlist')}
              >
                <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Gift size={20} />
                </div>
                <span className="font-medium text-sm">Wishlist</span>
              </Button>

              <Button
                variant="ghost"
                className="h-auto py-6 flex flex-col gap-3 bg-white hover:bg-white hover:shadow-md border border-border/50 transition-all group"
                onClick={() => navigate('/app/games')}
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Gamepad2 size={20} />
                </div>
                <span className="font-medium text-sm">Games</span>
              </Button>

              <Button
                variant="ghost"
                className="h-auto py-6 flex flex-col gap-3 bg-white hover:bg-white hover:shadow-md border border-border/50 transition-all group"
                onClick={() => navigate('/app/messages')}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Video size={20} />
                </div>
                <span className="font-medium text-sm">Video Call</span>
              </Button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AppHome;