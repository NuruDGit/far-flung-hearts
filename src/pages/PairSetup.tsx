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

      const { data: pairs } = await supabase
        .from('pairs')
        .select('*')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .maybeSingle();

      if (pairs) {
        setExistingPair(pairs);
      }
    };

    checkExistingPair();

    // Subscribe to realtime pair updates
    const channel = supabase
      .channel('pair-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pairs',
          filter: `user_a=eq.${user.id},user_b=eq.${user.id}`
        },
        (payload) => {
          console.log('Pair update received:', payload);
          if (payload.new) {
            setExistingPair(payload.new);
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

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
      // Find valid invite
      const { data: invites, error: inviteError } = await supabase
        .from('pair_invites')
        .select('*, pairs(*)')
        .eq('code', inviteCode.toUpperCase())
        .gt('expires_at', new Date().toISOString());

      if (inviteError) {
        console.error('Invite query error:', inviteError);
        toast.error('Error checking invite code');
        return;
      }

      if (!invites || invites.length === 0) {
        toast.error('Invalid or expired invite code');
        return;
      }

      const invite = invites[0];

      // Update pair with second user
      const { data: updatedPair, error: updateError } = await supabase
        .from('pairs')
        .update({
          user_b: user.id,
          status: 'active'
        })
        .eq('id', invite.pair_id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Clean up invite
      await supabase
        .from('pair_invites')
        .delete()
        .eq('code', inviteCode.toUpperCase());

      // Update local state immediately
      setExistingPair(updatedPair);

      toast.success('Successfully joined pair! Welcome to Love Beyond Borders.');
      
      // Explicit navigation as fallback
      setTimeout(() => {
        navigate('/app');
      }, 1000);
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