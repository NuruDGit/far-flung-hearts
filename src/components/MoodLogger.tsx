import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Calendar, BarChart3 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface MoodLoggerProps {
  compact?: boolean;
  pairId?: string;
}

const MoodLogger = ({ compact = false, pairId }: MoodLoggerProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [notes, setNotes] = useState('');
  const [todaysMood, setTodaysMood] = useState<any>(null);
  const [partnerMood, setPartnerMood] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState('');

  const moods = [
    { emoji: '😄', label: 'Excited' },
    { emoji: '😊', label: 'Happy' },
    { emoji: '🥰', label: 'Loving' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😔', label: 'Sad' },
    { emoji: '😢', label: 'Crying' },
    { emoji: '😡', label: 'Angry' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '😰', label: 'Anxious' },
  ];

  useEffect(() => {
    if (user) {
      fetchTodaysMood();
      if (pairId) fetchPartnerMood();
    }
  }, [user, pairId]);

  const fetchTodaysMood = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today)
        .single();
      
      if (data) {
        setTodaysMood(data);
        setSelectedEmoji(data.emoji);
        setNotes(data.notes || '');
      }
    } catch (error) {
      // No mood logged today - that's fine
    }
  };

  const fetchPartnerMood = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('pair_id', pairId)
        .eq('date', today)
        .neq('user_id', user?.id)
        .single();
      
      setPartnerMood(data);
    } catch (error) {
      // Partner hasn't logged mood today
    }
  };

  const saveMood = async () => {
    if (!selectedEmoji || !user) return;
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (todaysMood) {
        // Update existing mood
        const { error } = await supabase
          .from('mood_logs')
          .update({ 
            emoji: selectedEmoji, 
            notes,
            pair_id: pairId || null
          })
          .eq('id', todaysMood.id);
        
        if (error) throw error;
        toast.success('Mood updated!');
      } else {
        // Create new mood log
        const { error } = await supabase
          .from('mood_logs')
          .insert({
            user_id: user.id,
            pair_id: pairId || null,
            emoji: selectedEmoji,
            notes,
            date: today
          });
        
        if (error) throw error;
        toast.success('Mood logged!');
      }
      
      fetchTodaysMood();
      if (pairId) fetchPartnerMood();
    } catch (error) {
      toast.error('Failed to save mood');
      console.error('Error saving mood:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMotivationalQuote = async (emoji: string, label: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('motivational-quote', {
        body: { mood: emoji, moodLabel: label }
      });
      
      if (error) {
        console.error('Error fetching quote:', error);
        setMotivationalQuote('Every moment is a fresh beginning.');
      } else {
        setMotivationalQuote(data.quote || 'Every moment is a fresh beginning.');
      }
    } catch (error) {
      console.error('Error fetching motivational quote:', error);
      setMotivationalQuote('Every moment is a fresh beginning.');
    }
  };

  if (compact) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-love-heart/20 flex items-center justify-center">
              <Heart className="text-love-heart" size={16} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Today's Mood</h3>
              <div className="flex gap-1 mt-1">
                {todaysMood ? (
                  <span className="text-2xl">{todaysMood.emoji}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">Tap to log your mood</span>
                )}
                {partnerMood && pairId && (
                  <>
                    <span className="text-muted-foreground mx-1">+</span>
                    <span className="text-2xl">{partnerMood.emoji}</span>
                  </>
                )}
              </div>
            </div>
            <Button size="sm" variant="love" onClick={() => navigate('/app/mood')}>
              {todaysMood ? 'Edit' : 'Log'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/app/mood/analytics')}>
              <BarChart3 size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="text-love-heart" size={20} />
            How are you feeling today?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {moods.map((mood) => (
              <Button
                key={mood.emoji}
                variant={selectedEmoji === mood.emoji ? "default" : "outline"}
                className={`h-20 flex-col gap-2 ${
                  selectedEmoji === mood.emoji 
                    ? 'bg-love-heart text-white hover:bg-love-heart/90' 
                    : 'hover:bg-love-coral/20 hover:text-foreground border-border'
                }`}
                onClick={() => {
                  setSelectedEmoji(mood.emoji);
                  fetchMotivationalQuote(mood.emoji, mood.label);
                }}
              >
                <span className="text-3xl">{mood.emoji}</span>
                <span className="text-sm font-medium">{mood.label}</span>
              </Button>
            ))}
          </div>
          
          {/* Motivational Quote */}
          {selectedEmoji && motivationalQuote && (
            <div className="p-4 bg-gradient-to-r from-love-coral/10 to-love-heart/10 rounded-lg border border-love-coral/20">
              <p className="text-center text-love-deep font-medium italic">
                "{motivationalQuote}"
              </p>
            </div>
          )}
          
          {selectedEmoji && !todaysMood && (
            <div className="space-y-3">
              <Textarea
                placeholder="Any notes about your mood today? (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
              
              <Button 
                onClick={saveMood} 
                disabled={loading}
                className="w-full"
                variant="love"
              >
                {loading ? 'Saving...' : 'Save Mood'}
              </Button>
            </div>
          )}

          {todaysMood && (
            <div className="text-center">
              <Button 
                onClick={() => setTodaysMood(null)} 
                variant="outline"
                className="w-full"
              >
                Edit Today's Mood
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partner's Mood */}
      {pairId && partnerMood && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="text-love-coral" size={20} />
              Your Partner's Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{partnerMood.emoji}</span>
              <div>
                <p className="font-medium">They're feeling {moods.find(m => m.emoji === partnerMood.emoji)?.label}</p>
                {partnerMood.notes && (
                  <p className="text-sm text-muted-foreground mt-1">"{partnerMood.notes}"</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Summary */}
      {todaysMood && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="text-love-deep" size={20} />
              Today's Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{todaysMood.emoji}</span>
              <div className="flex-1">
                <p className="font-medium">
                  You're feeling {moods.find(m => m.emoji === todaysMood.emoji)?.label}
                </p>
                {todaysMood.notes && (
                  <p className="text-sm text-muted-foreground mt-2 p-3 bg-muted rounded-lg">
                    "{todaysMood.notes}"
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Logged at {new Date(todaysMood.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MoodLogger;