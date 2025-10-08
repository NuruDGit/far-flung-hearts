import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getArticleById, getArticlesByCategory } from '@/data/helpArticles';

const HelpArticle = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  
  const article = articleId ? getArticleById(articleId) : null;
  const relatedArticles = article ? getArticlesByCategory(article.category).filter(a => a.id !== articleId) : [];

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-love-light/20">
        <Header />
        <main className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl font-bold text-love-deep mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/help-center')} variant="love">
            Back to Help Center
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-love-light/20">
      <Header />
      <main className="container mx-auto px-6 py-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/help-center" className="hover:text-love-heart">Help Center</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/help-center?category=${encodeURIComponent(article.category)}`} className="hover:text-love-heart">
            {article.category}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{article.title}</span>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/help-center')}
          className="mb-6 hover:bg-love-light/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Help Center
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <Badge className="mb-4 bg-love-heart/10 text-love-heart hover:bg-love-heart/20">
                  {article.category}
                </Badge>
                
                <h1 className="text-4xl font-bold text-love-deep mb-4">
                  {article.title}
                </h1>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                  <Clock className="h-4 w-4" />
                  Last updated: {new Date(article.lastUpdated).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>

                <div className="prose prose-lg max-w-none">
                  {article.content.split('\n\n').map((paragraph, idx) => {
                    // Handle headings
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      const heading = paragraph.replace(/\*\*/g, '');
                      return (
                        <h2 key={idx} className="text-2xl font-bold text-love-deep mt-8 mb-4">
                          {heading}
                        </h2>
                      );
                    }
                    
                    // Handle numbered lists
                    if (/^\d+\./.test(paragraph)) {
                      const items = paragraph.split('\n').filter(line => /^\d+\./.test(line));
                      return (
                        <ol key={idx} className="list-decimal list-inside space-y-2 mb-6">
                          {items.map((item, i) => (
                            <li key={i} className="text-muted-foreground">
                              {item.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')}
                            </li>
                          ))}
                        </ol>
                      );
                    }
                    
                    // Handle bullet lists
                    if (paragraph.includes('- ')) {
                      const items = paragraph.split('\n').filter(line => line.startsWith('- '));
                      return (
                        <ul key={idx} className="list-disc list-inside space-y-2 mb-6">
                          {items.map((item, i) => (
                            <li key={i} className="text-muted-foreground">
                              {item.replace(/^-\s*/, '').replace(/\*\*/g, '')}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    
                    // Regular paragraphs
                    return (
                      <p key={idx} className="text-muted-foreground mb-4 leading-relaxed">
                        {paragraph.replace(/\*\*/g, '')}
                      </p>
                    );
                  })}
                </div>

                {/* Helpful Section */}
                <div className="mt-12 pt-8 border-t">
                  <p className="text-sm text-muted-foreground mb-4">Was this article helpful?</p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      👍 Yes
                    </Button>
                    <Button variant="outline" size="sm">
                      👎 No
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {relatedArticles.length > 0 && (
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Related Articles</h3>
                  <div className="space-y-3">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.id}
                        to={`/help-center/article/${related.id}`}
                        className="block p-3 rounded-lg hover:bg-love-light/30 transition-colors group"
                      >
                        <p className="text-sm font-medium text-love-deep group-hover:text-love-heart">
                          {related.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Support Card */}
            <Card className="mt-6">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Still need help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our support team is here for you
                </p>
                <Button 
                  variant="love" 
                  className="w-full"
                  onClick={() => navigate('/contact')}
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpArticle;