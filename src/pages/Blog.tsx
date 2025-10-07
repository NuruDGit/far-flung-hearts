import { Calendar, Clock, Heart, TrendingUp, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Blog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const featuredPost = {
    slug: "keep-spark-alive-ldr",
    title: "10 Ways to Keep the Spark Alive in Long-Distance Relationships",
    excerpt: "Distance doesn't have to mean disconnection. Discover proven strategies to maintain intimacy and excitement in your LDR.",
    author: "Dr. Sarah Johnson",
    date: "March 15, 2024",
    readTime: "8 min read",
    category: "Relationship Tips",
    image: "💕"
  };

  const blogPosts = [
    {
      slug: "time-zone-challenges",
      title: "Time Zone Challenges: How to Sync Your Schedules",
      excerpt: "Practical tips for couples separated by multiple time zones to find quality time together.",
      author: "Mark Chen",
      date: "March 10, 2024",
      readTime: "5 min read",
      category: "Practical Advice",
      image: "🌍"
    },
    {
      slug: "psychology-of-missing",
      title: "The Psychology of Missing Someone",
      excerpt: "Understanding the emotional aspects of being apart and how to cope healthily.",
      author: "Dr. Emily Roberts",
      date: "March 8, 2024",
      readTime: "7 min read",
      category: "Mental Health",
      image: "🧠"
    },
    {
      slug: "virtual-date-ideas",
      title: "Virtual Date Ideas That Actually Work",
      excerpt: "Creative ways to enjoy meaningful dates when you can't be physically together.",
      author: "Jessica Martinez",
      date: "March 5, 2024",
      readTime: "6 min read",
      category: "Date Ideas",
      image: "🎬"
    },
    {
      slug: "communication-tips-busy-couples",
      title: "Communication Tips for Busy Couples",
      excerpt: "How to maintain meaningful connection when life gets hectic.",
      author: "David Thompson",
      date: "March 1, 2024",
      readTime: "5 min read",
      category: "Communication",
      image: "💬"
    },
    {
      slug: "success-story-sarah-ahmed",
      title: "Success Story: From 5,000 Miles Apart to Married",
      excerpt: "How Sarah and Ahmed overcame distance, visa challenges, and cultural differences.",
      author: "Love Beyond Borders Team",
      date: "February 28, 2024",
      readTime: "10 min read",
      category: "Success Stories",
      image: "💍"
    },
    {
      slug: "managing-jealousy-ldr",
      title: "Managing Jealousy in Long-Distance Relationships",
      excerpt: "Expert advice on building trust and handling insecurity when apart.",
      author: "Dr. Sarah Johnson",
      date: "February 25, 2024",
      readTime: "8 min read",
      category: "Relationship Tips",
      image: "💚"
    }
  ];

  const categories = [
    "All Posts",
    "Relationship Tips",
    "Communication",
    "Mental Health",
    "Success Stories",
    "Date Ideas",
    "Practical Advice"
  ];

  const filteredPosts = selectedCategory === "All Posts" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubscribing(true);

    try {
      const { data, error } = await supabase.functions.invoke('newsletter-subscribe', {
        body: { email: newsletterEmail }
      });

      if (error) throw error;

      toast({
        title: "Success! 🎉",
        description: data.message || "You've been subscribed to our newsletter!",
      });
      
      setNewsletterEmail("");
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Subscription failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-love-light/20">
      <Header />
      <main className="container mx-auto px-6 py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-love-deep mb-4">
            Love Beyond Borders Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert advice, success stories, and practical tips for long-distance couples
          </p>
        </div>

        {/* Categories Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-12">
          <TabsList className="flex flex-wrap h-auto justify-center gap-2 bg-transparent p-0">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-love-heart data-[state=active]:to-love-coral data-[state=active]:text-white"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Featured Post */}
        <Card className="mb-16 border-2 border-love-coral/30 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="bg-gradient-to-br from-love-heart/10 to-love-coral/10 flex items-center justify-center p-12">
              <div className="text-8xl">{featuredPost.image}</div>
            </div>
            <CardContent className="p-8 flex flex-col justify-center">
              <Badge className="bg-gradient-to-r from-love-heart to-love-coral w-fit mb-4">
                Featured
              </Badge>
              <h2 className="text-3xl font-bold text-love-deep mb-4">
                {featuredPost.title}
              </h2>
              <p className="text-muted-foreground mb-6">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {featuredPost.date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {featuredPost.readTime}
                </div>
              </div>
              <Button 
                onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                className="bg-gradient-to-r from-love-heart to-love-coral hover:from-love-coral hover:to-love-heart"
              >
                Read Article <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </div>
        </Card>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, idx) => (
            <Card 
              key={idx} 
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => navigate(`/blog/${post.slug}`)}
            >
              <div className="bg-gradient-to-br from-love-light/30 to-love-soft/30 h-48 flex items-center justify-center text-6xl">
                {post.image}
              </div>
              <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">
                  {post.category}
                </Badge>
                <CardTitle className="text-xl group-hover:text-love-heart transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </div>
                  <span>{post.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter CTA */}
        <Card className="mt-16 bg-gradient-to-br from-love-heart to-love-coral text-white">
          <CardContent className="p-12 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-4">Never Miss a Post</h3>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Get our latest relationship tips and success stories delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 w-full">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  disabled={isSubscribing}
                  className="flex-1 bg-white text-gray-900"
                  required
                />
                <Button 
                  type="submit"
                  size="lg" 
                  disabled={isSubscribing}
                  className="bg-white text-love-heart hover:bg-white/90"
                >
                  {isSubscribing ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
