import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink } from 'lucide-react';

interface BookCardProps {
  title: string;
  authors: string[];
  description: string;
  image: string;
  amazonLink: string;
  rating?: number;
  categories?: string[];
  publishedDate?: string;
}

export const BookCard = ({ 
  title, 
  authors, 
  description, 
  image, 
  amazonLink, 
  rating, 
  categories,
  publishedDate 
}: BookCardProps) => {
  const truncatedDescription = description.length > 200 
    ? description.substring(0, 200) + '...' 
    : description;

  return (
    <Card className="max-w-md mx-auto mb-4 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="flex">
          {/* Book Cover */}
          <div className="w-24 h-32 flex-shrink-0">
            {image ? (
              <img 
                src={image} 
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs text-center p-2">No Image</span>
              </div>
            )}
          </div>
          
          {/* Book Details */}
          <div className="flex-1 p-4">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1">{title}</h3>
            <p className="text-xs text-gray-600 mb-2">by {authors.join(', ')}</p>
            
            {/* Rating and Categories */}
            <div className="flex items-center gap-2 mb-2">
              {rating && rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-accent text-accent" />
                  <span className="text-xs">{rating}</span>
                </div>
              )}
              {publishedDate && (
                <span className="text-xs text-gray-500">{publishedDate.split('-')[0]}</span>
              )}
            </div>

            {/* Categories */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {categories.slice(0, 2).map((category, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                    {category}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Description */}
            <p className="text-xs text-gray-700 mb-3 line-clamp-3">{truncatedDescription}</p>
            
            {/* Amazon Link */}
            <Button 
              size="sm" 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs"
              onClick={() => window.open(amazonLink, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View on Amazon
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};