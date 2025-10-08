import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Clock, Heart, Calendar, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  id?: string;
  email_notifications: boolean;
  push_notifications: boolean;
  event_reminders: boolean;
  task_reminders: boolean;
  mood_alerts: boolean;
  daily_questions: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
}

export default function NotificationSettings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    event_reminders: true,
    task_reminders: true,
    mood_alerts: true,
    daily_questions: true,
    quiet_hours_start: "22:00",
    quiet_hours_end: "08:00",
    timezone: "UTC",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    loadPreferences();
    checkPushPermission();
  }, []);

  const checkPushPermission = () => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  };

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          id: data.id,
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          event_reminders: data.event_reminders,
          task_reminders: data.task_reminders,
          mood_alerts: data.mood_alerts,
          daily_questions: data.daily_questions,
          quiet_hours_start: data.quiet_hours_start || "22:00",
          quiet_hours_end: data.quiet_hours_end || "08:00",
          timezone: data.timezone || "UTC",
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          email_notifications: preferences.email_notifications,
          push_notifications: preferences.push_notifications,
          event_reminders: preferences.event_reminders,
          task_reminders: preferences.task_reminders,
          mood_alerts: preferences.mood_alerts,
          daily_questions: preferences.daily_questions,
          quiet_hours_start: preferences.quiet_hours_start,
          quiet_hours_end: preferences.quiet_hours_end,
          timezone: preferences.timezone,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    // If enabling push notifications, request permission
    if (key === 'push_notifications' && value === true) {
      await requestPushPermission();
    }
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Not supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (!('serviceWorker' in navigator)) {
      toast({
        title: "Not supported",
        description: "Service workers are not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === 'granted') {
        // Register service worker and subscribe to push
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        await registration.update();

        // Wait for service worker to be ready
        const sw = await navigator.serviceWorker.ready;

        // Subscribe to push notifications
        const subscription = await sw.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U' // VAPID public key
          ),
        });

        // Save subscription to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const subscriptionJSON = subscription.toJSON();
          await supabase.from('push_subscriptions').upsert({
            user_id: user.id,
            endpoint: subscriptionJSON.endpoint!,
            p256dh: subscriptionJSON.keys!.p256dh!,
            auth: subscriptionJSON.keys!.auth!,
            user_agent: navigator.userAgent,
          });
        }

        toast({
          title: "Success",
          description: "Push notifications enabled successfully!",
        });
      } else {
        setPreferences(prev => ({ ...prev, push_notifications: false }));
        toast({
          title: "Permission denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting push permission:', error);
      setPreferences(prev => ({ ...prev, push_notifications: false }));
      toast({
        title: "Error",
        description: "Failed to enable push notifications.",
        variant: "destructive",
      });
    }
  };

  // Helper function to convert VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/app')}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Notification Settings</h1>
        <p className="text-muted-foreground">
          Manage when and how you receive notifications from Lobebo.
        </p>
      </div>

      <div className="space-y-6">
        {/* Delivery Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Delivery Methods
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser push notifications
                  {pushPermission === 'denied' && ' (Blocked in browser settings)'}
                  {pushPermission === 'default' && ' (Permission required)'}
                </p>
              </div>
              <Switch
                checked={preferences.push_notifications}
                onCheckedChange={(checked) => updatePreference('push_notifications', checked)}
                disabled={pushPermission === 'denied'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Notification Types
            </CardTitle>
            <CardDescription>
              Select which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Event Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded about upcoming calendar events
                </p>
              </div>
              <Switch
                checked={preferences.event_reminders}
                onCheckedChange={(checked) => updatePreference('event_reminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Task Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded about pending tasks and goals
                </p>
              </div>
              <Switch
                checked={preferences.task_reminders}
                onCheckedChange={(checked) => updatePreference('task_reminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Mood Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about mood logging reminders
                </p>
              </div>
              <Switch
                checked={preferences.mood_alerts}
                onCheckedChange={(checked) => updatePreference('mood_alerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Daily Questions</Label>
                <p className="text-sm text-muted-foreground">
                  Receive daily relationship questions and prompts
                </p>
              </div>
              <Switch
                checked={preferences.daily_questions}
                onCheckedChange={(checked) => updatePreference('daily_questions', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Set times when you don't want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Quiet hours start</Label>
                <Select
                  value={preferences.quiet_hours_start}
                  onValueChange={(value) => updatePreference('quiet_hours_start', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiet-end">Quiet hours end</Label>
                <Select
                  value={preferences.quiet_hours_end}
                  onValueChange={(value) => updatePreference('quiet_hours_end', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => updatePreference('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                
                {/* Americas */}
                <SelectItem value="America/New_York">Eastern Time (US)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (US)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (US)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (US)</SelectItem>
                <SelectItem value="America/Anchorage">Alaska Time</SelectItem>
                <SelectItem value="Pacific/Honolulu">Hawaii Time</SelectItem>
                <SelectItem value="America/Toronto">Toronto</SelectItem>
                <SelectItem value="America/Vancouver">Vancouver</SelectItem>
                <SelectItem value="America/Mexico_City">Mexico City</SelectItem>
                <SelectItem value="America/Bogota">Bogotá</SelectItem>
                <SelectItem value="America/Lima">Lima</SelectItem>
                <SelectItem value="America/Santiago">Santiago</SelectItem>
                <SelectItem value="America/Sao_Paulo">São Paulo</SelectItem>
                <SelectItem value="America/Buenos_Aires">Buenos Aires</SelectItem>
                
                {/* Europe */}
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Dublin">Dublin</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                <SelectItem value="Europe/Madrid">Madrid</SelectItem>
                <SelectItem value="Europe/Rome">Rome</SelectItem>
                <SelectItem value="Europe/Amsterdam">Amsterdam</SelectItem>
                <SelectItem value="Europe/Brussels">Brussels</SelectItem>
                <SelectItem value="Europe/Vienna">Vienna</SelectItem>
                <SelectItem value="Europe/Stockholm">Stockholm</SelectItem>
                <SelectItem value="Europe/Warsaw">Warsaw</SelectItem>
                <SelectItem value="Europe/Athens">Athens</SelectItem>
                <SelectItem value="Europe/Istanbul">Istanbul</SelectItem>
                <SelectItem value="Europe/Moscow">Moscow</SelectItem>
                
                {/* Asia */}
                <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                <SelectItem value="Asia/Karachi">Karachi</SelectItem>
                <SelectItem value="Asia/Kolkata">Mumbai/Delhi</SelectItem>
                <SelectItem value="Asia/Dhaka">Dhaka</SelectItem>
                <SelectItem value="Asia/Bangkok">Bangkok</SelectItem>
                <SelectItem value="Asia/Singapore">Singapore</SelectItem>
                <SelectItem value="Asia/Hong_Kong">Hong Kong</SelectItem>
                <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                <SelectItem value="Asia/Seoul">Seoul</SelectItem>
                <SelectItem value="Asia/Manila">Manila</SelectItem>
                <SelectItem value="Asia/Jakarta">Jakarta</SelectItem>
                
                {/* Africa */}
                <SelectItem value="Africa/Cairo">Cairo</SelectItem>
                <SelectItem value="Africa/Johannesburg">Johannesburg</SelectItem>
                <SelectItem value="Africa/Lagos">Lagos</SelectItem>
                <SelectItem value="Africa/Nairobi">Nairobi</SelectItem>
                
                {/* Oceania */}
                <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                <SelectItem value="Australia/Melbourne">Melbourne</SelectItem>
                <SelectItem value="Australia/Perth">Perth</SelectItem>
                <SelectItem value="Pacific/Auckland">Auckland</SelectItem>
              </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}