import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Heart, Calendar, Star, Target, Crown, Users2, BarChart3, Activity } from 'lucide-react';

interface MoodData {
  emoji: string;
  date: string;
  notes?: string;
}

interface MoodInsightsProps {
  data: MoodData[];
  partnerData?: MoodData[];
  period: 'week' | 'month' | 'year';
}

const MoodInsights: React.FC<MoodInsightsProps> = ({ data, partnerData, period }) => {
  const moodToScore = {
    '😄': 5, '😊': 4, '🥰': 4, '😐': 3, '😔': 2, '😢': 1, '😡': 2, '😴': 3, '😰': 1,
  };

  const moodLabels = {
    '😄': 'Excited', '😊': 'Happy', '🥰': 'Loving', '😐': 'Neutral',
    '😔': 'Sad', '😢': 'Crying', '😡': 'Angry', '😴': 'Tired', '😰': 'Anxious',
  };

  const calculateAverageScore = (moodData: MoodData[]) => {
    if (moodData.length === 0) return 0;
    const sum = moodData.reduce((acc, d) => acc + (moodToScore[d.emoji as keyof typeof moodToScore] || 3), 0);
    return sum / moodData.length;
  };

  const getDominantMood = (moodData: MoodData[]) => {
    const moodCounts = moodData.reduce((acc, d) => {
      acc[d.emoji] = (acc[d.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    )[0];
  };

  const calculateStreak = (moodData: MoodData[]) => {
    const sortedData = moodData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    
    for (const mood of sortedData) {
      const score = moodToScore[mood.emoji as keyof typeof moodToScore] || 3;
      if (score >= 4) streak++;
      else break;
    }
    
    return streak;
  };

  const getTrend = (moodData: MoodData[]) => {
    if (moodData.length < 2) return 'stable';
    
    const sortedData = moodData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));
    
    const firstAvg = calculateAverageScore(firstHalf);
    const secondAvg = calculateAverageScore(secondHalf);
    
    if (secondAvg > firstAvg + 0.5) return 'improving';
    if (secondAvg < firstAvg - 0.5) return 'declining';
    return 'stable';
  };

  const averageScore = calculateAverageScore(data);
  const dominantMood = data.length > 0 ? getDominantMood(data) : '😐';
  const happyStreak = calculateStreak(data);
  const trend = getTrend(data);
  const partnerAverage = partnerData ? calculateAverageScore(partnerData) : null;

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 dark:text-green-400';
    if (score >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTrendIcon = () => {
    if (trend === 'improving') return <TrendingUp className="text-green-500" size={16} />;
    if (trend === 'declining') return <TrendingDown className="text-red-500" size={16} />;
    return <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Average Mood Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star className="text-love-heart" size={16} />
            Average Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <span className={getScoreColor(averageScore)}>
              {averageScore.toFixed(1)}/5
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            This {period}
          </p>
        </CardContent>
      </Card>

      {/* Dominant Mood */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Crown className="text-love-coral" size={16} />
            Most Common
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{dominantMood}</span>
            <div>
              <div className="font-semibold">
                {moodLabels[dominantMood as keyof typeof moodLabels]}
              </div>
              <p className="text-sm text-muted-foreground">
                Feeling most often
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mood Trend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="text-love-deep" size={16} />
            Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <div>
              <div className="font-semibold capitalize">{trend}</div>
              <p className="text-sm text-muted-foreground">
                Compared to earlier
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Happy Streak */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="text-love-heart" size={16} />
            Happy Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {happyStreak}
          </div>
          <p className="text-sm text-muted-foreground">
            Days of good mood
          </p>
        </CardContent>
      </Card>

      {/* Partner Comparison */}
      {partnerData && partnerAverage !== null && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users2 className="text-love-coral" size={16} />
              Partner Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>You:</span>
                <Badge variant="outline">{averageScore.toFixed(1)}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Partner:</span>
                <Badge variant="outline">{partnerAverage.toFixed(1)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.abs(averageScore - partnerAverage) < 0.5 ? 
                  "You're in sync! 💕" : 
                  averageScore > partnerAverage ? 
                    "You're the mood booster! 🌟" : 
                    "Your partner is lifting you up! ✨"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood Frequency */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="text-love-heart" size={16} />
            Mood Frequency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(
              data.reduce((acc, d) => {
                acc[d.emoji] = (acc[d.emoji] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            )
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([emoji, count]) => (
              <div key={emoji} className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-1">
                  <span>{emoji}</span>
                  <span>{moodLabels[emoji as keyof typeof moodLabels]}</span>
                </span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodInsights;