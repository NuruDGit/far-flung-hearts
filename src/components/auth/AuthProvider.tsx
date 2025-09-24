import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, additionalData?: { firstName?: string; lastName?: string; phoneNumber?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        // Create profile if user signs in and doesn't have one yet
        if (event === 'SIGNED_IN' && session?.user && !user) {
          await ensureProfile(session.user);
        }
        
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      // Ensure profile exists for existing session
      if (session?.user) {
        await ensureProfile(session.user);
      }
      
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};