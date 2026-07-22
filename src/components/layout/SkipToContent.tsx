'use client';

import React from 'react';

export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-secondary text-white font-black text-xs rounded-xl shadow-2xl glow-secondary outline-none ring-2 ring-white"
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;
