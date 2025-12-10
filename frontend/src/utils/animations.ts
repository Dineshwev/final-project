/**
 * Animation Utilities - GSAP & Framer Motion
 * Professional animation configurations for consistent UX
 */

import { Variants } from "framer-motion";
import gsap from "gsap";

// ==================== FRAMER MOTION VARIANTS ====================

/**
 * Page transition animations
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Fade in animation
 */
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/**
 * Slide up animation
 */
export const slideUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/**
 * Scale in animation
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

/**
 * Stagger children animation
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Stagger item animation
 */
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/**
 * Card hover animation
 */
export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number], // easeOut cubic-bezier
    },
  },
};

/**
 * Button press animation
 */
export const buttonTap = {
  scale: 0.95,
  transition: {
    duration: 0.1,
    ease: [0.4, 0, 0.6, 1] as [number, number, number, number], // easeInOut cubic-bezier
  },
};

/**
 * Slide from left
 */
export const slideFromLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/**
 * Slide from right
 */
export const slideFromRight: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/**
 * Rotate in animation
 */
export const rotateIn: Variants = {
  hidden: {
    opacity: 0,
    rotate: -10,
  },
  visible: {
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

/**
 * List item animation
 */
export const listItem: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
    },
  },
};

// ==================== GSAP ANIMATIONS ====================

/**
 * Animate element entrance with GSAP
 */
export const gsapFadeIn = (element: any, delay: number = 0) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 30,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay,
      ease: "power2.out",
    }
  );
};

/**
 * Animate counter with GSAP
 */
export const gsapCountUp = (
  element: any,
  start: number,
  end: number,
  duration: number = 2
) => {
  gsap.fromTo(
    element,
    { innerText: start },
    {
      innerText: end,
      duration,
      ease: "power1.out",
      snap: { innerText: 1 },
      onUpdate: function () {
        element.innerText = Math.ceil(element.innerText);
      },
    }
  );
};

/**
 * Stagger animation with GSAP
 */
export const gsapStagger = (elements: any, delay: number = 0) => {
  gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: 30,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      delay,
      ease: "power2.out",
    }
  );
};

/**
 * Scale in animation with GSAP
 */
export const gsapScaleIn = (element: any, delay: number = 0) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      scale: 0.8,
    },
    {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      delay,
      ease: "back.out(1.4)",
    }
  );
};

/**
 * Slide from left with GSAP
 */
export const gsapSlideFromLeft = (element: any, delay: number = 0) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      x: -100,
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.8,
      delay,
      ease: "power3.out",
    }
  );
};

/**
 * Slide from right with GSAP
 */
export const gsapSlideFromRight = (element: any, delay: number = 0) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      x: 100,
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.8,
      delay,
      ease: "power3.out",
    }
  );
};

/**
 * Rotate and scale in with GSAP
 */
export const gsapRotateIn = (element: any, delay: number = 0) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      scale: 0.5,
      rotation: -15,
    },
    {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.8,
      delay,
      ease: "back.out(1.7)",
    }
  );
};

/**
 * Parallax scroll effect with GSAP
 */
export const gsapParallax = (element: any, speed: number = 0.5) => {
  gsap.to(element, {
    y: () => window.scrollY * speed,
    ease: "none",
  });
};

/**
 * Text reveal animation with GSAP
 */
export const gsapTextReveal = (element: any, delay: number = 0) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      yPercent: 100,
    },
    {
      opacity: 1,
      yPercent: 0,
      duration: 0.8,
      delay,
      ease: "power3.out",
    }
  );
};

/**
 * Bounce animation with GSAP
 */
export const gsapBounce = (element: any) => {
  gsap.fromTo(
    element,
    {
      y: 0,
    },
    {
      y: -20,
      duration: 0.6,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    }
  );
};

/**
 * Pulse animation with GSAP
 */
export const gsapPulse = (element: any) => {
  gsap.fromTo(
    element,
    {
      scale: 1,
    },
    {
      scale: 1.1,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    }
  );
};

/**
 * Morphing background animation
 */
export const gsapMorphBackground = (element: any) => {
  gsap.to(element, {
    backgroundPosition: "200% center",
    duration: 20,
    repeat: -1,
    ease: "linear",
  });
};

// ==================== EASING FUNCTIONS ====================

/**
 * Custom easing curves
 */
export const easings = {
  easeInOut: [0.4, 0.0, 0.2, 1],
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  sharp: [0.4, 0.0, 0.6, 1],
  smooth: [0.25, 0.1, 0.25, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
};

// ==================== SPRING PRESETS ====================

/**
 * Spring animation configurations
 */
export const springs = {
  gentle: {
    type: "spring",
    stiffness: 120,
    damping: 14,
  },
  wobbly: {
    type: "spring",
    stiffness: 180,
    damping: 12,
  },
  stiff: {
    type: "spring",
    stiffness: 260,
    damping: 20,
  },
  slow: {
    type: "spring",
    stiffness: 80,
    damping: 10,
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Create delay for sequential animations
 */
export const createDelay = (index: number, baseDelay: number = 0.1) => {
  return index * baseDelay;
};

/**
 * Check if element is in viewport
 */
export const isInViewport = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Scroll to element smoothly
 */
export const scrollToElement = (element: HTMLElement, offset: number = 0) => {
  const elementPosition =
    element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
};

const animations = {
  // Framer Motion
  pageVariants,
  fadeIn,
  slideUp,
  scaleIn,
  staggerContainer,
  staggerItem,
  cardHover,
  buttonTap,
  slideFromLeft,
  slideFromRight,
  rotateIn,
  listItem,
  // GSAP
  gsapFadeIn,
  gsapCountUp,
  gsapStagger,
  gsapScaleIn,
  gsapSlideFromLeft,
  gsapSlideFromRight,
  gsapRotateIn,
  gsapParallax,
  gsapTextReveal,
  gsapBounce,
  gsapPulse,
  gsapMorphBackground,
  // Configs
  easings,
  springs,
  // Helpers
  createDelay,
  isInViewport,
  scrollToElement,
};

export default animations;
