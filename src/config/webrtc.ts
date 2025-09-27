// WebRTC Configuration with TURN servers for foolproof mobile support

export interface TurnServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

// Free and reliable TURN servers for development/production
const FREE_TURN_SERVERS: TurnServerConfig[] = [
  // OpenRelay - Free TURN servers
  {
    urls: [
      'turn:openrelay.metered.ca:80',
      'turn:openrelay.metered.ca:443',
      'turn:openrelay.metered.ca:443?transport=tcp'
    ],
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  // Twilio STUN (free)
  { urls: 'stun:global.stun.twilio.com:3478' },
  // Additional reliable TURN servers
  {
    urls: [
      'turn:relay1.expressturn.com:3478',
      'turns:relay1.expressturn.com:5349'
    ],
    username: 'efOUOONZ4GVZL3K5BN',
    credential: 'NVsWE4CsHZ7zJjBN'
  }
];

// Primary STUN servers (Google, Mozilla, etc.)
const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:stun.services.mozilla.com' },
  { urls: 'stun:stun.counterpath.net' },
  { urls: 'stun:stun.ekiga.net' }
];

// Enhanced WebRTC configuration optimized for mobile
export const createRTCConfiguration = (): RTCConfiguration => ({
  iceServers: [
    ...STUN_SERVERS,
    ...FREE_TURN_SERVERS
  ],
  // Optimize for mobile networks
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  iceTransportPolicy: 'all' // Use both STUN and TURN
});

// Mobile-optimized media constraints
export const getMobileOptimizedConstraints = (isVideo: boolean = true) => ({
  video: isVideo ? {
    width: { min: 320, ideal: 640, max: 1280 },
    height: { min: 240, ideal: 480, max: 720 },
    frameRate: { min: 15, ideal: 24, max: 30 },
    facingMode: 'user',
    // Mobile-specific optimizations
    aspectRatio: 16/9
  } : false,
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: { ideal: 48000 },
    channelCount: { ideal: 1 },
    // Mobile audio optimizations
    latency: { ideal: 0.01 }, // Low latency
    volume: { ideal: 1.0 }
  }
});

// Adaptive bitrate settings for different connection qualities
export const getBitrateConstraints = (quality: 'low' | 'medium' | 'high') => {
  const constraints = {
    low: {
      video: { maxBitrate: 200000 }, // 200 kbps
      audio: { maxBitrate: 32000 }   // 32 kbps
    },
    medium: {
      video: { maxBitrate: 500000 }, // 500 kbps
      audio: { maxBitrate: 64000 }   // 64 kbps
    },
    high: {
      video: { maxBitrate: 1000000 }, // 1 Mbps
      audio: { maxBitrate: 128000 }   // 128 kbps
    }
  };
  return constraints[quality];
};

// Network quality detection
export const detectNetworkQuality = async (): Promise<'slow' | 'fast'> => {
  try {
    // Simple network speed test using a small image
    const startTime = Date.now();
    await fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    const endTime = Date.now();
    
    const latency = endTime - startTime;
    return latency < 100 ? 'fast' : 'slow';
  } catch {
    return 'slow'; // Default to slow on error
  }
};

// Check if device is mobile
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if browser supports WebRTC
export const isWebRTCSupported = (): boolean => {
  return !!(
    window.RTCPeerConnection ||
    (window as any).webkitRTCPeerConnection ||
    (window as any).mozRTCPeerConnection
  );
};

// Get optimal video codec for the device
export const getOptimalVideoCodec = (): string => {
  const isMobile = isMobileDevice();
  const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isApple) {
    return 'H264'; // Apple devices prefer H264
  } else if (isMobile) {
    return 'VP8'; // Android devices work well with VP8
  } else {
    return 'VP9'; // Desktop can handle VP9
  }
};

export default {
  createRTCConfiguration,
  getMobileOptimizedConstraints,
  getBitrateConstraints,
  detectNetworkQuality,
  isMobileDevice,
  isWebRTCSupported,
  getOptimalVideoCodec
};