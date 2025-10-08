import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface MoodEntry {
  id: string;
  emoji: string;
  date: string;
  user_id: string;
}

interface AnimatedMoodChartProps {
  userMoods: MoodEntry[];
  partnerMoods: MoodEntry[];
  period: 'week' | 'month' | 'year';
}

const emojiToScore: Record<string, number> = {
  '😊': 5, '😌': 4, '😍': 5, '😎': 5, '🥰': 5,
  '😔': 2, '😰': 2, '😤': 2, '😴': 3, '🤔': 3,
  '😢': 1, '😡': 1,
};

export const AnimatedMoodChart: React.FC<AnimatedMoodChartProps> = ({
  userMoods,
  partnerMoods,
  period,
}) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Group moods by date
    const moodMap = new Map();
    
    userMoods.forEach(mood => {
      const date = format(new Date(mood.date), 'MMM d');
      if (!moodMap.has(date)) {
        moodMap.set(date, { date, userScore: 0, userCount: 0, partnerScore: 0, partnerCount: 0 });
      }
      const entry = moodMap.get(date);
      entry.userScore += emojiToScore[mood.emoji] || 3;
      entry.userCount += 1;
    });

    partnerMoods.forEach(mood => {
      const date = format(new Date(mood.date), 'MMM d');
      if (!moodMap.has(date)) {
        moodMap.set(date, { date, userScore: 0, userCount: 0, partnerScore: 0, partnerCount: 0 });
      }
      const entry = moodMap.get(date);
      entry.partnerScore += emojiToScore[mood.emoji] || 3;
      entry.partnerCount += 1;
    });

    // Calculate averages
    const data = Array.from(moodMap.values()).map(entry => ({
      date: entry.date,
      you: entry.userCount > 0 ? entry.userScore / entry.userCount : null,
      partner: entry.partnerCount > 0 ? entry.partnerScore / entry.partnerCount : null,
    }));

    setChartData(data);
  }, [userMoods, partnerMoods]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Mood Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorYou" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPartner" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="you"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorYou)"
                strokeWidth={2}
                dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="partner"
                stroke="hsl(var(--accent))"
                fillOpacity={1}
                fill="url(#colorPartner)"
                strokeWidth={2}
                dot={{ r: 4, fill: 'hsl(var(--accent))' }}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">You</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">Partner</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
