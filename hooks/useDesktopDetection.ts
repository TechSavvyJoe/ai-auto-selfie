import { useState, useEffect } from 'react';

export const useDesktopDetection = (): boolean => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const detectDesktop = () => {
      // Check viewport width
      const isWideScreen = window.innerWidth >= 1024;

      // Check user agent for desktop indicators
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTablet = /ipad|android(?!.*mobile)|xoom|kindfire|silk|playbook|nexus 7|nexus 10|windows phone/i.test(userAgent);

      // Consider it desktop if:
      // - Wide screen AND not mobile user agent
      // - OR has pointer precision (mouse)
      const hasPointerPrecision = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

      const desktop = isWideScreen && !isMobileUserAgent && !isTablet && hasPointerPrecision;
      setIsDesktop(desktop);
    };

    detectDesktop();

    // Re-check on resize
    window.addEventListener('resize', detectDesktop);
    return () => window.removeEventListener('resize', detectDesktop);
  }, []);

  return isDesktop;
};
