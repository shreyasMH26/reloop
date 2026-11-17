import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      return;
    }

    // Check if user dismissed previously in this session
    const isDismissed = sessionStorage.getItem('reloop_pwa_dismissed');
    if (isDismissed) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('reloop_pwa_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-slide-up">
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-cream-300 shadow-modal flex items-start gap-3 relative">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-sage-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Smartphone className="w-5 h-5" />
        </div>

        <div className="flex-1 pr-4">
          <div className="flex items-center gap-1.5 text-sage-700 text-xs font-bold uppercase tracking-wider mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Install ReLoop App</span>
          </div>
          <p className="text-xs font-bold text-charcoal-900 leading-snug">
            Add ReLoop to your home screen for quick campus trading and offline access.
          </p>

          <div className="flex items-center gap-2 mt-2.5">
            <Button
              variant="primary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleInstallClick}
              className="px-3 py-1.5 text-xs shadow-xs"
            >
              Install App
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="px-2.5 py-1.5 text-xs text-charcoal-500 hover:text-charcoal-800"
            >
              Not Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
