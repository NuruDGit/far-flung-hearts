import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import AppNavigation from '@/components/AppNavigation';
import MoodLogger from '@/components/MoodLogger';
import { getFeatureLimit } from '@/config/subscriptionFeatures';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { Badge } from '@/components/ui/badge';

const MoodPage = () => {
  const { user, loading: authLoading, subscription } = useAuth();
  const [pair, setPair] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPair = async () => {
      if (!user) return;

      try {
        const { data: pairData } = await supabase
          .from('pairs')
          .select('*')
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
          .eq('status', 'active')
          .single();

        setPair(pairData);
      } catch (error) {
        // No active pair
      } finally {
        setLoading(false);
      }
    };

    fetchPair();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-heart"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const moodLimit = getFeatureLimit(subscription.tier, 'moodLogging');

  return (
    <div className="min-h-screen bg-gradient-to-br from-love-light via-white to-love-coral/10">
      <AppNavigation />
      <div className="container mx-auto p-4 max-w-2xl pt-6 pb-24">
        {moodLimit !== null && (
          <div className="mb-4">
            <UpgradePrompt 
              featureName="Unlimited Mood Logging"
              requiredTier="premium"
              compact={true}
            />
          </div>
        )}
        <MoodLogger pairId={pair?.id} />
      </div>
    </div>
  );
};

export default MoodPage;