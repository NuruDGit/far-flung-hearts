import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { MoreVertical, Edit3, Trash2, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageReactions } from './MessageReactions';
import { MessageActionBar } from './MessageActionBar';
import { useIsMobile } from '@/hooks/use-mobile';

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageBubbleProps {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  type?: string;
  mediaUrl?: string;
  reactions?: Reaction[];
  isFavorited?: boolean;
  replyToMessage?: {
    id: string;
    content: string;
    senderName: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReply?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
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
  mediaUrl,
  reactions = [],
  isFavorited = false,
  replyToMessage,
  onEdit,
  onDelete,
  onReply,
  onFavorite,
  onAddReaction,
  onRemoveReaction
}: MessageBubbleProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();
  
  // Auto-deselect after 10 seconds
  useEffect(() => {
    if (isSelected) {
      const timer = setTimeout(() => {
        setIsSelected(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isSelected]);

  // Long press detection for mobile
  const handleTouchStart = () => {
    if (isMobile) {
      const timer = setTimeout(() => {
        setIsSelected(true);
        // Add haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, 500); // 500ms for long press
      
      setLongPressTimer(timer);
      
      const handleTouchEnd = () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          setLongPressTimer(null);
        }
      };
      
      const handleTouchMove = () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          setLongPressTimer(null);
        }
      };
      
      document.addEventListener('touchend', handleTouchEnd, { once: true });
      document.addEventListener('touchmove', handleTouchMove, { once: true });
    }
  };
  
  const handleActionBarClose = () => {
    setIsSelected(false);
  };
  
  const timestamp = new Date(createdAt);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  const fullTime = format(timestamp, 'PPP p');

  // Check if message is emoji only
  const isEmojiOnly = (text: string) => {
    const emojiRegex = /^[\p{Emoji}\s]*$/u;
    return emojiRegex.test(text) && text.trim().length > 0;
  };

  return (
    <>
      {isSelected && (
        <MessageActionBar
          messageId={id}
          isOwn={isOwn}
          isFavorited={isFavorited}
          onFavorite={onFavorite || (() => {})}
          onReply={onReply || (() => {})}
          onDelete={onDelete || (() => {})}
          onClose={handleActionBarClose}
        />
      )}
      
      <div 
        className={`flex items-start gap-3 mb-4 group ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${
          isSelected ? 'bg-primary/5 rounded-lg p-2 -m-2 border border-primary/20' : ''
        } transition-all duration-200`}
        onTouchStart={handleTouchStart}
      >
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback className="bg-love-coral text-love-deep text-sm">
            {senderName?.charAt(0) || 'P'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] md:max-w-[60%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Reply context */}
        {replyToMessage && (
          <div className={`mb-2 text-xs p-2 rounded-lg bg-secondary/50 border-l-4 border-primary max-w-full ${
            isOwn ? 'ml-8' : 'mr-8'
          }`}>
            <p className="text-muted-foreground font-medium">
              Replying to {replyToMessage.senderName}
            </p>
            <p className="text-foreground/80 truncate">
              {replyToMessage.content.length > 40 
                ? replyToMessage.content.substring(0, 40) + '...' 
                : replyToMessage.content}
            </p>
          </div>
        )}
        
        <div className="group relative">
          {/* Emoji-only messages - no bubble */}
          {type === 'text' && isEmojiOnly(content) ? (
            <div className="text-4xl py-1 hover:scale-110 active:scale-105 transition-transform duration-200">
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
              
              {/* Media content */}
              {(type === 'image' || type === 'media') && mediaUrl && (
                <div className="space-y-2">
                  <img 
                    src={mediaUrl} 
                    alt="Shared image"
                    className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 active:opacity-80 transition-opacity"
                    style={{ maxHeight: '300px' }}
                    onClick={() => window.open(mediaUrl, '_blank')}
                  />
                  {content && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {content}
                    </p>
                  )}
                </div>
              )}
              
              {type === 'video' && mediaUrl && (
                <div className="space-y-2">
                  <video 
                    src={mediaUrl}
                    controls
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxHeight: '300px' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                  {content && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {content}
                    </p>
                  )}
                </div>
              )}
              
              {type === 'system' && (
                <p className="text-xs text-muted-foreground italic text-center">
                  {content}
                </p>
              )}
            </div>
          )}
          
          {(onEdit || onDelete || onReply) && (
            <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`absolute -top-2 -left-8 transition-opacity ${
                    isMobile 
                      ? 'opacity-60 h-8 w-8 p-0' 
                      : 'opacity-0 group-hover:opacity-100 h-6 w-6 p-0'
                  } active:opacity-100 hover:opacity-100`}
                >
                  <MoreVertical size={isMobile ? 16 : 12} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {onReply && (
                  <DropdownMenuItem onClick={() => onReply(id)}>
                    <Reply size={14} className="mr-2" />
                    Reply
                  </DropdownMenuItem>
                )}
                {isOwn && onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(id)}>
                    <Edit3 size={14} className="mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {isOwn && onDelete && (
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

        {/* Message Reactions */}
        {(reactions.length > 0 || onAddReaction) && (
          <MessageReactions
            messageId={id}
            reactions={reactions}
            onAddReaction={onAddReaction || (() => {})}
            onRemoveReaction={onRemoveReaction || (() => {})}
            isSelected={isSelected}
          />
        )}
      </div>
      </div>
    </>
  );
};