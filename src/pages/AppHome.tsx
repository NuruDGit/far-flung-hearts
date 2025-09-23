import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Clock, Zap, Camera, LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

const AppHome = () => {
  const { user, signOut } = useAuth();
  const [pair, setPair] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPairAndPartner = async () => {
      if (!user) return;

      try {
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
        console.error('Error fetching pair:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPairAndPartner();
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

  if (!pair) {
    return <Navigate to="/pair-setup" replace />;
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-love-light via-white to-love-coral/10">
      <div className="container mx-auto p-4 max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-love-deep">Good morning!</h1>
            <p className="text-muted-foreground">Connected with {partner?.display_name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Partner Card */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-love-gradient flex items-center justify-center">
                <Heart className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{partner?.display_name}</h2>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:scale-105 transition-transform bg-white/80 backdrop-blur-sm"
              onClick={action.action}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mx-auto mb-2`}>
                  <action.icon className="text-white" size={20} />
                </div>
                <p className="text-sm font-medium">{action.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Features */}
        <div className="space-y-3">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-love-coral/20 flex items-center justify-center">
                  <Heart className="text-love-coral" size={16} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Today's Question</h3>
                  <p className="text-sm text-muted-foreground">What made you smile today?</p>
                </div>
                <Button size="sm" variant="love">Start</Button>
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
                  <p className="text-sm text-muted-foreground">12 photos, 3 videos</p>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppHome;