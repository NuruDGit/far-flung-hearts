import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import AppNavigation from '@/components/AppNavigation';
import LoveAdvisor from '@/components/LoveAdvisor';

const AdvisorPage = () => {
  const { user, loading: authLoading } = useAuth();
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
        // No active pair - user can still use advisor
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-love-light via-white to-love-coral/10">
      <AppNavigation />
      <div className="container mx-auto p-4 max-w-2xl pt-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Love Advisor</h1>
          <p className="text-gray-600">
            Get personalized relationship advice, communication tips, and romantic ideas from our AI love expert.
          </p>
        </div>
        
        <LoveAdvisor pairId={pair?.id} />
      </div>
    </div>
  );
};

export default AdvisorPage;