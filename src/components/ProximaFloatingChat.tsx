import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bot, MessageCircle } from 'lucide-react';
import LoveAdvisor from './LoveAdvisor';
import { useAuth } from './auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import proximaAvatar from '@/assets/proxima-avatar.jpg';

const ProximaFloatingChat = () => {
  const { user } = useAuth();
  const [pair, setPair] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

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
        // No active pair - user can still use Proxima
      }
    };

    if (user) {
      fetchPair();
    }
  }, [user]);

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-24 md:bottom-8 right-6 z-50 rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:bg-gray-50 border-2 border-love-heart p-0 hover:scale-110"
        >
          <div className="relative">
            <Avatar className="h-14 w-14">
              <AvatarImage src={proximaAvatar} alt="Proxima" className="object-cover" />
              <AvatarFallback className="bg-love-heart text-white">
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl w-[95vw] h-[600px] max-h-[80vh] p-0 flex flex-col" aria-describedby="proxima-chat-description">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-love-heart">
            <Avatar className="h-8 w-8">
              <AvatarImage src={proximaAvatar} alt="Proxima" className="object-cover" />
              <AvatarFallback className="bg-love-heart text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            Proxima - Your Love Assistant
          </DialogTitle>
          <DialogDescription id="proxima-chat-description" className="sr-only">
            Chat with Proxima, your AI love assistant for relationship advice and support
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden p-6 pt-0">
          <LoveAdvisor pairId={pair?.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProximaFloatingChat;