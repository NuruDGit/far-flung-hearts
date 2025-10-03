import { useState, useEffect } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Copy, Users } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

      // Invoke secure edge function
      const { data, error } = await supabase.functions.invoke('join-pair', {
        body: { code: inviteCode.toUpperCase() }
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
    const link = `${window.location.origin}${window.location.pathname}?invite=${generatedCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard!');
  };

  if (mode === 'choose') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-love-light via-white to-love-coral/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="love-gradient rounded-full p-3">
                <Users className="text-white" size={32} />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
              Connect with Your Partner
            </CardTitle>
            <CardDescription>
              Create a pair or join using an invite code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setMode('create')}
              className="w-full" 
              variant="love"
            >
              Create New Pair
            </Button>
            <Button 
              onClick={() => setMode('join')}
              className="w-full" 
              variant="outline"
            >
              Join Existing Pair
            </Button>
            <Button 
              onClick={() => navigate('/app')}
              className="w-full" 
              variant="ghost"
            >
              Skip for Now - Explore Solo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-love-light via-white to-love-coral/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="love-gradient rounded-full p-3">
                <Heart className="text-white" size={32} />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
              Create Your Pair
            </CardTitle>
            <CardDescription>
              Generate an invite code for your partner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!generatedCode ? (
              <Button 
                onClick={createPair}
                disabled={loading}
                className="w-full" 
                variant="love"
              >
                {loading ? 'Creating...' : 'Generate Invite Code'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <Label>Your Invite Code</Label>
                  <div className="mt-2 p-4 bg-love-light/20 rounded-lg border-2 border-dashed border-love-coral">
                    <div className="text-2xl font-mono font-bold text-love-deep">
                      {generatedCode}
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={copyInviteLink}
                  className="w-full" 
                  variant="outline"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Invite Link
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  This code expires in 15 minutes. Share it with your partner to connect.
                </p>
              </div>
            )}
            <Button 
              onClick={() => setMode('choose')}
              variant="ghost"
              className="w-full"
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-love-light via-white to-love-coral/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="love-gradient rounded-full p-3">
              <Users className="text-white" size={32} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
            Join Your Partner
          </CardTitle>
          <CardDescription>
            Enter the invite code they shared with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Invite Code</Label>
            <Input
              id="code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="text-center text-lg font-mono"
            />
          </div>
          <Button 
            onClick={joinPair}
            disabled={loading || !inviteCode.trim()}
            className="w-full" 
            variant="love"
          >
            {loading ? 'Joining...' : 'Join Pair'}
          </Button>
          <Button 
            onClick={() => setMode('choose')}
            variant="ghost"
            className="w-full"
          >
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PairSetup;