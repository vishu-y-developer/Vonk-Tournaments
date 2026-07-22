'use client';

import React from 'react';

export const AdminSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-8 w-48 bg-card-bg/40 rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="h-24 bg-card-bg/30 rounded-xl"></div>
        <div className="h-24 bg-card-bg/30 rounded-xl"></div>
        <div className="h-24 bg-card-bg/30 rounded-xl"></div>
        <div className="h-24 bg-card-bg/30 rounded-xl"></div>
      </div>
      <div className="h-64 bg-card-bg/20 rounded-2xl"></div>
    </div>
  );
};

export default AdminSkeleton;
