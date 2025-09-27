import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video, Mic } from 'lucide-react';
import { isMobileDevice } from '@/config/webrtc';
import MobileCallOptimizer from '@/utils/mobileOptimizations';

interface CallNotificationMobileProps {
  isVisible: boolean;
  isVideo: boolean;
  callerName: string;
  callerAvatar?: string;
  onAccept: () => void;
  onDecline: () => void;
  duration?: number; // Auto-decline duration in seconds
}

export const CallNotificationMobile: React.FC<CallNotificationMobileProps> = ({
  isVisible,
  isVideo,
  callerName,
  callerAvatar,
  onAccept,
  onDecline,
  duration = 30
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [mobileOptimizer] = useState(() => new MobileCallOptimizer());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = isMobileDevice();

  useEffect(() => {
    if (!isVisible) return;

    // Mobile-specific optimizations for incoming call
    if (isMobile) {
      mobileOptimizer.acquireWakeLock();
      mobileOptimizer.optimizeViewportForCalls();
      
      // Vibrate on mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 300, 500]);
      }

      // Request notification permission for future calls
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onDecline(); // Auto-decline when timer reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (isMobile) {
        mobileOptimizer.cleanup();
      }
    };
  }, [isVisible, onDecline, isMobile, mobileOptimizer]);

  const handleAccept = async () => {
    if (isMobile) {
      // Enter fullscreen for better mobile experience
      try {
        await mobileOptimizer.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.warn('Could not enter fullscreen:', error);
      }
    }
    onAccept();
  };

  const handleDecline = () => {
    if (isMobile) {
      mobileOptimizer.cleanup();
    }
    onDecline();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-primary/95 to-primary-foreground/95 backdrop-blur-sm">
      {/* Background pattern for visual appeal */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_0)] bg-[length:20px_20px]" />
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 text-center">
        {/* Caller Information */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Avatar className="w-32 h-32 mx-auto ring-4 ring-white/30 ring-offset-4 ring-offset-transparent">
              <AvatarImage src={callerAvatar} />
              <AvatarFallback className="text-2xl bg-white/20 text-white">
                {callerName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            {/* Animated rings around avatar */}
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-white/20 animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              {callerName}
            </h2>
            <div className="flex items-center justify-center gap-2 text-white/80">
              {isVideo ? <Video className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              <span className="text-lg">
                Incoming {isVideo ? 'video' : 'voice'} call
              </span>
            </div>
            
            {/* Auto-decline timer */}
            <div className="text-white/60">
              <span className="text-sm">Auto-decline in {timeLeft}s</span>
              <div className="w-48 h-1 bg-white/20 rounded-full mx-auto mt-2">
                <div 
                  className="h-full bg-white/60 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(timeLeft / duration) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8">
          {/* Decline Button */}
          <Button
            onClick={handleDecline}
            size="lg"
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 border-4 border-white/30 shadow-2xl transition-all duration-200 hover:scale-110"
          >
            <PhoneOff className="h-6 w-6 text-white" />
          </Button>

          {/* Accept Button */}
          <Button
            onClick={handleAccept}
            size="lg"
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 border-4 border-white/30 shadow-2xl transition-all duration-200 hover:scale-110"
          >
            <Phone className="h-6 w-6 text-white" />
          </Button>
        </div>

        {/* Mobile-specific tips */}
        {isMobile && (
          <div className="mt-8 text-white/60 text-sm max-w-sm">
            <p>For the best experience, ensure your device is charged and connected to WiFi</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallNotificationMobile;