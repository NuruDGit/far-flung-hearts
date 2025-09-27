import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  createRTCConfiguration, 
  getMobileOptimizedConstraints, 
  getBitrateConstraints,
  detectNetworkQuality,
  isMobileDevice,
  isWebRTCSupported,
  getOptimalVideoCodec
} from '@/config/webrtc';

interface CallState {
  isActive: boolean;
  isIncoming: boolean;
  isConnected: boolean;
  isMicOn: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  callDuration: number;
  partnerId?: string;
  callId?: string;
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'disconnected';
  isReconnecting?: boolean;
  callSessionId?: string;
}

interface UseVideoCallReturn {
  callState: CallState;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  startCall: (partnerId: string, isVideo?: boolean) => Promise<void>;
  acceptCall: () => Promise<void>;
  endCall: () => void;
  declineCall: () => void;
  toggleMic: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
}

export const useVideoCall = (userId: string, pairId?: string): UseVideoCallReturn => {
  const { toast } = useToast();
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    isIncoming: false,
    isConnected: false,
    isMicOn: true,
    isVideoOn: true,
    isScreenSharing: false,
    callDuration: 0,
    connectionQuality: 'excellent',
    isReconnecting: false,
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeChannelRef = useRef<any>(null);
  const qualityMonitorRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced WebRTC configuration with TURN servers for mobile reliability
  const [rtcConfig] = useState<RTCConfiguration>(() => createRTCConfiguration());
  const [networkQuality, setNetworkQuality] = useState<'slow' | 'fast'>('fast');
  const [isMobile] = useState(() => isMobileDevice());
  
  // Check WebRTC support on initialization
  useEffect(() => {
    if (!isWebRTCSupported()) {
      toast({
        title: 'Browser Not Supported',
        description: 'Your browser does not support video calls',
        variant: 'destructive',
      });
    }
    
    // Detect network quality for adaptive bitrate
    detectNetworkQuality().then(setNetworkQuality);
  }, [toast]);

  // Create or update call session in database
  const createCallSession = async (callerId: string, receiverId: string, callType: 'video' | 'audio') => {
    try {
      const { data, error } = await supabase
        .from('call_sessions')
        .insert({
          pair_id: pairId,
          caller_id: callerId,
          receiver_id: receiverId,
          call_type: callType,
          status: 'initiating',
          ice_config: JSON.parse(JSON.stringify(rtcConfig))
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create call session:', error);
      return null;
    }
  };

  const updateCallSession = async (sessionId: string, updates: any) => {
    try {
      await supabase
        .from('call_sessions')
        .update(updates)
        .eq('id', sessionId);
    } catch (error) {
      console.error('Failed to update call session:', error);
    }
  };

  // Log call quality metrics
  const logCallQuality = async (callSessionId: string, quality: any) => {
    try {
      await supabase.from('call_quality_logs').insert({
        call_session_id: callSessionId,
        connection_state: quality.connectionState,
        ice_connection_state: quality.iceConnectionState,
        audio_quality: quality.audioQuality,
        video_quality: quality.videoQuality,
        latency_ms: quality.latency,
        packet_loss_rate: quality.packetLoss
      });
    } catch (error) {
      console.error('Failed to log call quality:', error);
    }
  };

  // Monitor connection quality
  const monitorConnectionQuality = (pc: RTCPeerConnection, callSessionId: string) => {
    const checkQuality = async () => {
      try {
        const stats = await pc.getStats();
        let connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected' = 'excellent';
        let audioQuality = 1.0;
        let videoQuality = 1.0;
        let latency = 0;
        let packetLoss = 0;

        stats.forEach((report) => {
          if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            if (report.packetsLost && report.packetsReceived) {
              packetLoss = report.packetsLost / (report.packetsLost + report.packetsReceived);
              videoQuality = Math.max(0, 1 - packetLoss * 2);
            }
          }
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            latency = report.currentRoundTripTime * 1000 || 0;
          }
        });

        // Determine connection quality
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          connectionQuality = 'disconnected';
        } else if (packetLoss > 0.05 || latency > 300) {
          connectionQuality = 'poor';
        } else if (packetLoss > 0.02 || latency > 150) {
          connectionQuality = 'good';
        }

        setCallState(prev => ({ ...prev, connectionQuality }));

        // Log quality metrics
        await logCallQuality(callSessionId, {
          connectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState,
          audioQuality,
          videoQuality,
          latency,
          packetLoss
        });

      } catch (error) {
        console.error('Failed to check connection quality:', error);
      }
    };

    qualityMonitorRef.current = setInterval(checkQuality, 5000);
    checkQuality(); // Initial check
  };

  // End call with enhanced cleanup and logging (moved up to avoid dependency issues)
  const endCall = useCallback(async (endReason: string = 'completed') => {
    // Log call history if we have a session
    if (callState.callSessionId) {
      await logCallHistory(callState.callSessionId, endReason);
    }

    // Send end call signal
    if (realtimeChannelRef.current && callState.callId) {
      realtimeChannelRef.current.send({
        type: 'broadcast',
        event: 'call-end',
        payload: {
          callId: callState.callId,
        },
      });
    }

    // Clear all timers
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (qualityMonitorRef.current) {
      clearInterval(qualityMonitorRef.current);
      qualityMonitorRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Clean up peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Unsubscribe from realtime
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    // Reset state
    setCallState({
      isActive: false,
      isIncoming: false,
      isConnected: false,
      isMicOn: true,
      isVideoOn: true,
      isScreenSharing: false,
      callDuration: 0,
      connectionQuality: 'excellent',
      isReconnecting: false,
    });
  }, [callState.callId, callState.callSessionId]);

  // Enhanced reconnection logic for mobile reliability
  const attemptReconnection = useCallback(() => {
    if (reconnectTimeoutRef.current) return;

    console.log('Attempting reconnection...');
    setCallState(prev => ({ ...prev, isReconnecting: true }));
    
    const reconnectionDelay = isMobile ? 2000 : 3000; // Faster reconnection on mobile
    
    reconnectTimeoutRef.current = setTimeout(async () => {
      try {
        if (!peerConnectionRef.current) {
          console.log('No peer connection to reconnect');
          return;
        }

        const pc = peerConnectionRef.current;
        
        // Check if connection is still salvageable
        if (pc.connectionState === 'failed' || pc.iceConnectionState === 'failed') {
          console.log('Connection failed, restarting ICE...');
          await pc.restartIce();
        } else if (pc.connectionState === 'disconnected') {
          console.log('Connection disconnected, gathering new candidates...');
          // For mobile networks, try gathering more ICE candidates
          const configuration = pc.getConfiguration();
          configuration.iceCandidatePoolSize = 15; // Increase pool for mobile
          pc.setConfiguration(configuration);
        }
        
        // Re-detect network quality for adaptive adjustments
        const newNetworkQuality = await detectNetworkQuality();
        setNetworkQuality(newNetworkQuality);
        
        reconnectTimeoutRef.current = null;
        
        // Set a timeout to stop reconnection attempts
        setTimeout(() => {
          if (callState.isReconnecting && pc.connectionState !== 'connected') {
            console.log('Reconnection timeout, ending call');
            endCall('reconnection_timeout');
          }
        }, isMobile ? 10000 : 15000); // Longer timeout for mobile
        
      } catch (error) {
        console.error('Reconnection failed:', error);
        reconnectTimeoutRef.current = null;
        setCallState(prev => ({ ...prev, isReconnecting: false }));
        
        // On mobile, try one more time with basic settings
        if (isMobile && error.name !== 'InvalidStateError') {
          setTimeout(() => {
            endCall('reconnection_failed');
          }, 2000);
        } else {
          endCall('reconnection_failed');
        }
      }
    }, reconnectionDelay);
  }, [isMobile, callState.isReconnecting, endCall]);

  // Initialize peer connection with enhanced monitoring and mobile optimizations
  const initializePeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection(rtcConfig);
    
    // Apply adaptive bitrate based on network quality
    const applyBitrateConstraints = async () => {
      const quality = networkQuality === 'slow' ? 'low' : isMobile ? 'medium' : 'high';
      const constraints = getBitrateConstraints(quality);
      
      const senders = peerConnection.getSenders();
      for (const sender of senders) {
        if (sender.track) {
          const params = sender.getParameters();
          if (params.encodings && params.encodings.length > 0) {
            if (sender.track.kind === 'video') {
              params.encodings[0].maxBitrate = constraints.video.maxBitrate;
            } else if (sender.track.kind === 'audio') {
              params.encodings[0].maxBitrate = constraints.audio.maxBitrate;
            }
            await sender.setParameters(params);
          }
        }
      }
    };
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && realtimeChannelRef.current) {
        realtimeChannelRef.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            candidate: event.candidate,
            callId: callState.callId,
          },
        });
      }
    };

    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setCallState(prev => ({ ...prev, isConnected: true, isReconnecting: false }));
    };

    peerConnection.onconnectionstatechange = async () => {
      console.log('Connection state changed:', peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'connected') {
        setCallState(prev => ({ ...prev, isConnected: true, isReconnecting: false }));
        // Apply adaptive bitrate once connected
        await applyBitrateConstraints();
      } else if (peerConnection.connectionState === 'disconnected') {
        setCallState(prev => ({ ...prev, isConnected: false, isReconnecting: true }));
        attemptReconnection();
      } else if (peerConnection.connectionState === 'failed') {
        setCallState(prev => ({ ...prev, isConnected: false, connectionQuality: 'disconnected' }));
        // On mobile, try one more reconnection before giving up
        if (isMobile) {
          setTimeout(() => attemptReconnection(), 1000);
        } else {
          endCall('connection_failed');
        }
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state changed:', peerConnection.iceConnectionState);
      
      if (peerConnection.iceConnectionState === 'disconnected') {
        setCallState(prev => ({ ...prev, isReconnecting: true }));
        attemptReconnection();
      } else if (peerConnection.iceConnectionState === 'failed') {
        console.log('ICE connection failed, attempting restart...');
        peerConnection.restartIce();
      } else if (peerConnection.iceConnectionState === 'connected' || peerConnection.iceConnectionState === 'completed') {
        setCallState(prev => ({ ...prev, isReconnecting: false }));
      }
    };

    // Handle negotiation needed (for mobile Safari)
    peerConnection.onnegotiationneeded = async () => {
      if (peerConnection.signalingState !== 'stable') return;
      
      try {
        console.log('Negotiation needed, creating new offer...');
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // Send renegotiation offer
        if (realtimeChannelRef.current && callState.callId) {
          await realtimeChannelRef.current.send({
            type: 'broadcast',
            event: 'renegotiation-offer',
            payload: {
              callId: callState.callId,
              offer,
            },
          });
        }
      } catch (error) {
        console.error('Error during renegotiation:', error);
      }
    };

    return peerConnection;
  }, [callState.callId]);

  // Get user media with mobile-optimized constraints and fallbacks
  const getUserMedia = useCallback(async (video: boolean = true, audio: boolean = true) => {
    try {
      // Use mobile-optimized constraints
      const constraints = getMobileOptimizedConstraints(video);
      
      let stream: MediaStream;
      
      try {
        // Try with ideal constraints first
        stream = await navigator.mediaDevices.getUserMedia({
          video: constraints.video,
          audio: constraints.audio
        });
      } catch (idealError) {
        console.warn('Failed with ideal constraints, trying fallback:', idealError);
        
        // Fallback to basic constraints for older devices
        const fallbackConstraints = {
          video: video ? {
            width: { max: 640 },
            height: { max: 480 },
            frameRate: { max: 15 }
          } : false,
          audio: audio ? {
            echoCancellation: true,
            noiseSuppression: true
          } : false
        };
        
        stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        
        // Mobile-specific video optimizations
        if (isMobile) {
          localVideoRef.current.playsInline = true;
          localVideoRef.current.autoplay = true;
        }
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Unable to access camera or microphone';
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = 'Camera/microphone access denied. Please allow permissions and try again.';
            break;
          case 'NotFoundError':
            errorMessage = 'No camera or microphone found on this device.';
            break;
          case 'NotReadableError':
            errorMessage = 'Camera or microphone is being used by another application.';
            break;
          case 'OverconstrainedError':
            errorMessage = 'Camera settings not supported. Trying with basic settings...';
            break;
        }
      }
      
      toast({
        title: 'Media Access Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast, isMobile]);

  // Start outgoing call with database logging
  const startCall = useCallback(async (partnerId: string, isVideo: boolean = true) => {
    try {
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create call session in database
      const callSession = await createCallSession(userId, partnerId, isVideo ? 'video' : 'audio');
      if (!callSession) return;

      setCallState(prev => ({
        ...prev,
        isActive: true,
        partnerId,
        callId,
        isVideoOn: isVideo,
        callSessionId: callSession.id,
      }));

      // Get user media
      const stream = await getUserMedia(isVideo, true);
      localStreamRef.current = stream;

      // Initialize peer connection
      peerConnectionRef.current = initializePeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, stream);
        }
      });

      // Create offer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      // Send call offer via Supabase realtime
      if (pairId) {
        const channel = supabase.channel(`call_${pairId}`);
        realtimeChannelRef.current = channel;
        
        await channel
          .on('broadcast', { event: 'call-answer' }, ({ payload }) => {
            if (payload.callId === callId && peerConnectionRef.current) {
              peerConnectionRef.current.setRemoteDescription(payload.answer);
            }
          })
          .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
            if (payload.callId === callId && peerConnectionRef.current) {
              peerConnectionRef.current.addIceCandidate(payload.candidate);
            }
          })
          .on('broadcast', { event: 'call-end' }, ({ payload }) => {
            if (payload.callId === callId) {
              endCall();
            }
          })
          .subscribe();

        // Send call offer
        await channel.send({
          type: 'broadcast',
          event: 'call-offer',
          payload: {
            callId,
            offer,
            isVideo,
            callerId: userId,
            callSessionId: callSession.id,
          },
        });
      }

      // Update call session status
      await updateCallSession(callSession.id, { status: 'ringing' });

      // Start call duration timer and quality monitoring
      let duration = 0;
      callTimerRef.current = setInterval(() => {
        duration += 1;
        setCallState(prev => ({ ...prev, callDuration: duration }));
      }, 1000);

      monitorConnectionQuality(peerConnectionRef.current, callSession.id);

    } catch (error) {
      console.error('Error starting call:', error);
      endCall();
    }
  }, [userId, pairId, getUserMedia, initializePeerConnection]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    try {
      setCallState(prev => ({ ...prev, isIncoming: false }));
      
      // Update call session status
      if (callState.callSessionId) {
        await updateCallSession(callState.callSessionId, { status: 'connected' });
      }
      
      // Get user media
      const stream = await getUserMedia(callState.isVideoOn, true);
      localStreamRef.current = stream;

      if (peerConnectionRef.current) {
        // Add local stream to peer connection
        stream.getTracks().forEach(track => {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(track, stream);
          }
        });

        // Create answer
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        // Send answer
        if (realtimeChannelRef.current) {
          await realtimeChannelRef.current.send({
            type: 'broadcast',
            event: 'call-answer',
            payload: {
              callId: callState.callId,
              answer,
            },
          });
        }

        // Start quality monitoring
        if (callState.callSessionId) {
          monitorConnectionQuality(peerConnectionRef.current, callState.callSessionId);
        }
      }

      // Start call duration timer
      let duration = 0;
      callTimerRef.current = setInterval(() => {
        duration += 1;
        setCallState(prev => ({ ...prev, callDuration: duration }));
      }, 1000);

    } catch (error) {
      console.error('Error accepting call:', error);
      endCall();
    }
  }, [callState.isVideoOn, callState.callId, callState.callSessionId, getUserMedia]);

  // Log call to history
  const logCallHistory = async (sessionId: string, endReason: string) => {
    try {
      const { data: session } = await supabase
        .from('call_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (session) {
        const duration = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
        
        await supabase.from('call_history').insert({
          pair_id: session.pair_id,
          caller_id: session.caller_id,
          receiver_id: session.receiver_id,
          call_type: session.call_type,
          duration_seconds: duration,
          end_reason: endReason,
          started_at: session.started_at,
          ended_at: new Date().toISOString()
        });

        await updateCallSession(sessionId, { 
          status: 'ended', 
          ended_at: new Date().toISOString() 
        });
      }
    } catch (error) {
      console.error('Failed to log call history:', error);
    }
  };

  // Moved endCall function up to avoid dependency issues

  // Decline call
  const declineCall = useCallback(() => {
    endCall('declined');
  }, [endCall]);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState(prev => ({ ...prev, isMicOn: audioTrack.enabled }));
      }
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState(prev => ({ ...prev, isVideoOn: videoTrack.enabled }));
      }
    }
  }, []);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    try {
      if (!callState.isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        if (peerConnectionRef.current && localStreamRef.current) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peerConnectionRef.current.getSenders().find(s =>
            s.track && s.track.kind === 'video'
          );

          if (sender) {
            await sender.replaceTrack(videoTrack);
          }

          // Handle screen share end
          videoTrack.onended = () => {
            toggleScreenShare();
          };
        }

        setCallState(prev => ({ ...prev, isScreenSharing: true }));
      } else {
        // Stop screen sharing, back to camera
        const stream = await getUserMedia(true, true);
        if (peerConnectionRef.current) {
          const videoTrack = stream.getVideoTracks()[0];
          const sender = peerConnectionRef.current.getSenders().find(s =>
            s.track && s.track.kind === 'video'
          );

          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }

        setCallState(prev => ({ ...prev, isScreenSharing: false }));
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast({
        title: 'Screen Share Error',
        description: 'Unable to share screen',
        variant: 'destructive',
      });
    }
  }, [callState.isScreenSharing, getUserMedia, toast]);

  // Listen for incoming calls
  useEffect(() => {
    if (!pairId || !userId) return;

    const channel = supabase.channel(`call_${pairId}`);
    
    channel
      .on('broadcast', { event: 'call-offer' }, async ({ payload }) => {
        if (payload.callerId !== userId) {
          // Incoming call
          setCallState(prev => ({
            ...prev,
            isActive: true,
            isIncoming: true,
            partnerId: payload.callerId,
            callId: payload.callId,
            isVideoOn: payload.isVideo,
            callSessionId: payload.callSessionId,
          }));

          // Initialize peer connection for incoming call
          peerConnectionRef.current = initializePeerConnection();
          await peerConnectionRef.current.setRemoteDescription(payload.offer);
          realtimeChannelRef.current = channel;
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pairId, userId, initializePeerConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall('completed');
    };
  }, [endCall]);

  return {
    callState,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    endCall: () => endCall('completed'),
    declineCall,
    toggleMic,
    toggleVideo,
    toggleScreenShare,
  };
};