/**
 * LoadingIndicator Component
 * Displayed when video is loading or buffering
 */

import { motion } from 'framer-motion';
import type { ControlComponentProps } from '../../types';
import styles from './LoadingIndicator.module.css';

export function LoadingIndicator(_props: ControlComponentProps) {
  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.spinner}>
        <svg viewBox="0 0 50 50" className={styles.spinnerSvg}>
          <circle
            className={styles.spinnerPath}
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
          />
        </svg>
      </div>
    </motion.div>
  );
}

LoadingIndicator.displayName = 'LoadingIndicator';

export default LoadingIndicator;
