'use client';

import React from 'react';
import { PlatformReport, ReportStatus } from '@/types';
import UserStatusBadge from './UserStatusBadge';

export const ReportCard: React.FC<{
  report: PlatformReport;
  onResolve: (id: string, status: ReportStatus, notes: string) => void;
}> = ({ report, onResolve }) => {
  const handleTakeAction = () => {
    const status = prompt('Select status:\nREVIEWING | ACTION_TAKEN | CLOSED', 'ACTION_TAKEN') as ReportStatus;
    if (status) {
      const notes = prompt('Enter resolution notes:', 'Action applied by platform moderation.') || '';
      onResolve(report.id, status, notes);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-card-border bg-card-bg/20 flex flex-col gap-3 hover:border-card-hover-border transition-all">
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col">
          <span className="font-extrabold text-foreground text-xs">{report.reason.replace('_', ' ')}</span>
          <span className="text-[10px] text-muted">
            Reported by: <strong>{report.reportedByName}</strong> | Target: <strong>{report.targetName}</strong> ({report.targetType})
          </span>
        </div>
        <UserStatusBadge status={report.status} />
      </div>

      <p className="text-xs text-muted italic bg-card-bg/40 p-2.5 rounded-lg border border-card-border">
        &quot;{report.description}&quot;
      </p>

      {report.resolutionNotes && (
        <div className="text-[10px] text-success font-semibold">
          Resolution Notes: {report.resolutionNotes}
        </div>
      )}

      {report.status !== 'CLOSED' && report.status !== 'ACTION_TAKEN' && (
        <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
          <button
            onClick={handleTakeAction}
            className="px-3 py-1.5 bg-secondary hover:bg-secondary/90 text-white font-extrabold rounded-lg text-xs transition-colors"
          >
            Moderate Report
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportCard;
