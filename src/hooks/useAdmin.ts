import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRoles = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsModerator(false);
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
          setIsModerator(false);
        } else {
          const roles = data?.map(r => r.role) || [];
          setIsAdmin(roles.includes('admin'));
          setIsModerator(roles.includes('moderator') || roles.includes('admin'));
        }
      } catch (error) {
        console.error('Error in useAdmin:', error);
        setIsAdmin(false);
        setIsModerator(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkRoles();
  }, [user]);

  return { isAdmin, isModerator, loading };
};
