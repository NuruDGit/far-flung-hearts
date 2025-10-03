import { Users, Heart, MessageCircle, Calendar, Award, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Community = () => {
  const stats = [
    { label: "Active Couples", value: "50K+", icon: Heart },
    { label: "Countries", value: "150+", icon: TrendingUp },
    { label: "Success Stories", value: "10K+", icon: Award }
  ];

  const features = [
    {
      icon: MessageCircle,
      title: "Discussion Forums",
      description: "Connect with other couples, share experiences, and get advice from the community."
    },
    {
      icon: Calendar,
      title: "Virtual Events",
      description: "Join online meetups, workshops, and Q&A sessions with relationship experts."
    },
    {
      icon: Award,
      title: "Success Stories",
      description: "Read inspiring stories from couples who've overcome distance and built lasting relationships."
    },
    {
      icon: Users,
      title: "Support Groups",
      description: "Find support groups based on your situation - time zones, visa status, and more."
    }
  ];

  const testimonials = [
    {
      name: "Sarah & Ahmed",
      location: "USA 🇺🇸 & Egypt 🇪🇬",
      story: "Love Beyond Borders helped us stay connected through 2 years of distance. We're now happily married!",
      image: "S"
    },
    {
      name: "Li Wei & Emma",
      location: "China 🇨🇳 & UK 🇬🇧",
      story: "The community support was amazing. We learned so much from other couples' experiences.",
      image: "L"
    },
    {
      name: "Carlos & Yuki",
      location: "Brazil 🇧🇷 & Japan 🇯🇵",
      story: "The daily questions brought us closer. We discovered things about each other we never knew!",
      image: "C"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-love-light/20">
      <Header />
      <main className="container mx-auto px-6 py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-love-heart to-love-coral mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-love-deep mb-4">
            Join Our Global Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with thousands of couples navigating long-distance relationships. 
            Share experiences, find support, and celebrate love that knows no borders.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, idx) => (
            <Card key={idx} className="text-center border-2">
              <CardContent className="p-8">
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-love-heart" />
                <div className="text-4xl font-bold text-love-deep mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Community Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-love-deep text-center mb-12">
            What Our Community Offers
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-2 hover:border-love-coral/50 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-love-heart/20 to-love-coral/20 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-love-heart" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-love-deep text-center mb-12">
            Success Stories
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-love-heart to-love-coral flex items-center justify-center text-white font-bold text-xl">
                      {testimonial.image}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.story}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-love-heart to-love-coral text-white">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Join?</h3>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Become part of the world's most supportive long-distance relationship community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-love-heart hover:bg-white/90"
                onClick={() => window.location.href = '/auth'}
              >
                Join the Community
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => window.location.href = '/help-center'}
              >
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
