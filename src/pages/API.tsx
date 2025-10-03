import { Code, Key, Book, Zap, Shield, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API = () => {
  const features = [
    {
      icon: Key,
      title: "RESTful API",
      description: "Clean, predictable API endpoints following REST principles"
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "OAuth 2.0 and API key authentication for secure access"
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "WebSocket support for instant message and event notifications"
    },
    {
      icon: Book,
      title: "Comprehensive Docs",
      description: "Detailed documentation with code examples in multiple languages"
    }
  ];

  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/messages",
      description: "Retrieve messages for a pair",
      auth: "Required"
    },
    {
      method: "POST",
      path: "/api/v1/messages",
      description: "Send a new message",
      auth: "Required"
    },
    {
      method: "GET",
      path: "/api/v1/calendar/events",
      description: "Get calendar events",
      auth: "Required"
    },
    {
      method: "POST",
      path: "/api/v1/calendar/events",
      description: "Create a new event",
      auth: "Required"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-love-light/20">
      <Header />
      <main className="container mx-auto px-6 py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-love-heart to-love-coral mb-6">
            <Code className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-love-deep mb-4">
            Love Beyond Borders API
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Build powerful integrations with our developer-friendly API. 
            Access messages, calendar events, and more programmatically.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Button size="lg" className="bg-gradient-to-r from-love-heart to-love-coral hover:from-love-coral hover:to-love-heart">
              Get API Key
            </Button>
            <Button size="lg" variant="outline">
              <Book className="w-4 h-4 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, idx) => (
            <Card key={idx} className="text-center border-2 hover:border-love-coral/50 transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-love-heart/20 to-love-coral/20 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-love-heart" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* API Examples */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-love-deep text-center mb-12">
            Quick Start Guide
          </h2>
          
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curl">
              <Card>
                <CardContent className="p-6">
                  <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
                    <code>{`curl -X GET https://api.lovebeyondborders.com/v1/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="javascript">
              <Card>
                <CardContent className="p-6">
                  <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
                    <code>{`const response = await fetch(
  'https://api.lovebeyondborders.com/v1/messages',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);
const data = await response.json();`}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="python">
              <Card>
                <CardContent className="p-6">
                  <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
                    <code>{`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.lovebeyondborders.com/v1/messages',
    headers=headers
)
data = response.json()`}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* API Endpoints */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-love-deep text-center mb-12">
            Popular Endpoints
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {endpoints.map((endpoint, idx) => (
                  <div key={idx} className="p-6 hover:bg-love-light/20 transition-colors">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <Badge 
                          className={
                            endpoint.method === 'GET' 
                              ? 'bg-blue-500' 
                              : 'bg-green-500'
                          }
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="font-mono text-sm">{endpoint.path}</code>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                        <Badge variant="outline">{endpoint.auth}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">API Pricing</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-love-deep mb-2">Free Tier</h3>
                <div className="text-4xl font-bold text-love-heart mb-4">$0</div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>1,000 requests/month</li>
                  <li>Basic endpoints</li>
                  <li>Community support</li>
                </ul>
              </div>
              <div className="text-center border-2 border-love-coral rounded-lg p-6 -m-2">
                <Badge className="bg-gradient-to-r from-love-heart to-love-coral mb-2">Popular</Badge>
                <h3 className="text-2xl font-bold text-love-deep mb-2">Pro</h3>
                <div className="text-4xl font-bold text-love-heart mb-4">$49<span className="text-lg text-muted-foreground">/mo</span></div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>100,000 requests/month</li>
                  <li>All endpoints</li>
                  <li>Priority support</li>
                </ul>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-love-deep mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-love-heart mb-4">Custom</div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Unlimited requests</li>
                  <li>Dedicated support</li>
                  <li>SLA guarantee</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-love-heart to-love-coral text-white">
          <CardContent className="p-12 text-center">
            <Code className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-4">Ready to Build?</h3>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Get started with our API today and create amazing integrations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-love-heart hover:bg-white/90"
              >
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full Docs
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default API;
