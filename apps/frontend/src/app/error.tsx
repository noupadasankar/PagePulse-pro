'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl text-red-400">⚠️</span>
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Something went wrong!</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        An unexpected error occurred. Our team has been notified.
      </p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
