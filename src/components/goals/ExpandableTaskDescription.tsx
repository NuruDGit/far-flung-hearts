import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableTaskDescriptionProps {
  description: string;
  maxLines?: number;
}

export function ExpandableTaskDescription({ 
  description, 
  maxLines = 2 
}: ExpandableTaskDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shouldShowToggle = description.length > 100; // Rough estimate for 2 lines
  
  return (
    <div className="space-y-1">
      <p className={`text-sm text-muted-foreground ${
        isExpanded ? '' : `line-clamp-${maxLines}`
      }`}>
        {description}
      </p>
      {shouldShowToggle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show more
            </>
          )}
        </Button>
      )}
    </div>
  );
}