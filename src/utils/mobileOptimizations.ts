// Mobile-specific optimizations for video calling

export class MobileCallOptimizer {
  private wakeLock: WakeLockSentinel | null = null;
  private originalViewportMeta: string | null = null;
  
  constructor() {
    this.setupMobileOptimizations();
  }

  // Prevent screen from turning off during calls
  async acquireWakeLock(): Promise<void> {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        console.log('Screen wake lock acquired');
      }
    } catch (error) {
      console.warn('Could not acquire wake lock:', error);
    }
  }

  // Release wake lock when call ends
  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
      console.log('Screen wake lock released');
    }
  }

  // Optimize viewport for video calls on mobile
  optimizeViewportForCalls(): void {
    const viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (viewportMeta) {
      this.originalViewportMeta = viewportMeta.content;
      // Prevent zooming and improve performance during calls
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    }
  }

  // Restore original viewport settings
  restoreViewport(): void {
    const viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (viewportMeta && this.originalViewportMeta) {
      viewportMeta.content = this.originalViewportMeta;
    }
  }

  // Request fullscreen for better experience
  async requestFullscreen(element?: Element): Promise<void> {
    try {
      const targetElement = element || document.documentElement;
      
      if (targetElement.requestFullscreen) {
        await targetElement.requestFullscreen();
      } else if ((targetElement as any).webkitRequestFullscreen) {
        await (targetElement as any).webkitRequestFullscreen();
      } else if ((targetElement as any).mozRequestFullScreen) {
        await (targetElement as any).mozRequestFullScreen();
      }
    } catch (error) {
      console.warn('Could not enter fullscreen:', error);
    }
  }

  // Exit fullscreen
  async exitFullscreen(): Promise<void> {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      }
    } catch (error) {
      console.warn('Could not exit fullscreen:', error);
    }
  }

  // Handle orientation changes
  handleOrientationChange(callback: (orientation: string) => void): void {
    const handleChange = () => {
      const orientation = screen.orientation?.type || 'unknown';
      callback(orientation);
    };

    screen.orientation?.addEventListener('change', handleChange);
    window.addEventListener('orientationchange', handleChange);
  }

  // Optimize for iOS Safari
  private setupMobileOptimizations(): void {
    // iOS Safari optimizations
    if (this.isIOSSafari()) {
      // Prevent bounce scrolling during video calls
      document.body.style.overscrollBehavior = 'none';
      
      // Improve video rendering on iOS
      const style = document.createElement('style');
      style.textContent = `
        video {
          -webkit-transform: translate3d(0, 0, 0);
          transform: translate3d(0, 0, 0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
      `;
      document.head.appendChild(style);
    }

    // Android Chrome optimizations
    if (this.isAndroidChrome()) {
      // Optimize for hardware acceleration
      const style = document.createElement('style');
      style.textContent = `
        video {
          will-change: transform;
          transform: translateZ(0);
        }
      `;
      document.head.appendChild(style);
    }
  }

  private isIOSSafari(): boolean {
    const userAgent = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(userAgent) && /Safari/.test(userAgent) && !/CriOS|FxiOS/.test(userAgent);
  }

  private isAndroidChrome(): boolean {
    const userAgent = navigator.userAgent;
    return /Android/.test(userAgent) && /Chrome/.test(userAgent);
  }

  // Battery optimization - reduce frame rate when on low battery
  async optimizeForBattery(): Promise<{ shouldReduceQuality: boolean; batteryLevel: number }> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        const shouldReduceQuality = battery.level < 0.3 && !battery.charging;
        return {
          shouldReduceQuality,
          batteryLevel: battery.level
        };
      }
    } catch (error) {
      console.warn('Could not access battery API:', error);
    }
    
    return { shouldReduceQuality: false, batteryLevel: 1 };
  }

  // Network optimization based on connection type
  getNetworkOptimizations(): { maxBitrate: number; frameRate: number } {
    try {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        
        switch (effectiveType) {
          case 'slow-2g':
          case '2g':
            return { maxBitrate: 64000, frameRate: 10 }; // Very low quality
          case '3g':
            return { maxBitrate: 200000, frameRate: 15 }; // Low quality
          case '4g':
            return { maxBitrate: 500000, frameRate: 24 }; // Medium quality
          default:
            return { maxBitrate: 1000000, frameRate: 30 }; // High quality
        }
      }
    } catch (error) {
      console.warn('Could not access network information:', error);
    }
    
    // Default to medium quality
    return { maxBitrate: 500000, frameRate: 24 };
  }

  // Handle app going to background/foreground
  handleVisibilityChange(onBackground: () => void, onForeground: () => void): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        onBackground();
      } else {
        onForeground();
      }
    });

    // Also handle page focus/blur events
    window.addEventListener('blur', onBackground);
    window.addEventListener('focus', onForeground);
  }

  // Clean up all optimizations
  cleanup(): void {
    this.releaseWakeLock();
    this.restoreViewport();
    this.exitFullscreen();
  }
}

export default MobileCallOptimizer;