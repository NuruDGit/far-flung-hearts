import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface MoodData {
  emoji: string;
  date: string;
  notes?: string;
}

interface MoodChartProps {
  data: MoodData[];
  type: 'line' | 'bar' | 'doughnut';
  title: string;
  period: 'week' | 'month' | 'year';
}

const MoodChart: React.FC<MoodChartProps> = ({ data, type, title, period }) => {
  const moodToScore = {
    '😄': 5, // Excited
    '😊': 4, // Happy  
    '🥰': 4, // Loving
    '😐': 3, // Neutral
    '😔': 2, // Sad
    '😢': 1, // Crying
    '😡': 2, // Angry
    '😴': 3, // Tired
    '😰': 1, // Anxious
  };

  const moodColors = {
    '😄': 'hsl(var(--love-heart))', // Excited - love heart
    '😊': 'hsl(var(--love-coral))', // Happy - love coral
    '🥰': 'hsl(var(--love-pink))', // Loving - love pink
    '😐': 'hsl(var(--muted))', // Neutral - muted
    '😔': 'hsl(var(--destructive))', // Sad - destructive
    '😢': 'hsl(var(--destructive) / 0.8)', // Crying - destructive faded
    '😡': 'hsl(var(--destructive) / 0.9)', // Angry - destructive strong  
    '😴': 'hsl(var(--muted-foreground))', // Tired - muted foreground
    '😰': 'hsl(var(--ring))', // Anxious - ring color
  };

  const moodLabels = {
    '😄': 'Excited',
    '😊': 'Happy', 
    '🥰': 'Loving',
    '😐': 'Neutral',
    '😔': 'Sad',
    '😢': 'Crying',
    '😡': 'Angry',
    '😴': 'Tired',
    '😰': 'Anxious',
  };

  const processLineData = () => {
    const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return {
      labels: sortedData.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Mood Score',
          data: sortedData.map(d => moodToScore[d.emoji as keyof typeof moodToScore] || 3),
          borderColor: 'hsl(var(--love-heart))',
          backgroundColor: 'hsl(var(--love-heart) / 0.1)',
          tension: 0.4,
          pointBackgroundColor: sortedData.map(d => moodColors[d.emoji as keyof typeof moodColors] || 'hsl(var(--muted))'),
          pointBorderColor: 'hsl(var(--background))',
          pointBorderWidth: 2,
          pointRadius: 6,
        }
      ]
    };
  };

  const processDoughnutData = () => {
    const moodCounts = data.reduce((acc, d) => {
      acc[d.emoji] = (acc[d.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(moodCounts),
      datasets: [
        {
          data: Object.values(moodCounts),
          backgroundColor: Object.keys(moodCounts).map(emoji => moodColors[emoji as keyof typeof moodColors] || 'hsl(var(--muted))'),
          borderColor: 'hsl(var(--background))',
          borderWidth: 3,
        }
      ]
    };
  };

  const processBarData = () => {
    const moodCounts = data.reduce((acc, d) => {
      acc[d.emoji] = (acc[d.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(moodCounts),
      datasets: [
        {
          label: 'Frequency',
          data: Object.values(moodCounts),
          backgroundColor: Object.keys(moodCounts).map(emoji => moodColors[emoji as keyof typeof moodColors] || 'hsl(var(--muted))'),
          borderColor: Object.keys(moodCounts).map(emoji => moodColors[emoji as keyof typeof moodColors] || 'hsl(var(--muted))'),
          borderWidth: 1,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'hsl(var(--foreground))',
          font: {
            size: 12,
            weight: 'normal' as const,
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: 'hsl(var(--foreground))',
        font: {
          size: 16,
          weight: 'bold' as const,
        }
      },
      tooltip: {
        backgroundColor: 'hsl(var(--card))',
        titleColor: 'hsl(var(--foreground))',
        bodyColor: 'hsl(var(--foreground))',
        borderColor: 'hsl(var(--love-coral))',
        borderWidth: 2,
      }
    },
    scales: type !== 'doughnut' ? {
      x: {
        ticks: {
          color: 'hsl(var(--muted-foreground))',
        },
        grid: {
          color: 'hsl(var(--love-coral) / 0.2)',
        }
      },
      y: {
        ticks: {
          color: 'hsl(var(--muted-foreground))',
        },
        grid: {
          color: 'hsl(var(--love-coral) / 0.2)',
        },
        ...(type === 'line' && {
          min: 1,
          max: 5,
          ticks: {
            stepSize: 1,
            callback: function(value: any) {
              const labels = { 1: '😢', 2: '😔', 3: '😐', 4: '😊', 5: '😄' };
              return labels[value as keyof typeof labels] || value;
            },
            color: 'hsl(var(--muted-foreground))',
          }
        })
      }
    } : undefined,
  };

  const chartData = type === 'line' ? processLineData() : 
                   type === 'doughnut' ? processDoughnutData() : 
                   processBarData();

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="bg-gradient-to-r from-love-coral/5 to-love-heart/5 rounded-lg p-4 border border-love-coral/20">
        <h4 className="text-sm font-medium mb-3 text-muted-foreground">Chart Legend</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {Object.entries(moodLabels).map(([emoji, label]) => (
            <div key={emoji} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border-2 border-background" 
                style={{ backgroundColor: moodColors[emoji as keyof typeof moodColors] }}
              />
              <span className="text-muted-foreground">{emoji} {label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        {type === 'line' && <Line data={chartData} options={chartOptions} />}
        {type === 'bar' && <Bar data={chartData} options={chartOptions} />}
        {type === 'doughnut' && <Doughnut data={chartData} options={chartOptions} />}
      </div>
    </div>
  );
};

export default MoodChart;