import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, Vibrate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CallNotificationMobileProps {
  isVisible: boolean;
  isVideo?: boolean;
  callerName?: string;
  callerAvatar?: string;
  onAccept: () => void;
  onDecline: () => void;
  duration?: number;
}

export const CallNotificationMobile = ({
  isVisible,
  isVideo = false,
  callerName = 'Partner',
  callerAvatar,
  onAccept,
  onDecline,
  duration = 30
}: CallNotificationMobileProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(duration);
      return;
    }

    // Vibrate on incoming call (mobile only)
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, duration, onDecline]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/95 to-primary-foreground/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
      {/* Pulsing rings effect */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
        
        <Avatar className="w-28 h-28 ring-4 ring-white/30 relative z-10">
          <AvatarImage src={callerAvatar} alt={callerName} />
          <AvatarFallback className="bg-white/20 text-white text-4xl">
            {callerName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2.5 z-20">
          {isVideo ? (
            <Video className="text-primary" size={20} />
          ) : (
            <Phone className="text-primary" size={20} />
          )}
        </div>
      </div>

      <div className="mt-8 text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">{callerName}</h2>
        <p className="text-white/80 text-lg">
          {isVideo ? 'Video' : 'Voice'} call
        </p>
        <div className="flex items-center justify-center gap-2 text-white/60">
          <Vibrate size={16} className="animate-pulse" />
          <span className="text-sm">
            Ringing... ({timeLeft}s)
          </span>
        </div>
      </div>

      {/* Call action buttons */}
      <div className="mt-12 flex items-center justify-center gap-16">
        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={onDecline}
            variant="destructive"
            size="lg"
            className="rounded-full h-16 w-16 p-0 bg-destructive hover:bg-destructive/90 shadow-2xl"
          >
            <PhoneOff size={28} />
          </Button>
          <span className="text-white/80 text-sm font-medium">Decline</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={onAccept}
            variant="default"
            size="lg"
            className="rounded-full h-16 w-16 p-0 bg-success hover:bg-success/90 shadow-2xl animate-pulse"
          >
            <Phone size={28} />
          </Button>
          <span className="text-white/80 text-sm font-medium">Accept</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-8 w-full max-w-xs">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / duration) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
