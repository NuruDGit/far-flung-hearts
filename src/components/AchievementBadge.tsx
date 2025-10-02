import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface AchievementBadgeProps {
  icon: LucideIcon;
  title: string;
  description: string;
  progress: number;
  total: number;
  unlocked?: boolean;
}

export const AchievementBadge = ({ 
  icon: Icon, 
  title, 
  description, 
  progress, 
  total,
  unlocked = false 
}: AchievementBadgeProps) => {
  const percentage = Math.min((progress / total) * 100, 100);
  const isComplete = progress >= total;

  return (
    <Card className={`transition-all ${isComplete ? 'border-love-heart shadow-md' : 'border-muted'}`}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isComplete 
              ? 'bg-gradient-to-r from-love-heart to-love-coral' 
              : 'bg-muted'
          }`}>
            <Icon className={isComplete ? 'text-white' : 'text-muted-foreground'} size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-sm text-love-deep">{title}</h4>
              {isComplete && (
                <Badge variant="default" className="bg-gradient-to-r from-love-heart to-love-coral text-xs">
                  ✨ Unlocked
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
            
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress}/{total}</span>
                <span>{percentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    isComplete 
                      ? 'bg-gradient-to-r from-love-heart to-love-coral' 
                      : 'bg-love-coral/50'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
