import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      await subscribeToPush();
      return true;
    }
    return false;
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        setSubscription(existingSubscription);
        return;
      }

      // You would need to configure VAPID keys for production
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
        ),
      });

      setSubscription(newSubscription);

      // Store subscription in database (commented out as table structure may vary)
      // const { data: { user } } = await supabase.auth.getUser();
      // if (user) {
      //   const sub = newSubscription.toJSON();
      //   await supabase.from('push_subscriptions').insert({
      //     endpoint: newSubscription.endpoint,
      //     p256dh: (sub.keys as any)?.p256dh || '',
      //     auth: (sub.keys as any)?.auth || '',
      //   });
      // }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  };

  const unsubscribe = async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);

      // Delete from database (commented out as table structure may vary)
      // const { data: { user } } = await supabase.auth.getUser();
      // if (user) {
      //   await supabase
      //     .from('push_subscriptions')
      //     .delete()
      //     .eq('endpoint', subscription.endpoint);
      // }
    }
  };

  return {
    permission,
    subscription,
    requestPermission,
    unsubscribe,
  };
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
