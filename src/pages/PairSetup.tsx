import { useState, useEffect } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Copy, Users, Loader2, Share2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ensureCSRFToken } from '@/lib/csrf';

const PairSetup = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingPair, setExistingPair] = useState<any>(null);

  // Check if user already has a pair
  useEffect(() => {
    const checkExistingPair = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('pairs')
        .select('*')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('checkExistingPair error:', error);
      }

      if (data && data.length > 0) {
        setExistingPair(data[0]);
      }
    };

    checkExistingPair();

    // Subscribe to realtime pair updates
    const channel = supabase
      .channel('pair-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pairs' },
        (payload) => {
          const row = (payload.new || payload.old) as any;
          if (!row) return;
          if (row.user_a === user.id || row.user_b === user.id) {
            setExistingPair(payload.new ? payload.new : row);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Auto-join if invite code in URL
  useEffect(() => {
    const code = searchParams.get('invite');
    if (code) {
      setInviteCode(code);
      setMode('join');
    }
  }, [searchParams]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (existingPair?.status === 'active') {
    return <Navigate to="/app" replace />;
  }

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createPair = async () => {
    setLoading(true);
    try {
      // Ensure profile exists before creating pair
      await ensureProfileExists();

      // PREVENT MULTIPLE PENDING PAIRS: Check if user already has active or pending pair
      const { data: existingPairs, error: checkError } = await supabase
        .from('pairs')
        .select('id, status')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (checkError) throw checkError;

      if (existingPairs && existingPairs.length > 0) {
        const existingPair = existingPairs[0];
        if (existingPair.status === 'active') {
          toast.error('You already have an active pair.');
          navigate('/app', { replace: true });
          return;
        } else if (existingPair.status === 'pending') {
          // Fetch existing invite code
          const { data: inviteData } = await supabase
            .from('pair_invites')
            .select('code')
            .eq('pair_id', existingPair.id)
            .gt('expires_at', new Date().toISOString())
            .limit(1);

          if (inviteData && inviteData.length > 0) {
            setGeneratedCode(inviteData[0].code);
            toast.success('Using your existing invite code.');
            setLoading(false);
            return;
          }
        }
      }

      const code = generateInviteCode();

      // Create pair
      const { data: pair, error: pairError } = await supabase
        .from('pairs')
        .insert({
          user_a: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (pairError) throw pairError;

      // Create invite
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes

      const { error: inviteError } = await supabase
        .from('pair_invites')
        .insert({
          code,
          created_by: user.id,
          pair_id: pair.id,
          expires_at: expiresAt.toISOString()
        });

      if (inviteError) throw inviteError;

      setGeneratedCode(code);
      toast.success('Invite code created! Share it with your partner.');
    } catch (error: any) {
      toast.error('Failed to create pair: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const ensureProfileExists = async () => {
    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // Create profile if it doesn't exist
      if (!profile) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            display_name: user.email?.split('@')[0] || 'User',
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
      throw error;
    }
  };

  const joinPair = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    setLoading(true);
    try {
      // Ensure profile exists before joining pair
      await ensureProfileExists();

      // Get CSRF token for secure request
      const csrfToken = ensureCSRFToken();

      // Invoke secure edge function
      const { data, error } = await supabase.functions.invoke('join-pair', {
        body: { code: inviteCode.toUpperCase() },
        headers: {
          'x-csrf-token': csrfToken
        }
      });

      if (error) {
        console.error('join-pair error:', error);
        // error can be string or object depending on SDK
        const msg = typeof error === 'string' ? error : (error.message || 'Failed to join pair');
        toast.error(msg);
        return;
      }

      if (!data || !(data as any).pair) {
        toast.error('Failed to join pair');
        return;
      }

      const { pair } = data as any;
      setExistingPair(pair);

      toast.success('Successfully joined pair! Welcome to Love Beyond Borders.');
      navigate('/app');
    } catch (error: any) {
      toast.error('Failed to join pair: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/pair-setup?invite=${generatedCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard!');
  };

  const Container = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-love-light via-background to-love-coral/5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        {children}
      </div>
    </div>
  );

  if (mode === 'choose') {
    return (
      <Container>
        <Card className="border-none shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 rounded-full p-4 ring-8 ring-primary/5">
                <Users className="text-primary" size={32} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-love-deep bg-clip-text text-transparent">
              One Step Closer
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Connect with your partner to start your journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Button
              onClick={() => setMode('create')}
              className="w-full h-12 text-base shadow-love hover:shadow-lg transition-all"
              variant="love"
            >
              I want to create a new pair
            </Button>
            <Button
              onClick={() => setMode('join')}
              className="w-full h-12 text-base"
              variant="outline"
            >
              I have an invite code
            </Button>
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            <Button
              onClick={() => navigate('/app')}
              className="w-full text-muted-foreground hover:text-foreground"
              variant="ghost"
            >
              Just exploring? Skip for now
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (mode === 'create') {
    return (
      <Container>
        <Card className="border-none shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-love-coral/20 rounded-full p-4 animate-pulse">
                <Heart className="text-love-heart" size={32} />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Create Your Pair</CardTitle>
            <CardDescription>
              Share this code with your partner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!generatedCode ? (
              <div className="space-y-4">
                <p className="text-center text-muted-foreground">
                  We'll generate a unique code for you to share securely with your partner.
                </p>
                <Button
                  onClick={createPair}
                  disabled={loading}
                  className="w-full h-11"
                  variant="love"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : 'Generate Invite Code'}
                </Button>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                  <Label className="text-muted-foreground">Your Invite Code</Label>
                  <div className="p-6 bg-muted/50 rounded-xl border-2 border-dashed border-primary/20 relative group hover:border-primary/40 transition-colors">
                    <div className="text-4xl font-mono font-bold tracking-widest text-primary select-all">
                      {generatedCode}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={copyInviteLink}
                    className="w-full"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                  <Button
                    onClick={() => {
                      const link = `${window.location.origin}/pair-setup?invite=${generatedCode}`;
                      if (navigator.share) {
                        navigator.share({
                          title: 'Join me on Love Beyond Borders',
                          text: `Here is my invite code: ${generatedCode}`,
                          url: link
                        }).catch(console.error);
                      } else {
                        copyInviteLink();
                      }
                    }}
                    className="w-full"
                    variant="outline"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg flex gap-3 text-sm text-blue-700 dark:text-blue-300">
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  <p>Waiting for your partner to join... The screen will update automatically.</p>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Code expires in 15 minutes.
                </p>
              </div>
            )}
            <Button
              onClick={() => setMode('choose')}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card className="border-none shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 rounded-full p-4">
              <Users className="text-primary" size={32} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Join Partner</CardTitle>
          <CardDescription>
            Enter the code shared by your partner in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="sr-only">Invite Code</Label>
            <Input
              id="code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              maxLength={6}
              className="text-center text-3xl font-mono tracking-widest h-16 uppercase placeholder:text-muted-foreground/50"
            />
          </div>
          <Button
            onClick={joinPair}
            disabled={loading || !inviteCode.trim()}
            className="w-full h-11"
            variant="love"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...
              </>
            ) : 'Join Pair'}
          </Button>
          <Button
            onClick={() => setMode('choose')}
            variant="ghost"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PairSetup;