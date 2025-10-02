/**
 * Call notification utilities for push notifications and browser notifications
 */

export interface CallNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: any;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Show a browser notification for incoming call
 */
export async function showCallNotification(
  options: CallNotificationOptions
): Promise<Notification | null> {
  const hasPermission = await requestNotificationPermission();
  
  if (!hasPermission) {
    return null;
  }

  const notification = new Notification(options.title, {
    body: options.body,
    icon: options.icon || '/logo.png',
    badge: '/logo.png',
    tag: options.tag || 'incoming-call',
    requireInteraction: options.requireInteraction !== false,
    data: options.data,
    silent: false,
  });

  return notification;
}

/**
 * Play notification sound for incoming call
 */
export function playCallSound(): void {
  try {
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 0.5;
    audio.loop = true;
    audio.play().catch(error => {
      console.warn('Failed to play notification sound:', error);
    });
    
    // Stop after 30 seconds
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 30000);
  } catch (error) {
    console.warn('Failed to create audio element:', error);
  }
}

/**
 * Vibrate device for incoming call (mobile only)
 */
export function vibrateForCall(): void {
  if ('vibrate' in navigator) {
    // Pattern: vibrate 200ms, pause 100ms, repeat
    navigator.vibrate([200, 100, 200, 100, 200, 100, 200]);
  }
}

/**
 * Show full incoming call notification with sound and vibration
 */
export async function notifyIncomingCall(
  callerName: string,
  isVideo: boolean,
  callerAvatar?: string
): Promise<Notification | null> {
  // Request permission if needed
  await requestNotificationPermission();

  // Play sound
  playCallSound();

  // Vibrate
  vibrateForCall();

  // Show notification
  return showCallNotification({
    title: `Incoming ${isVideo ? 'Video' : 'Voice'} Call`,
    body: `${callerName} is calling...`,
    icon: callerAvatar,
    requireInteraction: true,
    data: {
      type: 'incoming-call',
      callerName,
      isVideo,
    },
  });
}

/**
 * Clear call notifications
 */
export function clearCallNotifications(): void {
  // Stop any playing sounds
  const sounds = document.querySelectorAll('audio');
  sounds.forEach(sound => {
    sound.pause();
    sound.currentTime = 0;
  });

  // Stop vibration
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
}
