'use client';

import Link from 'next/link';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  // Check if message mentions Settings/API key
  const showSettingsLink = message.includes('Settings') || message.includes('API key');
  
  // Check if it's a quota/rate limit error
  const isQuotaError = message.includes('quota') || message.includes('limit reached');

  return (
    <div className={`border px-6 py-4 rounded-lg shadow-md ${
      isQuotaError
        ? 'bg-yellow-50 border-yellow-400'
        : 'bg-red-50 border-red-400'
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isQuotaError ? (
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <div className={`text-sm whitespace-pre-line leading-relaxed ${
            isQuotaError ? 'text-yellow-900' : 'text-red-900'
          }`}>
            {message.split('\n').map((line, i) => (
              <p key={i} className={i > 0 ? 'mt-2' : ''}>
                {line}
              </p>
            ))}
          </div>
          <div className="mt-4 flex gap-3 flex-wrap">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`text-sm font-semibold underline ${
                  isQuotaError
                    ? 'text-yellow-700 hover:text-yellow-900'
                    : 'text-red-700 hover:text-red-900'
                }`}
              >
                Try Again
              </button>
            )}
            {showSettingsLink && (
              <Link
                href="/config"
                className={`text-sm font-semibold underline ${
                  isQuotaError
                    ? 'text-yellow-700 hover:text-yellow-900'
                    : 'text-red-700 hover:text-red-900'
                }`}
              >
                Go to Settings →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
