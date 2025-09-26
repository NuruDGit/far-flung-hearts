import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ReplyContextProps {
  replyingTo: {
    id: string;
    content: string;
    senderName: string;
    senderAvatar?: string;
  };
  onCancel: () => void;
}

export const ReplyContext = ({ replyingTo, onCancel }: ReplyContextProps) => {
  const truncatedContent = replyingTo.content.length > 50 
    ? replyingTo.content.substring(0, 50) + '...' 
    : replyingTo.content;

  return (
    <div className="bg-secondary/50 border-l-4 border-primary p-3 mb-2 mx-4 rounded-r-lg animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Avatar className="w-6 h-6 flex-shrink-0">
            <AvatarImage src={replyingTo.senderAvatar} alt={replyingTo.senderName} />
            <AvatarFallback className="text-xs">
              {replyingTo.senderName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-medium">
              Replying to {replyingTo.senderName}
            </p>
            <p className="text-sm text-foreground/80 truncate">
              {truncatedContent}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-6 w-6 p-0 flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  );
};