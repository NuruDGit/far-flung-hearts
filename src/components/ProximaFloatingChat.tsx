import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bot, MessageCircle } from 'lucide-react';
import LoveAdvisor from './LoveAdvisor';
import { useAuth } from './auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

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
          className="fixed bottom-24 md:bottom-8 right-6 z-50 rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-love-heart to-love-coral hover:from-love-heart/90 hover:to-love-coral/90 transition-all duration-300 hover:scale-110"
        >
          <div className="relative">
            <Bot className="h-6 w-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl w-[95vw] h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-love-heart">
            <div className="relative">
              <Bot className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            Proxima - Your Love Assistant
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 p-6 pt-0">
          <LoveAdvisor pairId={pair?.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProximaFloatingChat;