'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e0dcd5] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong!
        </h1>

        <p className="text-gray-600 mb-6">
          We apologize for the inconvenience. The printer encountered an unexpected error.
        </p>

        {error.message && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs font-mono text-gray-700 break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={reset}
            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => (window.location.href = '/')}
            className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:border-red-400 hover:text-red-600 transition-colors"
          >
            Go Home
          </motion.button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          If this problem persists, please contact support.
        </p>
      </motion.div>
    </div>
  );
}
