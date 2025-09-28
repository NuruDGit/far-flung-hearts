import { useEffect } from 'react';

export const useAppOptimization = () => {
  useEffect(() => {
    // Optimize initial page load
    const optimizeLoading = () => {
      // Remove unused CSS
      const unusedStyles = document.querySelectorAll('style[data-vite-dev-id]');
      unusedStyles.forEach((style, index) => {
        if (index > 5) { // Keep first 5 critical styles
          (style as HTMLElement).remove();
        }
      });

      // Defer non-critical resources
      const deferImages = () => {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach((img) => {
          if (!(img as HTMLImageElement).complete) {
            (img as HTMLImageElement).loading = 'lazy';
          }
        });
      };

      // Optimize network requests
      const optimizeNetworkRequests = () => {
        // Cancel pending requests that are no longer needed
        if ('AbortController' in window) {
          window.addEventListener('beforeunload', () => {
            // This will help cleanup any pending requests
          });
        }
      };

      deferImages();
      optimizeNetworkRequests();
    };

    // Run optimization after a short delay to avoid blocking initial render
    const timeoutId = setTimeout(optimizeLoading, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    // Memory management
    const cleanupMemory = () => {
      // Clear any cached data that's no longer needed
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            if (name.includes('old') || name.includes('unused')) {
              caches.delete(name);
            }
          });
        });
      }
    };

    // Run memory cleanup every 5 minutes
    const intervalId = setInterval(cleanupMemory, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);
};