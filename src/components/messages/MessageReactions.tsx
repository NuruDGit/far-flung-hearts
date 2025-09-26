import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
}

const REACTION_EMOJIS = ['❤️', '😍', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '🎉'];

export const MessageReactions = ({
  messageId,
  reactions,
  onAddReaction,
  onRemoveReaction
}: MessageReactionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleReactionClick = (emoji: string, userReacted: boolean) => {
    if (userReacted) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
  };

  const handleAddReaction = (emoji: string) => {
    onAddReaction(messageId, emoji);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {reactions.map((reaction) => (
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
                ? 'h-8 w-8 p-0 opacity-60 min-w-[44px]' 
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