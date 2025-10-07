import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export const ContentModeration = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-love-heart" />
          Content Moderation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium mb-2">Content Moderation Queue</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Review flagged content and take appropriate action
          </p>
          <p className="text-xs text-muted-foreground">
            No flagged content at this time
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
