'use client';

import { motion } from 'framer-motion';
import { buttonVariants } from './animations';

interface PrintButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function PrintButton({ onClick, disabled, isLoading }: PrintButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isLoading}
      variants={buttonVariants}
      initial="idle"
      whileHover={!disabled && !isLoading ? "hover" : undefined}
      whileTap={!disabled && !isLoading ? "pressed" : undefined}
      animate={disabled || isLoading ? "disabled" : "idle"}
      className="
        px-8 py-4 
        bg-[#e65100] 
        text-white font-bold text-lg rounded-lg
        border-b-4 border-[#bf360c]
        uppercase tracking-wide font-mono
        flex items-center justify-center
        min-w-[200px]
      "
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>PRINTING...</span>
        </span>
      ) : (
        <span>PRINT IDEA</span>
      )}
    </motion.button>
  );
}
