import { Heart, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
const Footer = () => {
  return <footer className="bg-gradient-to-b from-love-deep to-love-heart text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex flex-col items-center lg:items-start mb-6">
              <div className="rounded-full p-2 mb-3 bg-white/10 backdrop-blur-sm">
                <img src="/logo.png" alt="Love Beyond Borders Logo" className="w-16 h-16 object-contain" />
              </div>
              <div className="text-center lg:text-left">
                <span className="text-2xl font-bold">Love Beyond Borders</span>
              </div>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              Connecting hearts across continents. Making long-distance relationships stronger, one day at a time.
            </p>
            <div className="flex gap-4">
              
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-3 text-white/80">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/security" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-3 text-white/80">
              <li><a href="/help-center" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/community" className="hover:text-white transition-colors">Community</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <div className="space-y-3 text-white/80">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>hello@lobebo.com</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Global • Remote First</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/80 text-sm">
              © 2024 Love Beyond Borders. Made with ❤️ for couples worldwide.
            </p>
            <div className="flex gap-6 text-sm text-white/80">
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;