import { Shield, Lock, Key, Eye, Database, FileCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Security = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All your messages, photos, and personal data are encrypted end-to-end using industry-standard AES-256 encryption."
    },
    {
      icon: Key,
      title: "Secure Authentication",
      description: "Multi-factor authentication and secure OAuth providers keep your account protected from unauthorized access."
    },
    {
      icon: Database,
      title: "Data Privacy",
      description: "Your data is stored in secure, SOC 2 compliant data centers. We never sell or share your personal information."
    },
    {
      icon: Eye,
      title: "Privacy Controls",
      description: "Full control over your data with granular privacy settings and the ability to delete your account anytime."
    },
    {
      icon: Shield,
      title: "Regular Security Audits",
      description: "We conduct regular security audits and penetration testing to ensure your data remains safe."
    },
    {
      icon: FileCheck,
      title: "GDPR Compliant",
      description: "Fully compliant with GDPR, CCPA, and other international data protection regulations."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-love-light/20">
      <Header />
      <main className="container mx-auto px-6 py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-love-heart to-love-coral mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-love-deep mb-4">
            Your Security is Our Priority
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We use industry-leading security measures to protect your data and privacy. 
            Your relationship is precious, and so is your trust.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {securityFeatures.map((feature, idx) => (
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

        {/* Additional Info */}
        <Card className="bg-gradient-to-br from-love-light/30 to-love-soft/30">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-love-deep mb-4">Our Commitment to Security</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                At Love Beyond Borders, we understand that trust is the foundation of every relationship, 
                including the one you have with us. That's why we've implemented multiple layers of security 
                to protect your personal information, conversations, and memories.
              </p>
              <p>
                Our infrastructure is built on industry-leading cloud providers with SOC 2 Type II certification. 
                All data in transit is protected by TLS 1.3, and data at rest is encrypted using AES-256 encryption.
              </p>
              <p>
                We maintain a dedicated security team that monitors our systems 24/7 and responds to any 
                potential threats immediately. Additionally, we conduct regular third-party security audits 
                and penetration testing to identify and address vulnerabilities.
              </p>
              <p className="font-semibold text-love-heart">
                Questions about our security practices? Contact our security team at security@lobebo.com
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Security;
