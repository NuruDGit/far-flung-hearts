import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CallNotificationProps {
  isVisible: boolean;
  isVideo?: boolean;
  callerName?: string;
  callerAvatar?: string;
  onAccept: () => void;
  onDecline: () => void;
  duration?: number; // Duration to auto-dismiss
}

export const CallNotification = ({
  isVisible,
  isVideo = false,
  callerName = 'Partner',
  callerAvatar,
  onAccept,
  onDecline,
  duration = 30
}: CallNotificationProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(duration);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onDecline(); // Auto-decline when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, duration, onDecline]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in-0">
      <Card className="p-6 max-w-sm w-full mx-4 text-center space-y-6 shadow-2xl">
        <div className="space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24 mx-auto ring-4 ring-primary/20 animate-pulse">
              <AvatarImage src={callerAvatar} alt={callerName} />
              <AvatarFallback className="bg-love-gradient text-white text-2xl">
                {callerName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 bg-primary rounded-full p-2">
              {isVideo ? <Video className="text-white" size={16} /> : <Phone className="text-white" size={16} />}
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{callerName}</h2>
            <p className="text-muted-foreground">
              Incoming {isVideo ? 'video' : 'voice'} call
            </p>
            <div className="text-sm text-muted-foreground">
              Auto-decline in {timeLeft}s
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-6">
          <Button
            onClick={onDecline}
            variant="destructive"
            size="lg"
            className="rounded-full h-16 w-16 p-0 shadow-lg hover:scale-105 transition-transform"
          >
            <PhoneOff size={24} />
          </Button>
          <Button
            onClick={onAccept}
            variant="default"
            size="lg"
            className="rounded-full h-16 w-16 p-0 bg-primary hover:bg-primary/90 shadow-lg hover:scale-105 transition-transform"
          >
            <Phone size={24} />
          </Button>
        </div>
        
        <div className="flex justify-center">
          <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / duration) * 100}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};