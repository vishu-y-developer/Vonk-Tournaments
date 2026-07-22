'use client';

import React from 'react';

export const UserStatusBadge: React.FC<{ status?: string }> = ({ status = 'ACTIVE' }) => {
  const getStyle = () => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'ONLINE':
      case 'TOURNAMENT READY':
        return 'bg-success/15 border-success/30 text-success';
      case 'SUSPENDED':
      case 'LOCKED':
      case 'REVIEWING':
        return 'bg-warning/15 border-warning/30 text-warning';
      case 'BANNED':
      case 'REJECTED':
      case 'CLOSED':
        return 'bg-danger/15 border-danger/30 text-danger';
      default:
        return 'bg-muted/15 border-card-border text-muted';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-extrabold uppercase tracking-wider ${getStyle()}`}>
      {status}
    </span>
  );
};

export default UserStatusBadge;
