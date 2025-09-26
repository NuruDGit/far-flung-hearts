import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar as CalendarIcon, X, ArrowUpDown, ArrowUp, ArrowDown, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface FilterState {
  search: string;
  mediaType: 'all' | 'image' | 'video';
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  sortBy: 'date' | 'name' | 'size';
  sortDirection: 'asc' | 'desc';
  showFavorites?: boolean;
}

interface MemoryVaultFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

const MemoryVaultFilters = ({ filters, onFiltersChange, totalCount, filteredCount }: MemoryVaultFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearDateRange = () => {
    updateFilters({
      dateRange: { from: null, to: null }
    });
  };

  const hasActiveFilters = filters.search || 
    filters.mediaType !== 'all' || 
    filters.dateRange.from || 
    filters.dateRange.to ||
    filters.showFavorites;

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      mediaType: 'all',
      dateRange: { from: null, to: null },
      sortBy: 'date',
      sortDirection: 'desc',
      showFavorites: false
    });
  };

  const getSortIcon = () => {
    if (filters.sortDirection === 'asc') return <ArrowUp size={14} />;
    if (filters.sortDirection === 'desc') return <ArrowDown size={14} />;
    return <ArrowUpDown size={14} />;
  };

  return (
    <div className="space-y-4">
      {/* Search and Quick Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search memories by name..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="whitespace-nowrap"
          >
            <Filter size={16} className="mr-1" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-4 w-4 p-0 flex items-center justify-center text-xs">
                !
              </Badge>
            )}
          </Button>

          <Select
            value={`${filters.sortBy}-${filters.sortDirection}`}
            onValueChange={(value) => {
              const [sortBy, sortDirection] = value.split('-') as [FilterState['sortBy'], FilterState['sortDirection']];
              updateFilters({ sortBy, sortDirection });
            }}
          >
            <SelectTrigger className="w-32">
              <div className="flex items-center gap-1">
                {getSortIcon()}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest</SelectItem>
              <SelectItem value="date-asc">Oldest</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="size-desc">Largest</SelectItem>
              <SelectItem value="size-asc">Smallest</SelectItem>
            </SelectContent>
          </Select>

          {/* Favorites Toggle */}
          <Button
            variant={filters.showFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilters({ showFavorites: !filters.showFavorites })}
            className="flex items-center gap-2"
          >
            <Heart size={16} className={filters.showFavorites ? 'fill-current' : ''} />
            Favorites
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Media Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Media Type</label>
                <Select
                  value={filters.mediaType}
                  onValueChange={(value: FilterState['mediaType']) => updateFilters({ mediaType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Media</SelectItem>
                    <SelectItem value="image">Images Only</SelectItem>
                    <SelectItem value="video">Videos Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon size={16} className="mr-2" />
                      {filters.dateRange.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, "MMM d")} - {format(filters.dateRange.to, "MMM d, yyyy")}
                          </>
                        ) : (
                          format(filters.dateRange.from, "MMM d, yyyy")
                        )
                      ) : (
                        "Pick a date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      defaultMonth={filters.dateRange.from || undefined}
                      selected={{
                        from: filters.dateRange.from || undefined,
                        to: filters.dateRange.to || undefined
                      }}
                      onSelect={(range) => {
                        updateFilters({
                          dateRange: {
                            from: range?.from || null,
                            to: range?.to || null
                          }
                        });
                      }}
                      numberOfMonths={2}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  className="w-full"
                >
                  <X size={16} className="mr-1" />
                  Clear All
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: "{filters.search}"
                    <X size={12} className="cursor-pointer" onClick={() => updateFilters({ search: '' })} />
                  </Badge>
                )}
                {filters.mediaType !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {filters.mediaType}
                    <X size={12} className="cursor-pointer" onClick={() => updateFilters({ mediaType: 'all' })} />
                  </Badge>
                )}
                {filters.dateRange.from && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Date: {format(filters.dateRange.from, "MMM d")}
                    {filters.dateRange.to && ` - ${format(filters.dateRange.to, "MMM d")}`}
                    <X size={12} className="cursor-pointer" onClick={clearDateRange} />
                  </Badge>
                )}
                {filters.showFavorites && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Heart size={12} className="fill-current" />
                    Favorites only
                    <X size={12} className="cursor-pointer" onClick={() => updateFilters({ showFavorites: false })} />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCount} of {totalCount} memories
        {hasActiveFilters && filteredCount < totalCount && (
          <span className="ml-2 text-love-heart">
            ({totalCount - filteredCount} filtered out)
          </span>
        )}
      </div>
    </div>
  );
};

export default MemoryVaultFilters;