'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedIdea } from '@/lib/types/idea';
import IdeaPrintout from './IdeaPrintout';
import { paperFeedVariants } from './animations';

interface PaperOutputProps {
  idea: GeneratedIdea | null;
  isPrinting: boolean;
  reducedMotion?: boolean;
  isMobile?: boolean;
}

export default function PaperOutput({ idea, isPrinting, reducedMotion = false, isMobile = false }: PaperOutputProps) {
  // Simplify animations for mobile or reduced motion
  const shouldAnimate = !reducedMotion && !isMobile;
  
  return (
    <div className="relative w-full max-w-2xl mx-auto overflow-hidden min-h-[100px] flex justify-center">
      {/* Paper Slot Shadow/Overlay */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/20 to-transparent z-10 pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {idea && (
          <motion.div
            key={idea.uniqueId}
            variants={shouldAnimate ? paperFeedVariants : undefined}
            initial={shouldAnimate ? "hidden" : undefined}
            animate={shouldAnimate ? (isPrinting ? "printing" : "visible") : undefined}
            exit={shouldAnimate ? "exit" : undefined}
            transition={reducedMotion ? { duration: 0.01 } : undefined}
            className="w-full z-0 origin-top"
          >
            <div className="relative bg-[#fdfbf7] shadow-lg mx-auto transform-gpu">
              {/* Perforated Edge Top */}
              <div className="absolute -top-2 left-0 right-0 h-4 bg-[radial-gradient(circle,transparent_2px,#fdfbf7_2px)] bg-[length:10px_10px] bg-repeat-x" />
              
              <IdeaPrintout idea={idea} reducedMotion={reducedMotion} />
              
              {/* Perforated Edge Bottom */}
              <div className="absolute -bottom-2 left-0 right-0 h-4 bg-[radial-gradient(circle,transparent_2px,#fdfbf7_2px)] bg-[length:10px_10px] bg-repeat-x" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
