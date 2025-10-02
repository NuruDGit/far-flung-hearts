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
    <div className="fixed inset-0 z-50 pointer-events-none">

      {/* Main chat dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-20 md:bottom-8 right-4 md:right-6 pointer-events-auto rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:bg-gray-50 border-2 border-love-heart p-0 hover:scale-110 z-40"
          >
            <div className="relative">
              <Avatar className="h-14 w-14">
                <AvatarImage src={proximaAvatar} alt="Proxima" className="object-cover" />
                <AvatarFallback className="bg-love-heart text-white">
                  <Bot className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse border-2 border-white"></div>
            </div>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="fixed inset-0 translate-x-0 translate-y-0 p-0 border-0 rounded-none bg-gradient-to-br from-love-light via-white to-love-coral/10 flex flex-col overflow-hidden" aria-describedby="proxima-chat-description">
          <div className="flex flex-col h-full min-h-0">
            {/* Enhanced Header */}
            <DialogHeader className="p-4 border-b border-love-coral/20 bg-white/90 backdrop-blur-sm flex-shrink-0">
              <DialogTitle className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-love-heart to-love-coral p-0.5 shadow-md">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={proximaAvatar} alt="Proxima" className="object-cover" />
                      <AvatarFallback className="bg-love-heart text-white">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-love-deep text-left">Proxima</h2>
                  <p className="text-xs text-muted-foreground">Your AI Love Assistant</p>
                </div>
              </DialogTitle>
              <DialogDescription id="proxima-chat-description" className="sr-only">
                Chat with Proxima, your AI love assistant for relationship advice and support
              </DialogDescription>
            </DialogHeader>
            
            {/* Chat Content - Full Height */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <LoveAdvisor pairId={pair?.id} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProximaFloatingChat;