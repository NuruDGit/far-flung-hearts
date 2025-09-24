import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BookCard } from './BookCard';
import { Skeleton } from '@/components/ui/skeleton';

interface BookRecommendationsProps {
  messageText: string;
}

export const BookRecommendations = ({ messageText }: BookRecommendationsProps) => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookData = async () => {
      // Extract book titles from the message
      const bookMatches = messageText.match(/📚 BOOK_RECOMMENDATION: (.*?)(?=\n|$)/g);
      if (!bookMatches) {
        setLoading(false);
        return;
      }

      const bookTitles = bookMatches.map(match => 
        match.replace('📚 BOOK_RECOMMENDATION: ', '').trim()
      );

      try {
        const bookPromises = bookTitles.map(async (bookTitle) => {
          const { data, error } = await supabase.functions.invoke('book-search', {
            body: { 
              bookTitle,
              affiliateTag: 'nurudigital20-20'
            }
          });
          
          if (error) {
            console.error('Error fetching book data:', error);
            return null;
          }
          
          return data;
        });

        const bookResults = await Promise.all(bookPromises);
        setBooks(bookResults.filter(book => book !== null));
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, [messageText]);

  if (loading) {
    return (
      <div className="mt-3 space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="flex space-x-3">
            <Skeleton className="w-16 h-20" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3">
      {books.map((book, index) => (
        <BookCard
          key={index}
          title={book.title}
          authors={book.authors}
          description={book.description}
          image={book.image}
          amazonLink={book.amazonLink}
          rating={book.rating}
          categories={book.categories}
          publishedDate={book.publishedDate}
        />
      ))}
    </div>
  );
};