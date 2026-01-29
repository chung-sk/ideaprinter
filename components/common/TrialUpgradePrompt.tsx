'use client';

import { motion } from 'framer-motion';
import { Sparkles, Lock, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './TrialUpgradePrompt.module.css';

interface TrialUpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  ideasGenerated?: number;
}

export default function TrialUpgradePrompt({
  isOpen,
  onClose,
  ideasGenerated = 3,
}: TrialUpgradePromptProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={styles.modalContainer}>
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
        <button
          className={styles.close}
          onClick={onClose}
          aria-label="Close modal"
          type="button"
        >
          <X size={24} />
        </button>

        <div className={styles.iconContainer}>
          <motion.div
            className={styles.icon}
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles size={48} />
          </motion.div>
        </div>

        <h2 className={styles.title}>You've Used Your Free Trial! 🎉</h2>

        <p className={styles.description}>
          You've generated <strong>{ideasGenerated} ideas</strong> during your free trial.
          Want to keep the creativity flowing?
        </p>

        <div className={styles.benefits}>
          <div className={styles.benefitItem}>
            <Sparkles size={20} className={styles.benefitIcon} />
            <span>Unlimited idea generation</span>
          </div>
          <div className={styles.benefitItem}>
            <Lock size={20} className={styles.benefitIcon} />
            <span>Full history access</span>
          </div>
          <div className={styles.benefitItem}>
            <Sparkles size={20} className={styles.benefitIcon} />
            <span>Save & export all ideas</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/config" className={styles.btnPrimary} onClick={onClose}>
            <Sparkles size={20} />
            Set Up Free Account
            <ArrowRight size={20} />
          </Link>
          <p className={styles.note}>
            Just add your own Gemini API key to continue — completely free!
          </p>
        </div>

        <button className={styles.btnSecondary} onClick={onClose}>
          Maybe Later
        </button>
        </motion.div>
      </div>
    </>
  );
}
