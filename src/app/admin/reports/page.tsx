'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { useAdmin } from '@/providers/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';
import ReportCard from '@/components/admin/ReportCard';
import { Flag, Plus } from 'lucide-react';
import { ReportReason, ReportTargetType } from '@/types';

export default function AdminReportsPage() {
  const { reports, resolveReport, createReport } = useAdmin();
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [showCreate, setShowCreate] = useState(false);
  const [targetType, setTargetType] = useState<ReportTargetType>('PLAYER');
  const [targetId, setTargetId] = useState('player-jonathan');
  const [targetName, setTargetName] = useState('GodL Jonathan');
  const [reason, setReason] = useState<ReportReason>('CHEATING');
  const [desc, setDesc] = useState('');

  const filteredReports = useMemo(() => {
    return reports.filter((r) => filterStatus === 'ALL' || r.status === filterStatus);
  }, [reports, filterStatus]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc) return;
    createReport('player-user', 'Apex Player', targetType, targetId, targetName, reason, desc);
    alert('Demo report created!');
    setDesc('');
    setShowCreate(false);
  };

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
              <Flag className="h-6 w-6 text-danger" />
              Community & Player Reports Moderation
            </h1>
            <p className="text-xs text-muted">
              Audit reports of cheating, toxic behavior, wrong game IDs, and fake registrations.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1 px-3.5 py-2 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs"
          >
            <Plus className="h-4 w-4" />
            File Test Report
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="p-4 rounded-xl border border-card-border bg-card-bg/20 flex flex-col gap-3">
            <h4 className="text-xs uppercase font-extrabold text-foreground">File New Demo Report</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-muted uppercase">Target Type</label>
                <select
                  value={targetType}
                  onChange={(e: any) => setTargetType(e.target.value)}
                  className="p-2.5 bg-card-bg/60 border border-card-border rounded-lg text-xs"
                >
                  <option value="PLAYER">PLAYER</option>
                  <option value="TEAM">TEAM</option>
                  <option value="TOURNAMENT">TOURNAMENT</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-muted uppercase">Target Name</label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="p-2.5 bg-card-bg/60 border border-card-border rounded-lg text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-muted uppercase">Reason Category</label>
                <select
                  value={reason}
                  onChange={(e: any) => setReason(e.target.value)}
                  className="p-2.5 bg-card-bg/60 border border-card-border rounded-lg text-xs"
                >
                  <option value="CHEATING">CHEATING</option>
                  <option value="TOXIC_BEHAVIOR">TOXIC BEHAVIOR</option>
                  <option value="WRONG_IGN">WRONG IGN</option>
                  <option value="TEAM_ABUSE">TEAM ABUSE</option>
                  <option value="FAKE_REGISTRATION">FAKE REGISTRATION</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-muted uppercase">Report Description</label>
              <textarea
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Detail the alleged violation..."
                className="p-2.5 bg-card-bg/60 border border-card-border rounded-lg text-xs resize-none"
                required
              />
            </div>

            <button type="submit" className="py-2 bg-danger text-white text-xs font-bold rounded-lg self-end px-4">
              Submit Report
            </button>
          </form>
        )}

        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-card-bg/50 border border-card-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="REVIEWING">Reviewing</option>
            <option value="ACTION_TAKEN">Action Taken</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((rep) => (
            <ReportCard key={rep.id} report={rep} onResolve={resolveReport} />
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
