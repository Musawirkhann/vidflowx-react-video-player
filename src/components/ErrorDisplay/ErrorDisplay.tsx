/**
 * ErrorDisplay Component
 * Displayed when a video error occurs
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import type { ControlComponentProps } from '../../types';
import styles from './ErrorDisplay.module.css';

interface ErrorDisplayProps extends ControlComponentProps {
  error: Error;
}

export function ErrorDisplay({ error, actions }: ErrorDisplayProps) {
  const handleRetry = useCallback(() => {
    actions.play();
  }, [actions]);

  // Get user-friendly error message
  const getErrorMessage = (err: Error): string => {
    const message = err.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your connection.';
    }
    if (message.includes('decode') || message.includes('format')) {
      return 'This video format is not supported.';
    }
    if (message.includes('source') || message.includes('not found')) {
      return 'Video source not found.';
    }
    if (message.includes('aborted')) {
      return 'Video loading was interrupted.';
    }
    
    return 'An error occurred while playing the video.';
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.content}>
        <div className={styles.icon}>
          <span
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            dangerouslySetInnerHTML={{ __html: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="#ef4444"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>' }}
          />
        </div>
        <h3 className={styles.title}>Video Error</h3>
        <p className={styles.message}>{getErrorMessage(error)}</p>
        <button className={styles.retryButton} onClick={handleRetry}>
          <span
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            dangerouslySetInnerHTML={{ __html: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>' }}
          />
          Retry
        </button>
      </div>
    </motion.div>
  );
}

ErrorDisplay.displayName = 'ErrorDisplay';

export default ErrorDisplay;
