import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { MessagesList } from '@/components/messages/MessagesList';
import { MessageInput } from '@/components/messages/MessageInput';
import { VideoCallInterface } from '@/components/messages/VideoCallInterface';
import { CallNotification } from '@/components/messages/CallNotification';
import { useVideoCall } from '@/hooks/useVideoCall';
import AppNavigation from '@/components/AppNavigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  body: any;
  sender_id: string;
  created_at: string;
  type: string;
  media_url?: string;
}

interface Profile {
  id: string;
  display_name?: string;
  avatar_url?: string;
}

interface Pair {
  id: string;
  user_a: string;
  user_b: string;
  status: string;
}

const MessagesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pair, setPair] = useState<Pair | null>(null);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [isOnline, setIsOnline] = useState(false);
  
  // Video call functionality
  const {
    callState,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    endCall,
    declineCall,
    toggleMic,
    toggleVideo,
    toggleScreenShare,
  } = useVideoCall(user?.id || '', pair?.id);

  const partner = pair && profiles ? 
    profiles[pair.user_a === user?.id ? pair.user_b : pair.user_a] : null;

  useEffect(() => {
    if (user) {
      fetchPairAndMessages();
    }
  }, [user]);

  useEffect(() => {
    if (pair && user) {
      // Subscribe to real-time messages
      const channel = supabase
        .channel('messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `pair_id=eq.${pair.id}`
        }, (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Show notification for partner's messages
          if (newMessage.sender_id !== user.id) {
            toast({
              title: "New message",
              description: typeof newMessage.body === 'string' ? newMessage.body : "New message received",
            });
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [pair, user]);

  const fetchPairAndMessages = async () => {
    if (!user) return;

    try {
      // Get user's active pair
      const { data: pairData, error: pairError } = await supabase
        .from('pairs')
        .select('*')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .eq('status', 'active')
        .single();

      if (pairError && pairError.code !== 'PGRST116') {
        console.error('Error fetching pair:', pairError);
        return;
      }

      if (!pairData) {
        setLoading(false);
        return;
      }

      setPair(pairData);

      // Fetch profiles for both users
      const userIds = [pairData.user_a, pairData.user_b];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      } else {
        const profilesMap = profilesData.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, Profile>);
        setProfiles(profilesMap);
      }

      // Fetch messages for this pair
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('pair_id', pairData.id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive"
        });
      } else {
        setMessages(messagesData || []);
      }
    } catch (error) {
      console.error('Error in fetchPairAndMessages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !pair || !content.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          pair_id: pair.id,
          sender_id: user.id,
          body: { text: content },
          type: 'text'
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const startVideoCall = async () => {
    if (partner?.id) {
      await startCall(partner.id, true);
    }
  };

  const startVoiceCall = async () => {
    if (partner?.id) {
      await startCall(partner.id, false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pair) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
          <Card className="p-8 max-w-md mx-4 text-center">
            <h2 className="text-xl font-semibold mb-4">No Active Connection</h2>
            <p className="text-muted-foreground mb-6">
              You need to be paired with someone to start messaging. Create or join a pair first.
            </p>
            <Link to="/pair-setup">
              <Button className="love-gradient">
                Set Up Connection
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      
      {/* Incoming Call Notification */}
      <CallNotification
        isVisible={callState.isIncoming}
        isVideo={callState.isVideoOn}
        callerName={partner?.display_name || 'Partner'}
        callerAvatar={partner?.avatar_url}
        onAccept={acceptCall}
        onDecline={declineCall}
      />

      {/* Video Call Interface */}
      <VideoCallInterface
        isActive={callState.isActive && !callState.isIncoming}
        partnerName={partner?.display_name || 'Partner'}
        partnerAvatar={partner?.avatar_url}
        onEndCall={endCall}
        onToggleMic={toggleMic}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        isMicOn={callState.isMicOn}
        isVideoOn={callState.isVideoOn}
        isScreenSharing={callState.isScreenSharing}
        callDuration={callState.callDuration}
      />

      <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-border bg-background/95 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/app" className="md:hidden">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={20} />
                </Button>
              </Link>
              
              <Avatar className="w-10 h-10">
                <AvatarImage src={partner?.avatar_url} alt={partner?.display_name} />
                <AvatarFallback className="bg-love-gradient text-white">
                  {partner?.display_name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="font-semibold text-lg">
                  {partner?.display_name || 'Partner'}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={isOnline ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={startVideoCall}
                className="p-2"
              >
                <Video size={16} />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <MoreVertical size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <MessagesList
          messages={messages}
          currentUserId={user?.id || ''}
          profiles={profiles}
          loading={loading}
        />

        {/* Message Input */}
        <MessageInput
          onSendMessage={sendMessage}
          onStartVoiceCall={startVoiceCall}
          onStartVideoCall={startVideoCall}
          disabled={sending}
          placeholder={`Message ${partner?.display_name || 'your partner'}...`}
        />
      </div>
    </div>
  );
};

export default MessagesPage;