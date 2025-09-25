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
    '😄': '#FFD700', // Gold
    '😊': '#32CD32', // Lime Green
    '🥰': '#FF69B4', // Hot Pink
    '😐': '#87CEEB', // Sky Blue
    '😔': '#4682B4', // Steel Blue
    '😢': '#4169E1', // Royal Blue
    '😡': '#DC143C', // Crimson
    '😴': '#9370DB', // Medium Purple
    '😰': '#FF6347', // Tomato
  };

  const processLineData = () => {
    const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return {
      labels: sortedData.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Mood Score',
          data: sortedData.map(d => moodToScore[d.emoji as keyof typeof moodToScore] || 3),
          borderColor: 'rgb(129, 140, 248)',
          backgroundColor: 'rgba(129, 140, 248, 0.1)',
          tension: 0.4,
          pointBackgroundColor: sortedData.map(d => moodColors[d.emoji as keyof typeof moodColors] || '#87CEEB'),
          pointBorderColor: '#fff',
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
          backgroundColor: Object.keys(moodCounts).map(emoji => moodColors[emoji as keyof typeof moodColors] || '#87CEEB'),
          borderColor: '#fff',
          borderWidth: 2,
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
          backgroundColor: Object.keys(moodCounts).map(emoji => moodColors[emoji as keyof typeof moodColors] || '#87CEEB'),
          borderColor: Object.keys(moodCounts).map(emoji => moodColors[emoji as keyof typeof moodColors] || '#87CEEB'),
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
        backgroundColor: 'hsl(var(--popover))',
        titleColor: 'hsl(var(--popover-foreground))',
        bodyColor: 'hsl(var(--popover-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
      }
    },
    scales: type !== 'doughnut' ? {
      x: {
        ticks: {
          color: 'hsl(var(--muted-foreground))',
        },
        grid: {
          color: 'hsl(var(--border))',
        }
      },
      y: {
        ticks: {
          color: 'hsl(var(--muted-foreground))',
        },
        grid: {
          color: 'hsl(var(--border))',
        },
        ...(type === 'line' && {
          min: 1,
          max: 5,
          ticks: {
            stepSize: 1,
            callback: function(value: any) {
              const labels = { 1: '😢', 2: '😔', 3: '😐', 4: '😊', 5: '😄' };
              return labels[value as keyof typeof labels] || value;
            }
          }
        })
      }
    } : undefined,
  };

  const chartData = type === 'line' ? processLineData() : 
                   type === 'doughnut' ? processDoughnutData() : 
                   processBarData();

  return (
    <div className="h-64 w-full">
      {type === 'line' && <Line data={chartData} options={chartOptions} />}
      {type === 'bar' && <Bar data={chartData} options={chartOptions} />}
      {type === 'doughnut' && <Doughnut data={chartData} options={chartOptions} />}
    </div>
  );
};

export default MoodChart;