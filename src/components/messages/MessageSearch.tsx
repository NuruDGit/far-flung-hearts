import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MessageSearchProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isVisible: boolean;
  searchQuery: string;
  resultCount?: number;
}

export const MessageSearch = ({
  onSearch,
  onClear,
  isVisible,
  searchQuery,
  resultCount
}: MessageSearchProps) => {
  const [query, setQuery] = useState(searchQuery);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClear();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClear]);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  if (!isVisible) return null;

  return (
    <div ref={searchRef} className="border-b border-border bg-background p-3">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search messages..."
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X size={14} />
            </Button>
          )}
        </div>
        {resultCount !== undefined && query && (
          <Badge variant="secondary" className="text-xs">
            {resultCount} result{resultCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    </div>
  );
};