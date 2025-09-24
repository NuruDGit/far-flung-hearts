import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeChannelRef = useRef<any>(null);

  // WebRTC configuration
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection(rtcConfig);
    
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
      setCallState(prev => ({ ...prev, isConnected: true }));
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'connected') {
        setCallState(prev => ({ ...prev, isConnected: true }));
      } else if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
        endCall();
      }
    };

    return peerConnection;
  }, [callState.callId]);

  // Get user media
  const getUserMedia = useCallback(async (video: boolean = true, audio: boolean = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 1280, height: 720 } : false,
        audio: audio,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: 'Camera/Microphone Error',
        description: 'Unable to access camera or microphone',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Start outgoing call
  const startCall = useCallback(async (partnerId: string, isVideo: boolean = true) => {
    try {
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setCallState(prev => ({
        ...prev,
        isActive: true,
        partnerId,
        callId,
        isVideoOn: isVideo,
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
          },
        });
      }

      // Start call duration timer
      let duration = 0;
      callTimerRef.current = setInterval(() => {
        duration += 1;
        setCallState(prev => ({ ...prev, callDuration: duration }));
      }, 1000);

    } catch (error) {
      console.error('Error starting call:', error);
      endCall();
    }
  }, [userId, pairId, getUserMedia, initializePeerConnection]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    try {
      setCallState(prev => ({ ...prev, isIncoming: false }));
      
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
  }, [callState.isVideoOn, callState.callId, getUserMedia]);

  // End call
  const endCall = useCallback(() => {
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

    // Clear timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
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
    });
  }, [callState.callId]);

  // Decline call
  const declineCall = useCallback(() => {
    endCall();
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
      endCall();
    };
  }, [endCall]);

  return {
    callState,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    endCall,
    declineCall,
    toggleMic,
    toggleVideo,
    toggleScreenShare,
  };
};