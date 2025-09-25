import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { MoreVertical, Edit3, Trash2, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MessageBubbleProps {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  type?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReply?: (id: string) => void;
}

export const MessageBubble = ({
  id,
  content,
  senderId,
  createdAt,
  isOwn,
  senderName,
  senderAvatar,
  type = 'text',
  onEdit,
  onDelete,
  onReply
}: MessageBubbleProps) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const timestamp = new Date(createdAt);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  const fullTime = format(timestamp, 'PPP p');

  // Check if message is emoji only
  const isEmojiOnly = (text: string) => {
    const emojiRegex = /^[\p{Emoji}\s]*$/u;
    return emojiRegex.test(text) && text.trim().length > 0;
  };

  return (
    <div className={`flex items-start gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback className="bg-love-coral text-love-deep text-sm">
            {senderName?.charAt(0) || 'P'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className="group relative">
          {/* Emoji-only messages - no bubble */}
          {type === 'text' && isEmojiOnly(content) ? (
            <div className="text-4xl py-1 hover:scale-110 transition-transform duration-200">
              {content}
            </div>
          ) : (
            <div
              className={`rounded-2xl px-4 py-2 shadow-sm transition-all duration-200 ${
                isOwn
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground'
              }`}
            >
              {type === 'text' && (
                <>
                  {/* Special rendering for love messages */}
                  {content.includes('💖 Sent you some love!') ? (
                    <div className="flex items-center gap-2 text-center animate-scale-in">
                      <div className="text-2xl animate-pulse">💖</div>
                      <span className="text-sm font-medium">
                        Sent you some love!
                      </span>
                    </div>
                  ) : content.includes('👋 Thinking of you!') ? (
                    <div className="flex items-center gap-2 text-center animate-scale-in">
                      <div className="text-xl animate-bounce">👋</div>
                      <span className="text-sm font-medium">
                        Thinking of you!
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {content}
                    </p>
                  )}
                </>
              )}
              
              {type === 'system' && (
                <p className="text-xs text-muted-foreground italic text-center">
                  {content}
                </p>
              )}
            </div>
          )}
          
          {isOwn && (onEdit || onDelete) && (
            <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                >
                  <MoreVertical size={12} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {onReply && (
                  <DropdownMenuItem onClick={() => onReply(id)}>
                    <Reply size={14} className="mr-2" />
                    Reply
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(id)}>
                    <Edit3 size={14} className="mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <span 
          className="text-xs text-muted-foreground mt-1 px-1"
          title={fullTime}
        >
          {timeAgo}
        </span>
      </div>
    </div>
  );
};