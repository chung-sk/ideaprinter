'use client';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
      <p className="text-gray-600 text-sm font-medium">{message}</p>
    </div>
  );
}
