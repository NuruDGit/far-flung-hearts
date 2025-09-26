import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor,
  Minimize2,
  Maximize2,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react';

interface VideoCallInterfaceProps {
  isActive: boolean;
  isIncoming: boolean;
  isConnected: boolean;
  isMicOn: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  callDuration: number;
  partnerId?: string;
  partnerName?: string;
  partnerAvatar?: string;
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'disconnected';
  isReconnecting?: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  onAccept: () => void;
  onDecline: () => void;
  onEnd: () => void;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
}

export const VideoCallInterface = (props: VideoCallInterfaceProps) => {
  const {
    isActive,
    isIncoming,
    isConnected,
    isMicOn,
    isVideoOn,
    isScreenSharing,
    callDuration,
    partnerId,
    partnerName,
    partnerAvatar,
    connectionQuality = 'excellent',
    isReconnecting = false,
    localVideoRef,
    remoteVideoRef,
    onAccept,
    onDecline,
    onEnd,
    onToggleMic,
    onToggleVideo,
    onToggleScreenShare,
  } = props;

  const [isMinimized, setIsMinimized] = useState(false);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionIcon = () => {
    if (isReconnecting) return <AlertTriangle className="h-4 w-4 text-yellow-500 animate-pulse" />;
    
    switch (connectionQuality) {
      case 'excellent':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'good':
        return <Wifi className="h-4 w-4 text-yellow-500" />;
      case 'poor':
        return <Wifi className="h-4 w-4 text-red-500" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <Wifi className="h-4 w-4 text-green-500" />;
    }
  };

  const getConnectionText = () => {
    if (isReconnecting) return 'Reconnecting...';
    return connectionQuality?.charAt(0).toUpperCase() + connectionQuality?.slice(1);
  };

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.muted = true;
    }
  }, [localVideoRef]);

  if (!isActive) {
    return null;
  }

  // Incoming call screen
  if (isIncoming) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary/90 to-primary-foreground/90 backdrop-blur-sm">
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="text-center space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={partnerAvatar} />
                <AvatarFallback>
                  {partnerName?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {partnerName || 'Unknown'}
                </h3>
                <p className="text-white/80">
                  Incoming {isVideoOn ? 'video' : 'voice'} call
                </p>
                
                {/* Connection Quality Indicator */}
                <div className="flex items-center justify-center gap-2 mt-2">
                  {getConnectionIcon()}
                  <span className="text-sm text-white/60">{getConnectionText()}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-6 justify-center mt-8">
              <Button
                onClick={onDecline}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
              
              <Button
                onClick={onAccept}
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white"
              >
                <Phone className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Minimized call view
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-64 h-48 bg-black rounded-lg overflow-hidden shadow-lg">
        <div className="relative h-full">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
            <Badge variant="secondary" className="text-xs">
              {formatDuration(callDuration)}
            </Badge>
            
            <Button
              onClick={() => setIsMinimized(false)}
              variant="secondary"
              size="sm"
              className="w-6 h-6 p-0"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>

          <div className="absolute bottom-2 left-2 right-2 flex justify-center space-x-2">
            <Button
              onClick={onEnd}
              variant="destructive"
              size="sm"
              className="w-8 h-8 p-0 rounded-full"
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Full video call interface
  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full w-full">
        {/* Remote video (main view) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Call Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={partnerAvatar} />
              <AvatarFallback>
                {partnerName?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <p className="text-white font-medium">
                {partnerName || 'Unknown'}
              </p>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={isConnected ? "default" : "secondary"}
                  className="text-xs"
                >
                  {isConnected ? 'Connected' : 'Connecting...'}
                </Badge>
                <span className="text-white/80 text-sm">
                  {formatDuration(callDuration)}
                </span>
                
                {/* Connection Quality */}
                <div className="flex items-center gap-1">
                  {getConnectionIcon()}
                  <span className="text-xs text-white/60">{getConnectionText()}</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsMinimized(true)}
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Local video (picture-in-picture) */}
        <div className="absolute top-20 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden shadow-lg z-20">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Call Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center space-x-4 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
            <Button
              onClick={onToggleMic}
              variant={isMicOn ? "secondary" : "destructive"}
              size="sm"
              className="w-12 h-12 rounded-full"
            >
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
              onClick={onToggleVideo}
              variant={isVideoOn ? "secondary" : "destructive"}
              size="sm"
              className="w-12 h-12 rounded-full"
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button
              onClick={onToggleScreenShare}
              variant={isScreenSharing ? "default" : "secondary"}
              size="sm"
              className="w-12 h-12 rounded-full"
            >
              <Monitor className="h-5 w-5" />
            </Button>

            <Button
              onClick={onEnd}
              variant="destructive"
              size="sm"
              className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Reconnection Overlay */}
        {isReconnecting && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
            <div className="text-center text-white">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p className="text-lg font-medium">Reconnecting...</p>
              <p className="text-sm opacity-80">Please wait while we restore your connection</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};