import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { generateCSRFToken, storeCSRFToken, clearCSRFToken } from '@/lib/csrf';

interface SubscriptionInfo {
  subscribed: boolean;
  tier: 'free' | 'premium';
  product_id: string | null;
  subscription_end: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  subscription: SubscriptionInfo;
  checkSubscription: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  signUp: (email: string, password: string, additionalData?: { firstName?: string; lastName?: string; phoneNumber?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    subscribed: false,
    tier: 'free',
    product_id: null,
    subscription_end: null,
  });

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscription({
          subscribed: false,
          tier: 'free',
          product_id: null,
          subscription_end: null,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      if (data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error in checkSubscription:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Generate CSRF token on sign in
        if (event === 'SIGNED_IN' && session?.user) {
          const csrfToken = generateCSRFToken();
          storeCSRFToken(csrfToken);
          
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(() => {
            ensureProfile(session.user);
            checkSubscription();
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Clear CSRF token on sign out
          clearCSRFToken();
          setSubscription({
            subscribed: false,
            tier: 'free',
            product_id: null,
            subscription_end: null,
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Ensure profile exists and generate CSRF token for existing session
      if (session?.user) {
        const csrfToken = generateCSRFToken();
        storeCSRFToken(csrfToken);
        
        setTimeout(() => {
          ensureProfile(session.user);
          checkSubscription();
        }, 0);
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  // Auto-refresh subscription every minute
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        checkSubscription();
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const ensureProfile = async (user: User) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      // Only create if doesn't exist
      if (!existingProfile) {
        const displayName = user.user_metadata?.display_name || 
                           (user.user_metadata?.first_name && user.user_metadata?.last_name 
                             ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                             : user.email?.split('@')[0] || 'User');

        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            display_name: displayName,
            first_name: user.user_metadata?.first_name,
            last_name: user.user_metadata?.last_name,
            phone_number: user.user_metadata?.phone_number
          });
        
        if (error) {
          console.error('Error creating profile:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error ensuring profile:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, additionalData?: { firstName?: string; lastName?: string; phoneNumber?: string }) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: additionalData?.firstName,
          last_name: additionalData?.lastName,
          phone_number: additionalData?.phoneNumber,
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    return { error };
  };

  const value = {
    user,
    session,
    subscription,
    checkSubscription,
    refreshSubscription: checkSubscription, // Alias for clarity
    signUp,
    signIn,
    signOut,
    resetPassword,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};