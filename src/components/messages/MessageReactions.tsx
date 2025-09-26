import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  isSelected?: boolean;
}

const REACTION_EMOJIS = ['❤️', '😍', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '🎉'];

export const MessageReactions = ({
  messageId,
  reactions,
  onAddReaction,
  onRemoveReaction,
  isSelected = false
}: MessageReactionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localReactions, setLocalReactions] = useState<Reaction[]>(reactions);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    setLocalReactions(reactions);
  }, [reactions]);

  // Set up real-time subscription for reactions
  useEffect(() => {
    const channel = supabase
      .channel('message-reactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`
        },
        () => {
          // Refetch reactions when changes occur
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId]);

  const fetchReactions = async () => {
    try {
      const { data: reactionsData, error } = await supabase
        .from('message_reactions')
        .select('emoji, user_id')
        .eq('message_id', messageId);

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      // Group reactions by emoji
      const reactionGroups: { [emoji: string]: { count: number; userReacted: boolean } } = {};
      
      reactionsData?.forEach(reaction => {
        if (!reactionGroups[reaction.emoji]) {
          reactionGroups[reaction.emoji] = { count: 0, userReacted: false };
        }
        reactionGroups[reaction.emoji].count++;
        if (reaction.user_id === currentUserId) {
          reactionGroups[reaction.emoji].userReacted = true;
        }
      });

      const formattedReactions: Reaction[] = Object.entries(reactionGroups).map(([emoji, data]) => ({
        emoji,
        count: data.count,
        userReacted: data.userReacted
      }));

      setLocalReactions(formattedReactions);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleReactionClick = async (emoji: string, userReacted: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please log in to react to messages", variant: "destructive" });
        return;
      }

      if (userReacted) {
        await removeReaction(emoji);
      } else {
        await addReaction(emoji);
      }

      // Call parent callbacks if provided
      if (userReacted && onRemoveReaction) {
        onRemoveReaction(messageId, emoji);
      } else if (!userReacted && onAddReaction) {
        onAddReaction(messageId, emoji);
      }
    } catch (error) {
      toast({ title: "Failed to update reaction", variant: "destructive" });
    }
  };

  const handleAddReaction = async (emoji: string) => {
    await addReaction(emoji);
    if (onAddReaction) {
      onAddReaction(messageId, emoji);
    }
    setIsOpen(false);
  };

  const addReaction = async (emoji: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji
        });

      if (error) throw error;
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique constraint violation - user already reacted with this emoji
        return;
      }
      throw error;
    }
  };

  const removeReaction = async (emoji: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {localReactions.map((reaction) => (
        <Button
          key={reaction.emoji}
          variant={reaction.userReacted ? "secondary" : "ghost"}
          size="sm"
          onClick={() => handleReactionClick(reaction.emoji, reaction.userReacted)}
          className={`${isMobile ? 'h-8 px-3 text-sm min-w-[44px]' : 'h-6 px-2 text-xs'} rounded-full active:scale-95 transition-transform`}
        >
          <span className="mr-1">{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </Button>
      ))}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full transition-all active:scale-95 ${
              isMobile 
                ? `h-8 w-8 p-0 min-w-[44px] ${isSelected ? 'opacity-100' : 'opacity-0'}` 
                : 'h-6 w-6 p-0 opacity-0 group-hover:opacity-100'
            } hover:opacity-100`}
          >
            <Plus size={isMobile ? 16 : 12} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          <div className="grid grid-cols-5 gap-1">
            {REACTION_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => handleAddReaction(emoji)}
                className={`${
                  isMobile ? 'h-10 w-10 min-w-[44px]' : 'h-8 w-8'
                } p-0 text-lg hover:bg-secondary active:bg-secondary active:scale-95 transition-all`}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};