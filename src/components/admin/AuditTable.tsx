'use client';

import React from 'react';
import { AdminAuditLog } from '@/types';

export const AuditTable: React.FC<{ logs: AdminAuditLog[] }> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted border border-dashed border-card-border rounded-xl">
        No admin audit logs recorded.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-card-border rounded-xl bg-card-bg/15">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-card-border bg-card-bg/30 text-[9px] uppercase font-black text-muted tracking-wider">
            <th className="p-3">Timestamp</th>
            <th className="p-3">Admin</th>
            <th className="p-3">Entity</th>
            <th className="p-3">Action</th>
            <th className="p-3">Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-card-border hover:bg-card-bg/20 transition-colors">
              <td className="p-3 font-mono text-[10px] text-muted whitespace-nowrap">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="p-3 font-extrabold text-foreground">{log.adminName}</td>
              <td className="p-3">
                <span className="px-2 py-0.5 rounded border border-card-border text-[9px] font-extrabold text-secondary bg-secondary/10">
                  {log.entityType}
                </span>
              </td>
              <td className="p-3 font-bold text-foreground">{log.action}</td>
              <td className="p-3 text-muted text-[11px] max-w-xs truncate">{log.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTable;
