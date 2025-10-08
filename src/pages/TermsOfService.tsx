import { FileText, AlertCircle, Scale, UserCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-love-light/20">
      <Header />
      <main className="container mx-auto px-6 py-24 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-love-heart to-love-coral mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-love-deep mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>

        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            By accessing or using Love Beyond Borders, you agree to be bound by these Terms of Service. 
            If you disagree with any part of the terms, you may not access the service.
          </AlertDescription>
        </Alert>

        {/* Terms Sections */}
        <div className="space-y-8">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <UserCheck className="w-6 h-6 text-love-heart mt-1" />
                <h2 className="text-2xl font-bold text-love-deep">1. Acceptance of Terms</h2>
              </div>
              <div className="text-muted-foreground space-y-4 ml-10">
                <p>
                  By creating an account and using Love Beyond Borders, you acknowledge that you have read, 
                  understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                </p>
                <p>
                  You must be at least 18 years old to use this service. By agreeing to these Terms, you 
                  represent and warrant that you are at least 18 years of age.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">2. Account Responsibilities</h2>
              <div className="text-muted-foreground space-y-4">
                <p>You are responsible for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Ensuring the accuracy of information you provide</li>
                  <li>Complying with all applicable laws and regulations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">3. Acceptable Use</h2>
              <div className="text-muted-foreground space-y-4">
                <p>You agree NOT to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the service for any illegal purposes</li>
                  <li>Harass, abuse, or harm another person</li>
                  <li>Upload or transmit viruses or malicious code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Impersonate any person or entity</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Scrape or data mine without permission</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">4. Subscription and Payments</h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Love Beyond Borders offers both free and paid subscription tiers. Paid subscriptions are 
                  billed in advance on a monthly or annual basis.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All fees are non-refundable except as required by law</li>
                  <li>You can cancel your subscription at any time</li>
                  <li>Cancellations take effect at the end of the current billing period</li>
                  <li>We may change pricing with 30 days notice</li>
                  <li>Payment processing is handled securely by Stripe</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">5. Intellectual Property</h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  The service and its original content, features, and functionality are owned by Love Beyond 
                  Borders and are protected by international copyright, trademark, and other intellectual 
                  property laws.
                </p>
                <p>
                  You retain all rights to content you create and share. By using the service, you grant us 
                  a license to use, store, and display your content solely for the purpose of providing the service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">6. Content Guidelines</h2>
              <div className="text-muted-foreground space-y-4">
                <p>All content shared must:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Be legal and not violate any third-party rights</li>
                  <li>Not contain hate speech or discriminatory content</li>
                  <li>Not include explicit adult content beyond what's intended for your partner</li>
                  <li>Not promote violence or illegal activities</li>
                  <li>Respect others' privacy and confidentiality</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <Scale className="w-6 h-6 text-love-heart mt-1" />
                <h2 className="text-2xl font-bold text-love-deep">7. Limitation of Liability</h2>
              </div>
              <div className="text-muted-foreground space-y-4 ml-10">
                <p>
                  Love Beyond Borders is provided "as is" without warranties of any kind. We do not guarantee 
                  that the service will be uninterrupted or error-free.
                </p>
                <p>
                  To the maximum extent permitted by law, Love Beyond Borders shall not be liable for any 
                  indirect, incidental, special, consequential, or punitive damages resulting from your use 
                  or inability to use the service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">8. Termination</h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  We may terminate or suspend your account immediately, without prior notice or liability, 
                  for any reason, including if you breach these Terms.
                </p>
                <p>
                  Upon termination, your right to use the service will immediately cease. You may delete 
                  your account at any time through your account settings.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">9. Changes to Terms</h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of any 
                  material changes via email or through the service.
                </p>
                <p>
                  Your continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">10. Governing Law & Jurisdiction</h2>
              <div className="text-muted-foreground space-y-4">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>US Users: Governed by laws of Delaware, USA</li>
                  <li>EU Users: Governed by EU consumer protection laws</li>
                  <li>Dispute Resolution: Mandatory arbitration (location to be determined based on user jurisdiction)</li>
                  <li>Class Action Waiver: Users waive right to class action lawsuits</li>
                  <li>Small Claims Court: Users may pursue claims in small claims court</li>
                </ul>
                <p className="mt-4">
                  These Terms shall be governed by and construed in accordance with applicable laws, 
                  without regard to conflict of law provisions.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">11. Age Verification & COPPA Compliance</h2>
              <div className="text-muted-foreground space-y-4">
                <p className="font-semibold">
                  This service is strictly for users 18 years and older. We do not knowingly collect data from minors under 18.
                </p>
                <p>If you believe a minor has created an account:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email: legal@lobebo.com</li>
                  <li>We will investigate and delete within 24 hours</li>
                  <li>Parents/guardians can request data deletion</li>
                </ul>
                <p className="mt-4 font-medium">
                  COPPA Compliance Statement: We comply with the Children's Online Privacy Protection Act.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">12. AI-Generated Content Disclaimer</h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Our AI Love Advisor feature provides suggestions based on algorithms, not professional therapy.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
                  <p className="font-semibold text-amber-900 mb-2">IMPORTANT:</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-800">
                    <li>AI advice is not a substitute for professional counseling</li>
                    <li>Do not rely solely on AI for serious relationship decisions</li>
                    <li>We are not liable for actions taken based on AI suggestions</li>
                    <li>For mental health emergencies, contact local services</li>
                  </ul>
                </div>
                <p className="text-sm">
                  If you need professional help, we recommend seeking licensed relationship counselors or therapists.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-love-light/30 to-love-soft/30">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-love-deep mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p>Email: legal@lobebo.com</p>
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

export default TermsOfService;
