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

interface CallQualityMetrics {
  video: 'good' | 'fair' | 'poor';
  audio: 'good' | 'fair' | 'poor';
  bandwidth: number;
  latency: number;
  packetLoss: number;
}

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
  peerConnection?: RTCPeerConnection | null;
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
    peerConnection,
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
  const [callQuality, setCallQuality] = useState<CallQualityMetrics>({
    video: 'good',
    audio: 'good',
    bandwidth: 0,
    latency: 0,
    packetLoss: 0
  });

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
    if (isReconnecting) return <AlertTriangle className="h-4 w-4 text-warning animate-pulse" />;
    
    switch (connectionQuality) {
      case 'excellent':
        return <Wifi className="h-4 w-4 text-success" />;
      case 'good':
        return <Wifi className="h-4 w-4 text-warning" />;
      case 'poor':
        return <Wifi className="h-4 w-4 text-destructive" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-destructive" />;
      default:
        return <Wifi className="h-4 w-4 text-success" />;
    }
  };

  const getConnectionText = () => {
    if (isReconnecting) return 'Reconnecting...';
    return connectionQuality?.charAt(0).toUpperCase() + connectionQuality?.slice(1);
  };

  const getConnectionColor = () => {
    if (isReconnecting) return 'bg-warning/20 text-warning';
    
    switch (connectionQuality) {
      case 'excellent':
        return 'bg-success/20 text-success';
      case 'good':
        return 'bg-warning/20 text-warning';
      case 'poor':
      case 'disconnected':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-success/20 text-success';
    }
  };

  useEffect(() => {
    if (localVideoRef?.current) {
      localVideoRef.current.muted = true;
    }
  }, [localVideoRef]);

  // Monitor call quality metrics
  useEffect(() => {
    if (!peerConnection || !isConnected) return;

    const monitorQuality = setInterval(async () => {
      try {
        const stats = await peerConnection.getStats();
        let videoPacketLoss = 0;
        let audioJitter = 0;
        let bytesReceived = 0;
        let packetsReceived = 0;
        let packetsLost = 0;

        stats.forEach((report) => {
          if (report.type === 'inbound-rtp') {
            if (report.kind === 'video') {
              packetsReceived = report.packetsReceived || 0;
              packetsLost = report.packetsLost || 0;
              bytesReceived = report.bytesReceived || 0;
              
              if (packetsReceived > 0) {
                videoPacketLoss = (packetsLost / (packetsReceived + packetsLost)) * 100;
              }
            } else if (report.kind === 'audio') {
              audioJitter = (report.jitter || 0) * 1000; // Convert to ms
            }
          }
        });

        setCallQuality({
          video: videoPacketLoss > 5 ? 'poor' : videoPacketLoss > 2 ? 'fair' : 'good',
          audio: audioJitter > 100 ? 'poor' : audioJitter > 50 ? 'fair' : 'good',
          bandwidth: packetsReceived > 0 ? (bytesReceived * 8) / 1024 : 0, // kbps
          latency: audioJitter,
          packetLoss: videoPacketLoss
        });
      } catch (error) {
        console.error('Error monitoring call quality:', error);
      }
    }, 2000);

    return () => clearInterval(monitorQuality);
  }, [peerConnection, isConnected]);

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
                className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
                
                {/* Connection Quality Badge */}
                <Badge 
                  variant="secondary" 
                  className={`text-xs flex items-center gap-1 ${getConnectionColor()}`}
                >
                  {getConnectionIcon()}
                  <span>{getConnectionText()}</span>
                </Badge>
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

        {/* Quality Indicator */}
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-20">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                callQuality.video === 'good' ? 'bg-success' :
                callQuality.video === 'fair' ? 'bg-warning' : 'bg-destructive'
              }`} />
              <span className="text-foreground text-xs font-medium">
                Video: {callQuality.video}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                callQuality.audio === 'good' ? 'bg-success' :
                callQuality.audio === 'fair' ? 'bg-warning' : 'bg-destructive'
              }`} />
              <span className="text-foreground text-xs font-medium">
                Audio: {callQuality.audio}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span>{callQuality.bandwidth.toFixed(0)} kbps</span>
              {callQuality.packetLoss > 0 && (
                <span>• {callQuality.packetLoss.toFixed(1)}% loss</span>
              )}
            </div>
          </div>
        </div>

        {/* Local video (picture-in-picture) */}
        <div className="absolute top-36 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden shadow-lg z-20">
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

        {/* Connection Issue Overlays */}
        {isReconnecting && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30">
            <div className="text-center text-white space-y-4 max-w-sm p-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-warning/20 animate-ping" />
                <AlertTriangle className="h-12 w-12 mx-auto text-warning relative z-10 animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold">Connection Issues</p>
                <p className="text-sm text-white/80">
                  We're working to restore your connection. Please wait...
                </p>
              </div>
              <div className="flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        
        {connectionQuality === 'poor' && !isReconnecting && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30">
            <Badge variant="destructive" className="flex items-center gap-2 px-4 py-2">
              <Wifi className="h-4 w-4" />
              <span>Poor connection quality</span>
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};