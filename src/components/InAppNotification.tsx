import { useEffect, useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface InAppNotificationProps {
  isVisible: boolean;
  title: string;
  message: string;
  avatar?: string;
  onClose: () => void;
  onClick?: () => void;
  duration?: number;
}

export const InAppNotification = ({
  isVisible,
  title,
  message,
  avatar,
  onClose,
  onClick,
  duration = 5000
}: InAppNotificationProps) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 transform ${
        isShowing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className="bg-card border border-border rounded-lg shadow-2xl p-4 cursor-pointer hover:shadow-3xl transition-shadow"
        onClick={() => {
          onClick?.();
          setIsShowing(false);
          setTimeout(onClose, 300);
        }}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={avatar} alt={title} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {title.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <p className="font-semibold text-sm text-foreground truncate">
                  {title}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsShowing(false);
                  setTimeout(onClose, 300);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
