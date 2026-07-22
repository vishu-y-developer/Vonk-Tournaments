'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupport } from '@/providers/SupportProvider';
import DemoSupportNotice from '@/components/support/DemoSupportNotice';
import { Flag, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { IssueType, IssueSeverity } from '@/types';

export default function ReportProblemPage() {
  const router = useRouter();
  const { createIssueReport } = useSupport();

  const [issueType, setIssueType] = useState<IssueType>('Broken Page');
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<IssueSeverity>('MEDIUM');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Please fill out title and description.');
      return;
    }

    createIssueReport(issueType, title, description, severity, { stepsToReproduce: steps });
    alert('Problem report logged successfully to local storage demo queue!');
    router.push('/support');
  };

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto">
      <DemoSupportNotice />

      <Link href="/support" className="flex items-center gap-1 text-xs text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Support Hub
      </Link>

      <div>
        <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
          <Flag className="h-6 w-6 text-danger" />
          Report a Problem
        </h1>
        <p className="text-xs text-muted">
          Report technical glitches, incorrect tournament stats, or misconduct for local demo inspection.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-muted uppercase">Issue Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Leaderboard table overlapping on mobile view"
            className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase">Issue Category</label>
            <select
              value={issueType}
              onChange={(e: any) => setIssueType(e.target.value)}
              className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
            >
              <option value="Broken Page">Broken Page</option>
              <option value="Incorrect Data">Incorrect Data</option>
              <option value="Tournament Problem">Tournament Problem</option>
              <option value="Registration Problem">Registration Problem</option>
              <option value="Match Problem">Match Problem</option>
              <option value="Wallet Demo Problem">Wallet Demo Problem</option>
              <option value="Cheating Report">Cheating Report</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase">Severity Level</label>
            <select
              value={severity}
              onChange={(e: any) => setSeverity(e.target.value)}
              className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-muted uppercase">Issue Description *</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what went wrong..."
            className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground resize-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-muted uppercase">Steps to Reproduce</label>
          <textarea
            rows={3}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="1. Open Tournaments page&#10;2. Click Register button..."
            className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground resize-none"
          />
        </div>

        <button
          type="submit"
          className="mt-2 py-3 bg-danger hover:bg-danger/90 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
        >
          <Send className="h-4 w-4" />
          Submit Problem Report
        </button>
      </form>
    </div>
  );
}
