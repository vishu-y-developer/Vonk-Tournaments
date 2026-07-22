'use client';

import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export const ModerationDialog: React.FC<{
  isOpen: boolean;
  title: string;
  actionName: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}> = ({ isOpen, title, actionName, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 rounded-2xl border border-card-border bg-card-bg shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-card-border pb-3">
          <h3 className="text-sm font-extrabold uppercase text-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-warning" />
            {title}
          </h3>
          <button onClick={onClose} className="p-1 text-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-[10px] uppercase font-bold text-muted">Reason for {actionName}</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide justification for moderation log..."
            className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground resize-none focus:outline-none"
            required
          />

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-card-border bg-card-bg text-xs font-bold text-muted rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white text-xs font-extrabold rounded-xl"
            >
              Confirm {actionName}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModerationDialog;
