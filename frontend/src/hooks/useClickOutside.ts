import { useEffect, RefObject } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

/**
 * Hook that handles click/touch events outside of a referenced element
 * @param ref React ref object pointing to the element to monitor
 * @param handler Callback function to execute when click outside is detected
 * @param ignoredRefs Optional array of refs to ignore (e.g., trigger buttons)
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: Handler,
  options: { ignoreRefs: RefObject<HTMLElement | null>[] } = { ignoreRefs: [] }
) {
  const ignoredRefs = options.ignoreRefs;
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const el = ref.current;
      
      // Return if click was inside the referenced element
      if (!el || el.contains(target)) {
        return;
      }
      
      // Return if click was inside any of the ignored elements
      if (ignoredRefs.some(ignoredRef => 
        ignoredRef.current && ignoredRef.current.contains(target)
      )) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, ignoredRefs]);
}

export default useClickOutside;