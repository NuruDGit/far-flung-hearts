import { Search, MessageCircle, Book, Video, Mail, HelpCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: MessageCircle,
      title: "Getting Started",
      description: "Learn the basics of Love Beyond Borders",
      articleCount: 12
    },
    {
      icon: Video,
      title: "Video Calls",
      description: "Setup and troubleshooting for video calls",
      articleCount: 8
    },
    {
      icon: Book,
      title: "Features Guide",
      description: "Explore all features and capabilities",
      articleCount: 15
    },
    {
      icon: HelpCircle,
      title: "Troubleshooting",
      description: "Common issues and solutions",
      articleCount: 10
    }
  ];

  const faqs = [
    {
      question: "How do I invite my partner?",
      answer: "Go to your profile settings and click on 'Invite Partner'. You can share a unique invitation code or link via email, text, or any messaging app. Your partner will need to create an account and enter the code to connect with you."
    },
    {
      question: "What subscription plans are available?",
      answer: "We offer two plans: Free (basic features with limits) and Premium ($9.99/month with unlimited messages, video calls, AI advisor, goals, mood tracking, and all advanced features)."
    },
    {
      question: "How do video calls work?",
      answer: "Video calls are available for Premium users. Simply go to the Messages page and tap the video call icon. Your partner will receive a notification and can join instantly. Premium users get unlimited HD video calls with call history."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! All your data is encrypted end-to-end using AES-256 encryption. We never sell or share your personal information. See our Security page for more details."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Absolutely! You can cancel your subscription at any time from your account settings. You'll continue to have access to premium features until the end of your billing period."
    },
    {
      question: "How does the AI Love Advisor work?",
      answer: "Our AI Love Advisor uses advanced language models to provide personalized relationship advice, date ideas, and communication tips. It learns from your interactions to give more tailored suggestions over time."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-love-light/20">
      <Header />
      <main className="container mx-auto px-6 py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-love-deep mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Search our knowledge base or browse categories to find answers
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for help articles..."
              className="pl-12 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-love-deep mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, idx) => (
              <Card key={idx} className="cursor-pointer hover:border-love-coral/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-love-heart/20 to-love-coral/20 flex items-center justify-center mb-4">
                    <category.icon className="w-6 h-6 text-love-heart" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-2">{category.description}</p>
                  <p className="text-sm text-love-heart font-medium">{category.articleCount} articles</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-love-deep mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-left text-lg font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact Support */}
        <Card className="bg-gradient-to-br from-love-heart to-love-coral text-white">
          <CardContent className="p-8 text-center">
            <Mail className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
            <p className="mb-6 text-white/90">
              Our support team is here to assist you 24/7
            </p>
            <Button 
              size="lg" 
              className="bg-white text-love-heart hover:bg-white/90"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
