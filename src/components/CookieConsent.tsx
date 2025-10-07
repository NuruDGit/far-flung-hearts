import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Delay showing banner slightly for better UX
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const handleAccept = (type: 'all' | 'necessary') => {
    localStorage.setItem('cookie_consent', type);
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    
    if (type === 'all') {
      // Enable analytics (if you add analytics later)
      console.log('Analytics cookies enabled');
    }
    
    setShow(false);
  };

  const handleClose = () => {
    // If they close without selecting, treat as "necessary only"
    handleAccept('necessary');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <Card className="max-w-4xl mx-auto p-6 shadow-2xl border-2 border-love-coral/20 bg-white/95 backdrop-blur-sm">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg text-love-deep">🍪 Cookie Consent</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 hover:bg-love-light"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          We use cookies to enhance your experience. Necessary cookies are required for the site to function 
          (authentication, sessions). Analytics cookies help us improve our service.
        </p>
        
        <div className="text-xs text-muted-foreground mb-4">
          Read our{' '}
          <Link to="/cookie-policy" className="text-love-heart hover:underline">
            Cookie Policy
          </Link>
          {' '}and{' '}
          <Link to="/privacy-policy" className="text-love-heart hover:underline">
            Privacy Policy
          </Link>
          {' '}for more details.
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleAccept('necessary')}
            className="flex-1 border-love-coral text-love-deep hover:bg-love-light"
          >
            Necessary Only
          </Button>
          <Button 
            onClick={() => handleAccept('all')}
            className="flex-1 bg-love-heart hover:bg-love-coral text-white"
          >
            Accept All Cookies
          </Button>
        </div>
      </Card>
    </div>
  );
};
