import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Clock, Zap, Camera, LogOut, Users, Plus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import AppNavigation from '@/components/AppNavigation';
import MoodLogger from '@/components/MoodLogger';

const AppHome = () => {
  const { user, signOut } = useAuth();
  const [pair, setPair] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          
          // Get partner profile
          const partnerId = pairData.user_a === user.id ? pairData.user_b : pairData.user_a;
          const { data: partnerData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', partnerId)
            .single();
          
          setPartner(partnerData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

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
      action: () => console.log("Send love tap"),
      color: "bg-love-heart"
    },
    {
      icon: Zap,
      label: "Quick Ping",
      action: () => console.log("Send ping"),
      color: "bg-love-coral"
    },
    {
      icon: Camera,
      label: "Share Sky",
      action: () => console.log("Share photo"),
      color: "bg-love-deep"
    }
  ];

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
      <div className="container mx-auto p-4 max-w-md pt-6 pb-24">
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

        {/* Partner Card - Only show if paired */}
        {pair && partner && (
          <Card className="mb-6 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={partner.avatar_url} />
                  <AvatarFallback className="bg-love-gradient text-white">
                    {partner.display_name?.charAt(0).toUpperCase() || <Heart size={20} />}
                  </AvatarFallback>
                </Avatar>
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
              <div className="flex justify-between text-center">
                <div>
                  <Clock className="h-5 w-5 mx-auto mb-1 text-love-coral" />
                  <p className="text-sm text-muted-foreground">Their time</p>
                  <p className="font-semibold">{new Date().toLocaleTimeString()}</p>
                </div>
                <div>
                  <Heart className="h-5 w-5 mx-auto mb-1 text-love-heart" />
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="font-semibold">7 days</p>
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
                  <Heart className="h-5 w-5 mx-auto mb-1 text-love-heart" />
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="font-semibold">-- days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
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
        <div className="space-y-3">
          {/* Mood Logger */}
          <MoodLogger compact={true} pairId={pair?.id} />

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-love-coral/20 flex items-center justify-center">
                  <Heart className="text-love-coral" size={16} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Today's Question</h3>
                  <p className="text-sm text-muted-foreground">
                    {pair ? "What made you smile today?" : "Preview: Daily questions to share together"}
                  </p>
                </div>
                <Button size="sm" variant={pair ? "love" : "outline"} disabled={!pair}>
                  {pair ? "Start" : "Preview"}
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
                    {pair ? "12 photos, 3 videos" : "Your shared memories will appear here"}
                  </p>
                </div>
                <Button size="sm" variant="outline" disabled={!pair}>
                  {pair ? "View" : "Preview"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Solo Mode - Personal Profile Setup */}
          {!pair && (
            <Card className="bg-white/80 backdrop-blur-sm border-love-heart/20">
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
    </div>
  );
};

export default AppHome;