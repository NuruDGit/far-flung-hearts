import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register/cleanup Service Worker
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registered successfully:', registration.scope);
        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 3600000);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
} else if ('serviceWorker' in navigator) {
  // Development: ensure no stale service workers or caches interfere with Vite HMR
  window.addEventListener('load', async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      console.log('🧹 Dev cleanup: unregistered service workers and cleared caches');
    } catch (err) {
      console.warn('Dev SW cleanup failed:', err);
    }
  });
}

// Handle PWA install prompt
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  console.log('💾 PWA install prompt ready');
  
  // Optionally, you can show your own install button here
  // and trigger the prompt when the user clicks it
});

window.addEventListener('appinstalled', () => {
  console.log('✅ PWA installed successfully');
  deferredPrompt = null;
});

// Make install prompt available globally for custom install button
(window as any).showInstallPrompt = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      deferredPrompt = null;
    });
  }
};

createRoot(document.getElementById("root")!).render(<App />);
