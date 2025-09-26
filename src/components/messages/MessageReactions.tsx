import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus } from 'lucide-react';

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
          className="h-6 px-2 text-xs rounded-full"
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
            className="h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus size={12} />
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
                className="h-8 w-8 p-0 text-lg hover:bg-secondary"
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