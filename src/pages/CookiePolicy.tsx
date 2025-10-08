import { Cookie, Settings, Eye, Shield } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const CookiePolicy = () => {
  const cookieTypes = [
    {
      icon: Shield,
      name: "Essential Cookies",
      description: "Required for the website to function properly. These cannot be disabled.",
      examples: "Authentication, security, session management",
      required: true
    },
    {
      icon: Settings,
      name: "Functional Cookies",
      description: "Enable enhanced functionality and personalization.",
      examples: "Language preferences, theme selection, user settings",
      required: false
    },
    {
      icon: Eye,
      name: "Analytics Cookies",
      description: "Help us understand how visitors interact with our website.",
      examples: "Page views, feature usage, error tracking",
      required: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-love-light/20">
      <Header />
      <main className="container mx-auto px-6 py-24 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-love-heart to-love-coral mb-6">
            <Cookie className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-love-deep mb-4">
            Cookie Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: March 2024
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-love-deep mb-4">What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are placed on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and 
              understanding how you use our service.
            </p>
          </CardContent>
        </Card>

        {/* Cookie Types */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-love-deep mb-6">Types of Cookies We Use</h2>
          <div className="space-y-6">
            {cookieTypes.map((type, idx) => (
              <Card key={idx}>
                <CardContent className="p-8">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-love-heart/20 to-love-coral/20 flex items-center justify-center flex-shrink-0">
                        <type.icon className="w-6 h-6 text-love-heart" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-love-deep mb-2">{type.name}</h3>
                        <p className="text-muted-foreground mb-2">{type.description}</p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Examples:</span> {type.examples}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        id={`cookie-${idx}`}
                        checked={type.required}
                        disabled={type.required}
                      />
                      <Label htmlFor={`cookie-${idx}`} className="text-sm">
                        {type.required ? "Required" : "Optional"}
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How We Use Cookies */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-love-deep mb-4">How We Use Cookies</h2>
            <div className="text-muted-foreground space-y-4">
              <p>We use cookies to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Keep you signed in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our service to improve it</li>
                <li>Provide personalized content and recommendations</li>
                <li>Ensure security and prevent fraud</li>
                <li>Analyze site performance and fix issues</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-love-deep mb-4">Third-Party Cookies</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We use services from trusted third parties that may also set cookies. These include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Authentication:</strong> Supabase for secure login and user management</li>
                <li><strong>Payments:</strong> Stripe for processing subscriptions (only on payment pages)</li>
                <li><strong>Analytics:</strong> Privacy-focused analytics to understand usage patterns</li>
              </ul>
              <p>
                These third parties have their own privacy policies governing their use of cookies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Managing Cookies */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-love-deep mb-4">Managing Your Cookie Preferences</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                You have several options to control cookies:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Browser Settings:</strong> Most browsers allow you to refuse cookies or delete them</li>
                <li><strong>Opt-Out Tools:</strong> Use browser extensions to block tracking cookies</li>
                <li><strong>Do Not Track:</strong> Enable "Do Not Track" in your browser preferences</li>
              </ul>
              <p className="font-semibold text-love-heart">
                Please note: Blocking essential cookies may affect the functionality of our service.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Lifespan */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-love-deep mb-4">Cookie Lifespan</h2>
            <div className="text-muted-foreground space-y-4">
              <p>Cookies can be:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Session cookies:</strong> Temporary cookies that expire when you close your browser</li>
                <li><strong>Persistent cookies:</strong> Remain on your device until they expire or you delete them (typically 1-12 months)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Updates to Policy */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-love-deep mb-4">Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for 
              other operational, legal, or regulatory reasons. We encourage you to review this policy periodically.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-gradient-to-br from-love-light/30 to-love-soft/30">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-love-deep mb-4">Questions About Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <div className="space-y-2 text-muted-foreground mb-6">
              <p>Email: privacy@lobebo.com</p>
              <p>Address: Global • Remote First</p>
            </div>
            <Button 
              className="bg-gradient-to-r from-love-heart to-love-coral hover:from-love-coral hover:to-love-heart"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Us
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
