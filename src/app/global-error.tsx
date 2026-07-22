'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-4 max-w-md">
          <h2 className="text-xl font-extrabold text-danger uppercase">Global Application Failure</h2>
          <p className="text-xs text-muted">A critical root-level error occurred.</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-secondary text-white font-extrabold rounded-xl text-xs"
          >
            Reset Application
          </button>
        </div>
      </body>
    </html>
  );
}
