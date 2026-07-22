'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const AdminEmptyState: React.FC<{ title: string; message: string }> = ({ title, message }) => {
  return (
    <div className="p-16 rounded-2xl border border-dashed border-card-border bg-card-bg/10 text-center flex flex-col items-center justify-center gap-3">
      <ShieldAlert className="h-10 w-10 text-muted/30" />
      <h3 className="text-sm font-extrabold text-foreground uppercase">{title}</h3>
      <p className="text-xs text-muted max-w-xs leading-relaxed">{message}</p>
    </div>
  );
};

export default AdminEmptyState;
