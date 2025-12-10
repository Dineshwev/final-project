/**
 * Memory management utilities for better mobile performance
 */

// Debounce function to prevent excessive function calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function to limit function execution frequency
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Image lazy loading utility
export const createLazyImage = (src: string, alt: string = ''): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
    img.alt = alt;
  });
};

// Memory cleanup for event listeners
export class EventListenerManager {
  private listeners: Array<{
    element: EventTarget;
    event: string;
    handler: EventListener;
    options?: boolean | AddEventListenerOptions;
  }> = [];

  add(
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(event, handler, options);
    this.listeners.push({ element, event, handler, options });
  }

  remove(element: EventTarget, event: string, handler: EventListener): void {
    element.removeEventListener(event, handler);
    this.listeners = this.listeners.filter(
      (listener) =>
        !(listener.element === element && listener.event === event && listener.handler === handler)
    );
  }

  removeAll(): void {
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];
  }
}

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void | Promise<void>): void => {
  if (typeof performance !== 'undefined') {
    performance.mark(`${name}-start`);
    
    const measure = () => {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    };

    const result = fn();
    
    if (result instanceof Promise) {
      result.finally(measure);
    } else {
      measure();
    }
  } else {
    fn();
  }
};

// Request animation frame throttling for smooth animations
export const createRAFThrottled = (callback: () => void) => {
  let rafId: number | null = null;
  
  return () => {
    if (rafId) return;
    
    rafId = requestAnimationFrame(() => {
      callback();
      rafId = null;
    });
  };
};

// Memory usage monitoring
export const getMemoryUsage = (): { used: number; total: number; percentage: number } | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const used = memory.usedJSHeapSize;
    const total = memory.jsHeapSizeLimit;
    
    return {
      used: Math.round(used / 1048576), // MB
      total: Math.round(total / 1048576), // MB
      percentage: Math.round((used / total) * 100),
    };
  }
  
  return null;
};

// Clean up unused resources
export const forceGarbageCollection = (): void => {
  if ('gc' in window) {
    (window as any).gc();
  }
};

const memoryManagement = {
  debounce,
  throttle,
  createLazyImage,
  EventListenerManager,
  measurePerformance,
  createRAFThrottled,
  getMemoryUsage,
  forceGarbageCollection,
};

export default memoryManagement;