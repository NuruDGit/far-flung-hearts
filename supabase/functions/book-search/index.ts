import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookTitle, affiliateTag } = await req.json();

    if (!bookTitle) {
      throw new Error('Book title is required');
    }

    // Use Google Books API to get book information
    const googleBooksResponse = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookTitle)}&maxResults=1`
    );
    
    const googleBooksData = await googleBooksResponse.json();
    
    if (!googleBooksData.items || googleBooksData.items.length === 0) {
      throw new Error('Book not found');
    }

    const book = googleBooksData.items[0];
    const volumeInfo = book.volumeInfo;

    // Extract book details
    const bookData = {
      title: volumeInfo.title || 'Unknown Title',
      authors: volumeInfo.authors || ['Unknown Author'],
      description: volumeInfo.description || 'No description available',
      image: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || '',
      isbn: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || 
            volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || '',
      publishedDate: volumeInfo.publishedDate || '',
      pageCount: volumeInfo.pageCount || 0,
      categories: volumeInfo.categories || [],
      rating: volumeInfo.averageRating || 0
    };

    // Generate Amazon affiliate link
    const amazonSearchQuery = encodeURIComponent(`${bookData.title} ${bookData.authors[0]}`);
    const amazonAffiliateLink = affiliateTag 
      ? `https://www.amazon.com/s?k=${amazonSearchQuery}&tag=${affiliateTag}`
      : `https://www.amazon.com/s?k=${amazonSearchQuery}`;

    const result = {
      ...bookData,
      amazonLink: amazonAffiliateLink,
      affiliateEnabled: !!affiliateTag
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in book-search function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});