import React, { lazy, Suspense, ComponentType, ReactElement } from 'react';

interface LazyComponentProps {
  fallback?: ReactElement;
  children: ComponentType<any>;
  props?: any;
}

/**
 * Higher-order component for lazy loading with performance optimizations
 */
const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactElement
) => {
  return (props: P) => (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <Component {...props} />
    </Suspense>
  );
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = () => {
  React.useEffect(() => {
    // Monitor Core Web Vitals
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }

    // Monitor memory usage
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      console.log('Memory usage:', {
        used: Math.round(memoryInfo.usedJSHeapSize / 1048576) + 'MB',
        total: Math.round(memoryInfo.totalJSHeapSize / 1048576) + 'MB',
        limit: Math.round(memoryInfo.jsHeapSizeLimit / 1048576) + 'MB'
      });
    }
  }, []);
};

/**
 * Intersection Observer hook for lazy content loading
 */
export const useIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  const [element, setElement] = React.useState<Element | null>(null);

  React.useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      ...options,
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element, callback, options]);

  return setElement;
};

/**
 * Debounced resize hook for performance
 */
export const useDebouncedResize = (callback: () => void, delay: number = 250) => {
  React.useEffect(() => {
    let timeoutId: number;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(callback, delay);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [callback, delay]);
};

export default withLazyLoading;