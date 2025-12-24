import { Variants } from 'framer-motion';

// Detect if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Helper to apply reduced motion settings
export const withReducedMotion = (variants: Variants): Variants => {
  if (!prefersReducedMotion()) return variants;
  
  const reduced: Variants = {};
  for (const key in variants) {
    const state = variants[key];
    if (typeof state === 'object') {
      reduced[key] = {
        ...state,
        transition: {
          duration: 0.01,
          ease: 'linear'
        }
      };
    }
  }
  return reduced;
};

// Paper feed animation variants
export const paperFeedVariants: Variants = {
  hidden: { 
    y: -200, 
    opacity: 0,
    scale: 0.95,
    transition: { 
      duration: 0.1 
    }
  },
  printing: {
    y: [-200, 0],
    opacity: 1,
    scale: 1,
    transition: {
      y: {
        duration: 2.5,
        ease: "linear",
        repeat: 0
      },
      opacity: {
        duration: 0.3
      }
    }
  },
  visible: { 
    y: 0, 
    opacity: 1,
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15 
    }
  },
  exit: { 
    y: 100, 
    opacity: 0,
    transition: { 
      duration: 0.5 
    }
  }
};

// Printer body animation variants
export const printerBodyVariants: Variants = {
  idle: {
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.5
    }
  },
  printing: {
    scale: 1,
    transition: {
      duration: 0.5
    }
  },
  complete: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 0.3
    }
  }
};

// Button animation variants
export const buttonVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: "0px 4px 0px rgba(0,0,0,0.3)",
  },
  hover: {
    scale: 1.05,
    boxShadow: "0px 6px 0px rgba(0,0,0,0.3)",
    transition: {
      duration: 0.2
    }
  },
  pressed: {
    scale: 0.95,
    boxShadow: "0px 1px 0px rgba(0,0,0,0.3)",
    y: 3,
    transition: {
      duration: 0.1
    }
  },
  disabled: {
    opacity: 0.6,
    scale: 1,
    boxShadow: "none",
    cursor: "not-allowed"
  }
};

// Typewriter text effect variants
export const typewriterVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.01
    }
  }
};

export const typewriterCharVariants: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.05
    }
  }
};

// Reduced motion support helper
export const reducedMotionTransition = {
  type: "tween",
  ease: "linear",
  duration: 0.01
};
