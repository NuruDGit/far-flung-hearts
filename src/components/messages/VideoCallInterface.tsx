import { useState, useRef, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface VideoCallInterfaceProps {
  isActive: boolean;
  isIncoming?: boolean;
  partnerName?: string;
  partnerAvatar?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onEndCall: () => void;
  onToggleMic?: () => void;
  onToggleVideo?: () => void;
  onToggleScreenShare?: () => void;
  isMicOn?: boolean;
  isVideoOn?: boolean;
  isScreenSharing?: boolean;
  callDuration?: number;
}

export const VideoCallInterface = ({
  isActive,
  isIncoming = false,
  partnerName = 'Partner',
  partnerAvatar,
  onAccept,
  onDecline,
  onEndCall,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  isMicOn = true,
  isVideoOn = true,
  isScreenSharing = false,
  callDuration = 0
}: VideoCallInterfaceProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Initialize local video stream
    const initializeVideo = async () => {
      if (isVideoOn && localVideoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
          localVideoRef.current.srcObject = stream;
        } catch (error) {
          console.error('Error accessing media devices:', error);
        }
      }
    };

    if (isActive) {
      initializeVideo();
    }

    return () => {
      // Cleanup video streams
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, isVideoOn]);

  if (!isActive) return null;

  if (isIncoming) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="p-8 max-w-sm w-full mx-4 text-center space-y-6">
          <div className="space-y-4">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src={partnerAvatar} alt={partnerName} />
              <AvatarFallback className="bg-love-gradient text-white text-2xl">
                {partnerName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{partnerName}</h2>
              <p className="text-muted-foreground">Incoming video call</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button
              onClick={onDecline}
              variant="destructive"
              size="lg"
              className="rounded-full h-14 w-14 p-0"
            >
              <PhoneOff size={24} />
            </Button>
            <Button
              onClick={onAccept}
              variant="default"
              size="lg"
              className="rounded-full h-14 w-14 p-0 bg-green-500 hover:bg-green-600"
            >
              <Phone size={24} />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-48 h-32 overflow-hidden">
          <div className="relative w-full h-full">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs">
                {formatDuration(callDuration)}
              </Badge>
            </div>
            <div className="absolute top-2 right-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsMinimized(false)}
                className="h-6 w-6 p-0"
              >
                <Minimize2 size={12} />
              </Button>
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex justify-center">
              <Button
                onClick={onEndCall}
                variant="destructive"
                size="sm"
                className="rounded-full h-8 w-8 p-0"
              >
                <PhoneOff size={14} />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={partnerAvatar} alt={partnerName} />
            <AvatarFallback className="bg-love-gradient text-white">
              {partnerName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{partnerName}</h2>
            <p className="text-sm text-muted-foreground">
              {formatDuration(callDuration)}
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMinimized(true)}
        >
          <Minimize2 size={16} />
        </Button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-muted">
        {/* Remote video (main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Remote video placeholder */}
        {!remoteVideoRef.current?.srcObject && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Avatar className="w-32 h-32 mx-auto">
                <AvatarImage src={partnerAvatar} alt={partnerName} />
                <AvatarFallback className="bg-love-gradient text-white text-4xl">
                  {partnerName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground">Connecting...</p>
            </div>
          </div>
        )}

        {/* Local video (pip) */}
        <div className="absolute top-4 right-4 w-48 h-32 bg-muted rounded-lg overflow-hidden border-2 border-border">
          {isVideoOn ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <VideoOff className="text-muted-foreground" size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-t border-border">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isMicOn ? "outline" : "destructive"}
            size="lg"
            onClick={onToggleMic}
            className="rounded-full h-14 w-14 p-0"
          >
            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
          </Button>

          <Button
            variant={isVideoOn ? "outline" : "destructive"}
            size="lg"
            onClick={onToggleVideo}
            className="rounded-full h-14 w-14 p-0"
          >
            {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={onToggleScreenShare}
            className="rounded-full h-14 w-14 p-0"
          >
            <Monitor size={24} />
          </Button>

          <Button
            onClick={onEndCall}
            variant="destructive"
            size="lg"
            className="rounded-full h-14 w-14 p-0"
          >
            <PhoneOff size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
};