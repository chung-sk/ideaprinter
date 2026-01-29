'use client';

import { motion } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { useState } from 'react';
import styles from './TrialProgressBanner.module.css';

interface TrialProgressBannerProps {
  ideasGenerated: number;
  remainingIdeas: number;
  onDismiss?: () => void;
}

export default function TrialProgressBanner({
  ideasGenerated,
  remainingIdeas,
  onDismiss,
}: TrialProgressBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || remainingIdeas === 3) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const percentage = ((3 - remainingIdeas) / 3) * 100;
  const isLow = remainingIdeas <= 1;

  return (
    <motion.div
      className={`${styles.banner} ${isLow ? styles.bannerLow : ''}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className={styles.content}>
        <Zap size={20} className={`${styles.icon} ${isLow ? styles.iconLow : ''}`} />
        <div className={styles.info}>
          <div className={styles.text}>
            <strong>{remainingIdeas}</strong> free {remainingIdeas === 1 ? 'idea' : 'ideas'} remaining
          </div>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
        <button
          className={styles.dismissBtn}
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          type="button"
        >
          <X size={18} />
        </button>
      </div>
    </motion.div>
  );
}
