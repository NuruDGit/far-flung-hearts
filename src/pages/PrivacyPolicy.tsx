import { Shield, Eye, Lock, Database } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Information We Collect",
      icon: Database,
      content: `We collect information you provide directly to us, including:
      • Account information (name, email, profile details)
      • Messages and media you share with your partner
      • Usage data and preferences
      • Payment information (processed securely by Stripe)
      • Location data (only if you enable it for features like weather)`
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      content: `We use the information we collect to:
      • Provide, maintain, and improve our services
      • Send you technical notices and support messages
      • Respond to your comments and questions
      • Protect against fraudulent or illegal activity
      • Personalize your experience with AI features`
    },
    {
      title: "Data Security",
      icon: Lock,
      content: `We take security seriously:
      • All data is encrypted in transit (TLS 1.3) and at rest (AES-256)
      • End-to-end encryption for messages and media
      • Regular security audits and penetration testing
      • SOC 2 Type II certified infrastructure
      • Limited employee access with strict protocols`
    },
    {
      title: "Your Rights",
      icon: Shield,
      content: `You have the right to:
      • Access your personal data
      • Correct inaccurate data
      • Delete your account and data
      • Export your data
      • Opt-out of marketing communications
      • Lodge a complaint with a supervisory authority`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-love-light/20">
      <Header />
      <main className="container mx-auto px-6 py-24 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-love-heart to-love-coral mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-love-deep mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <p className="text-muted-foreground leading-relaxed">
              At Love Beyond Borders, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our service. Please read this privacy 
              policy carefully. If you do not agree with the terms of this privacy policy, please do not access the service.
            </p>
          </CardContent>
        </Card>

        {/* Main Sections */}
        <div className="space-y-8 mb-12">
          {sections.map((section, idx) => (
            <Card key={idx}>
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-love-heart/20 to-love-coral/20 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-love-heart" />
                  </div>
                  <h2 className="text-2xl font-bold text-love-deep">{section.title}</h2>
                </div>
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed ml-16">
                  {section.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Sections */}
        <div className="space-y-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">Sharing Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your 
                information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>With your partner (for shared features like messages and calendar)</li>
                <li>With service providers (hosting, analytics, payment processing)</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With your explicit consent</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service and hold certain 
                information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                However, if you do not accept cookies, you may not be able to use some portions of our service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and maintained on computers located outside of your state, 
                province, country, or other governmental jurisdiction. We ensure that all transfers comply with 
                applicable data protection laws, including GDPR and CCPA.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children under 18. If you become aware that a child has provided us 
                with personal information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">GDPR Rights (EU Users)</h2>
              <div className="text-muted-foreground space-y-4">
                <p>Under GDPR, EU users have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Right to Access (Article 15)</li>
                  <li>Right to Rectification (Article 16)</li>
                  <li>Right to Erasure ("Right to be Forgotten", Article 17)</li>
                  <li>Right to Data Portability (Article 20)</li>
                  <li>Right to Object (Article 21)</li>
                </ul>
                <p className="font-medium mt-4">
                  To exercise these rights, email: gdpr@lobebo.com
                </p>
                <p className="text-sm">Response time: 30 days maximum</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">CCPA Rights (California Users)</h2>
              <div className="text-muted-foreground space-y-4">
                <p>California residents have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Know what personal information is collected</li>
                  <li>Know if personal information is sold or disclosed</li>
                  <li>Say no to the sale of personal information</li>
                  <li>Access their personal information</li>
                  <li>Request deletion of personal information</li>
                  <li>Not be discriminated against for exercising CCPA rights</li>
                </ul>
                <p className="font-medium mt-4">
                  To exercise these rights, email: privacy@lobebo.com
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">Data Retention Policy</h2>
              <div className="text-muted-foreground space-y-4">
                <p>We retain your data as follows:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Active accounts: Indefinitely while account is active</li>
                  <li>Deleted accounts: 30 days grace period, then permanent deletion</li>
                  <li>Messages: 90 days after account deletion</li>
                  <li>Payment records: 7 years (legal requirement)</li>
                  <li>Analytics data: 2 years</li>
                  <li>Backup data: 90 days maximum</li>
                </ul>
                <p className="mt-4">You can request early deletion by contacting support.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">Third-Party Data Processors</h2>
              <div className="text-muted-foreground space-y-4">
                <p>We share data with:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Supabase (Database hosting) - USA</li>
                  <li>Stripe (Payment processing) - USA</li>
                  <li>Resend (Email delivery) - USA</li>
                  <li>OpenAI (AI features) - USA</li>
                  <li>OpenWeather (Weather data) - USA</li>
                  <li>LibreTranslate (Message translation) - Open source</li>
                </ul>
                <p className="mt-4">
                  All processors are GDPR-compliant and have signed Data Processing Agreements.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review 
                this Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-love-light/30 to-love-soft/30">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p>Email: privacy@lobebo.com</p>
                <p>Address: Global • Remote First</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
