import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Smile, Zap, Coffee, Star, Send, Users, HandHeart } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PartnerMood {
  emoji: string;
  date: string;
  notes?: string;
  user_id: string;
}

interface PartnerSupportProps {
  partnerMood: PartnerMood | null;
  pairId: string;
  partnerId: string;
  partnerName?: string;
}

const PartnerSupport: React.FC<PartnerSupportProps> = ({ 
  partnerMood, 
  pairId, 
  partnerId, 
  partnerName = 'your partner' 
}) => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);

  const moodLabels = {
    '😄': 'Excited', '😊': 'Happy', '🥰': 'Loving', '😐': 'Neutral',
    '😔': 'Sad', '😢': 'Crying', '😡': 'Angry', '😴': 'Tired', '😰': 'Anxious',
  };

  const supportActions = {
    '😔': [
      { icon: Heart, label: 'Send Love', message: '💕 Sending you all my love and a big virtual hug!', color: 'love' },
      { icon: Coffee, label: 'Offer Comfort', message: '☕ How about we have some tea together and talk?', color: 'secondary' },
      { icon: Star, label: 'Encourage', message: '🌟 You are stronger than you know. I believe in you!', color: 'outline' },
    ],
    '😢': [
      { icon: Heart, label: 'Comfort', message: '🤗 I\'m here for you. You don\'t have to go through this alone.', color: 'love' },
      { icon: Smile, label: 'Distract', message: '😊 Want to watch our favorite movie together?', color: 'secondary' },
      { icon: Star, label: 'Support', message: '💙 Take all the time you need. I\'ll be right here with you.', color: 'outline' },
    ],
    '😡': [
      { icon: Coffee, label: 'Calm', message: '🌊 Let\'s take some deep breaths together. I\'m here to listen.', color: 'secondary' },
      { icon: Heart, label: 'Understand', message: '💝 Tell me what\'s bothering you. I want to understand.', color: 'love' },
      { icon: Smile, label: 'Lighten', message: '😌 How about we go for a walk and clear our heads?', color: 'outline' },
    ],
    '😰': [
      { icon: Heart, label: 'Reassure', message: '🤍 Everything will be okay. We\'ll figure this out together.', color: 'love' },
      { icon: Star, label: 'Ground', message: '🌱 Let\'s do some breathing exercises together.', color: 'secondary' },
      { icon: Coffee, label: 'Distract', message: '🎵 Want to listen to some calming music with me?', color: 'outline' },
    ],
    '😴': [
      { icon: Coffee, label: 'Energize', message: '☕ How about some coffee and a fun activity?', color: 'secondary' },
      { icon: Smile, label: 'Motivate', message: '⚡ You\'ve got this! Let\'s do something that makes you happy.', color: 'love' },
      { icon: Heart, label: 'Care', message: '💤 Take a nap if you need to. I\'ll be here when you wake up.', color: 'outline' },
    ],
    'default': [
      { icon: Heart, label: 'Send Love', message: '💕 Just wanted to let you know I love you!', color: 'love' },
      { icon: Smile, label: 'Appreciate', message: '😊 Thank you for being amazing. You make my day better!', color: 'secondary' },
      { icon: Star, label: 'Celebrate', message: '🎉 You\'re wonderful and I\'m grateful to have you!', color: 'outline' },
    ]
  };

  const sendSupportMessage = async (message: string, actionType: string) => {
    if (!user || sending) {
      
      return;
    }

    

    setSending(true);
    try {
      // Send as a message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          pair_id: pairId,
          sender_id: user.id,
          body: { text: message, type: 'support' },
          type: 'text'
        });

      // Create notification
      const { error: notificationError } = await supabase
        .from('mood_notifications')
        .insert({
          pair_id: pairId,
          sender_id: user.id,
          receiver_id: partnerId,
          mood_log_id: null, // We don't have the actual mood log ID
          notification_type: 'cheer_up',
          message: message,
          action_type: actionType
        });

      if (messageError) {
        console.error('Error sending support message:', messageError);
        toast.error(`Failed to send support message: ${messageError.message}`);
      } else if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't show error for notification - message was still sent
        toast.success('Support message sent! 💕');
      } else {
        toast.success('Support message sent! 💕');
      }
    } catch (error) {
      console.error('Error sending support:', error);
      toast.error('Failed to send support message');
    } finally {
      setSending(false);
    }
  };

  if (!partnerMood) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="text-love-coral" size={20} />
            Partner Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {partnerName} hasn't logged their mood today yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const mood = partnerMood.emoji;
  const moodLabel = moodLabels[mood as keyof typeof moodLabels] || 'Unknown';
  const actions = supportActions[mood as keyof typeof supportActions] || supportActions.default;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HandHeart className="text-love-coral" size={20} />
          Support {partnerName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Partner's Current Mood */}
        <div className="bg-gradient-to-r from-love-coral/10 to-love-heart/10 rounded-lg p-4 border border-love-coral/20">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{mood}</span>
            <div>
              <div className="font-medium">{partnerName} is feeling {moodLabel}</div>
              <div className="text-sm text-muted-foreground">
                Today • {new Date(partnerMood.date).toLocaleDateString()}
              </div>
            </div>
          </div>
          {partnerMood.notes && (
            <p className="text-sm italic text-muted-foreground mt-2">
              "{partnerMood.notes}"
            </p>
          )}
        </div>

        {/* Support Actions */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Zap className="text-love-heart" size={16} />
            Show you care
          </h4>
          <div className="grid gap-2">
            {actions.map((action, index) => {
              // Ensure valid button variant
              const variant = action.color === 'love' ? 'default' : 
                            action.color === 'secondary' ? 'secondary' : 'outline';
              
              return (
                <Button
                  key={index}
                  variant={variant}
                  className="justify-start text-left h-auto p-3"
                  onClick={() => sendSupportMessage(action.message, action.label.toLowerCase())}
                  disabled={sending}
                >
                <action.icon size={16} className="mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs opacity-80 mt-1">{action.message}</div>
                </div>
                <Send size={14} className="ml-2 opacity-60" />
                </Button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendSupportMessage('🤗 Sending you the biggest hug!', 'hug')}
              disabled={sending}
            >
              🤗 Hug
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendSupportMessage('📞 Want to have a quick call?', 'call')}
              disabled={sending}
            >
              📞 Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendSupportMessage('💐 You deserve something beautiful today!', 'surprise')}
              disabled={sending}
            >
              💐 Surprise
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerSupport;