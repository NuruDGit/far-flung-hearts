import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export const useActivePair = () => {
  const { user } = useAuth();
  const [pair, setPair] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivePair = async () => {
      if (!user) {
        setPair(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('pairs')
          .select('*')
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching active pair:', error);
          setPair(null);
        } else {
          setPair(data && data.length > 0 ? data[0] : null);
        }
      } catch (error) {
        console.error('Unexpected error fetching active pair:', error);
        setPair(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActivePair();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('pairs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pairs',
        },
        (payload) => {
          // Refetch on any pair change
          fetchActivePair();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { pair, loading };
};
