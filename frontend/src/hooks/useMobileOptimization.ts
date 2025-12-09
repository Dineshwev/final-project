import { useState, useEffect } from 'react';

export const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const mobileCheck = window.innerWidth <= 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobileCheck);
    };

    // Detect low performance devices
    const checkPerformance = () => {
      // Check for hardware concurrency (number of CPU cores)
      const cores = navigator.hardwareConcurrency || 1;
      
      // Check memory if available
      const memory = (navigator as any).deviceMemory || 4;
      
      // Check connection if available
      const connection = (navigator as any).connection;
      const slowConnection = connection && 
        (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g');
      
      // Consider low performance if:
      // - Less than 4 CPU cores
      // - Less than 4GB memory
      // - Slow connection
      // - Mobile device (conservative approach)
      const lowPerf = cores < 4 || memory < 4 || slowConnection || isMobile;
      setIsLowPerformance(lowPerf);
    };

    // Check reduced motion preference
    const checkReducedMotion = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      // Listen for changes
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    };

    checkMobile();
    checkPerformance();
    const cleanupReducedMotion = checkReducedMotion();

    // Listen for resize events
    const handleResize = () => {
      checkMobile();
      checkPerformance();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (cleanupReducedMotion) cleanupReducedMotion();
    };
  }, [isMobile]);

  // Performance optimization settings
  const shouldReduceAnimations = isMobile || isLowPerformance || prefersReducedMotion;
  const shouldDisableParallax = shouldReduceAnimations;
  const shouldReduceBackgroundEffects = shouldReduceAnimations;
  const animationDuration = shouldReduceAnimations ? 0.1 : 0.3;

  return {
    isMobile,
    isLowPerformance,
    prefersReducedMotion,
    shouldReduceAnimations,
    shouldDisableParallax,
    shouldReduceBackgroundEffects,
    animationDuration,
  };
};