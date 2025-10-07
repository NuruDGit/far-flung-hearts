import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X, Share } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const PWAInstallPrompt = () => {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already installed or dismissed
  if (isInstalled || dismissed || !canInstall) {
    return null;
  }

  const handleInstall = async () => {
    if (isIOS) {
      // Show iOS install instructions
      return;
    }
    
    const installed = await promptInstall();
    if (installed) {
      setDismissed(true);
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white shadow-lg border-2 border-love-coral z-50 animate-in slide-in-from-bottom duration-300">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-love-heart to-love-coral rounded-lg flex items-center justify-center">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-love-deep">Install Love Beyond Borders</h3>
              <p className="text-sm text-muted-foreground">Quick access from your home screen</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isIOS ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>To install on iOS:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>
                Tap the <Share className="inline h-4 w-4" /> share button
              </li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" to confirm</li>
            </ol>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-love-heart to-love-coral text-white hover:opacity-90"
            >
              Install App
            </Button>
            <Button
              variant="outline"
              onClick={() => setDismissed(true)}
              className="border-love-coral text-love-deep"
            >
              Not Now
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-3 text-center">
          Works offline • Fast loading • Native experience
        </p>
      </div>
    </Card>
  );
};
