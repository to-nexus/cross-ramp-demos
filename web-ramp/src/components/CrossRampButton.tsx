'use client';

import { useLanguage } from '../contexts/LanguageContext';
import { useCrossRampStore } from '../stores/useCrossRampStore';

interface CrossRampButtonProps {
  projectId: string;
  accessToken: string;
  sessionId: string;
  appScheme?: string; // App scheme for deep linking back to mobile app
}

export function CrossRampButton({ 
  projectId, 
  accessToken,
  sessionId,
  appScheme
}: CrossRampButtonProps) {
  const { language, t } = useLanguage();
  const setCrossRampOpen = useCrossRampStore((state) => state.setOpen);

  // TODO: This is a temporary solution to get the ramp URL for public demo project.
  // This code block(generateRampUrl) is different from the one in original cross-ramp repo
  // Direct URL method with query parameters
  const generateRampUrl = (isTestnet: boolean = false): string => {
    const rampHost = process.env.NEXT_PUBLIC_RAMP_HOST || 'ramp.crosstoken.io';
    const rampBaseUrl = isTestnet ? `https://stg-${rampHost}` : `https://${rampHost}`;
    
    const catalogUrlObj = new URL('/catalog', rampBaseUrl);
    const params = new URLSearchParams({
      projectId,
      sessionId,
      accessToken,
      lang: language,
      platform: 'web',
      timestamp: Math.floor(Date.now() / 1000).toString()
    });
    
    // Add app scheme if provided (for deep linking back to mobile app)
    if (appScheme) {
      params.set('appScheme', appScheme);
    }
    
    catalogUrlObj.search = params.toString();
    return catalogUrlObj.toString();
  };

  const openCrossRamp = async () => {
    const popupName = 'cross-ramp-catalog';
    
    // Generate ramp URL with all user data in query parameters
    const catalogUrl = generateRampUrl();
    
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768;
    
    // Detect if running in app (WebView)
    const isInApp = typeof window !== 'undefined' && (
      window.navigator.userAgent.includes('wv') ||
      window.navigator.userAgent.includes('WebView') ||
      (window as any).ReactNativeWebView ||
      window.navigator.userAgent.includes('Instagram') ||
      window.navigator.userAgent.includes('FBAN') ||
      window.navigator.userAgent.includes('FBAV')
    );
    
    if (isMobile) {
      if (isInApp) {
        // In-app browser: open in same tab
        window.location.href = catalogUrl;
      } else {
        // Mobile browser: open in new tab
        window.open(catalogUrl, '_blank');
      }
    } else {
      // Desktop: open popup with appropriate size
      const width = Math.min(1000, window.screen.availWidth * 0.8);
      const height = Math.min(800, window.screen.availHeight * 0.8);
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const popup = window.open(
        catalogUrl,
        popupName,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes,location=no,toolbar=no,menubar=no`
      );

      // Check if popup was blocked (only for desktop)
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        alert(t('popup.blocked'));
        return;
      }

      // Focus popup
      popup.focus();

      // Check if popup is closed
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          setCrossRampOpen(false);
          clearInterval(checkClosed);
        }
      }, 1000);
    }
    
    // Set cross ramp as open
    setCrossRampOpen(true);
  };

  return (
    <button
      onClick={openCrossRamp}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-1 px-2 sm:py-2 sm:px-3 md:px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-sm md:text-base"
      title="CROSS RAMP - Game Asset Exchange"
    >
      CROSS RAMP
    </button>
  );
} 