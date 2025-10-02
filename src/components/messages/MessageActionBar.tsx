import { Star, Reply, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessageActionBarProps {
  messageId: string;
  isOwn: boolean;
  isFavorited: boolean;
  onFavorite: (messageId: string) => void;
  onReply: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onClose: () => void;
}

export const MessageActionBar = ({
  messageId,
  isOwn,
  isFavorited,
  onFavorite,
  onReply,
  onDelete,
  onClose
}: MessageActionBarProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`fixed ${isMobile ? 'bottom-4 left-4 right-4' : 'top-4 right-4'} z-50 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg animate-fade-in`}>
      <div className="flex items-center gap-2 justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFavorite(messageId)}
          className={`h-10 px-3 ${isFavorited ? 'text-accent' : 'text-muted-foreground'} hover:text-accent min-w-[44px]`}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Star size={18} fill={isFavorited ? "currentColor" : "none"} />
          <span className="ml-2 text-sm">
            {isFavorited ? 'Unfavorite' : 'Favorite'}
          </span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReply(messageId)}
          className="h-10 px-3 text-muted-foreground hover:text-primary min-w-[44px]"
          title="Reply to message"
        >
          <Reply size={18} />
          <span className="ml-2 text-sm">Reply</span>
        </Button>
        
        {isOwn && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(messageId)}
            className="h-10 px-3 text-muted-foreground hover:text-destructive min-w-[44px]"
            title="Delete message"
          >
            <Trash2 size={18} />
            <span className="ml-2 text-sm">Delete</span>
          </Button>
        )}
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-10 w-10 p-0 text-muted-foreground hover:text-foreground min-w-[44px]"
          title="Close"
        >
          <X size={18} />
        </Button>
      </div>
    </div>
  );
};