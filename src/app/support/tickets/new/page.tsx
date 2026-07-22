'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupport } from '@/providers/SupportProvider';
import DemoSupportNotice from '@/components/support/DemoSupportNotice';
import { Ticket, Send, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SupportTicketCategory, SupportTicketPriority } from '@/types';

export default function NewSupportTicketPage() {
  const router = useRouter();
  const { createTicket } = useSupport();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicketCategory>('GENERAL_HELP');
  const [priority, setPriority] = useState<SupportTicketPriority>('NORMAL');
  const [description, setDescription] = useState('');
  const [consent, setConsent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description || description.length < 10) {
      alert('Please fill out subject and minimum 10 characters description.');
      return;
    }
    if (!consent) {
      alert('Please acknowledge that this is a simulated demo support request.');
      return;
    }

    const ticket = createTicket(subject, category, priority, description);
    alert('Demo support ticket created successfully!');
    router.push(`/support/tickets/${ticket.id}`);
  };

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto">
      <DemoSupportNotice />

      <Link href="/support/tickets" className="flex items-center gap-1 text-xs text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Support Tickets
      </Link>

      <div>
        <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
          <Ticket className="h-6 w-6 text-secondary" />
          Submit Demo Support Ticket
        </h1>
        <p className="text-xs text-muted">
          Describe your inquiry or issue. Our automated support assistant will record your ticket locally.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-muted uppercase">Subject Line *</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Issue retrieving room ID for Round 2"
            className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase">Category</label>
            <select
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
            >
              <option value="GENERAL_HELP">General Help</option>
              <option value="TOURNAMENT_ISSUE">Tournament Issue</option>
              <option value="REGISTRATION_ISSUE">Registration Issue</option>
              <option value="MATCH_ISSUE">Match Issue</option>
              <option value="ROOM_CREDENTIAL_ISSUE">Room Credential Issue</option>
              <option value="RESULT_DISPUTE_HELP">Result Dispute Help</option>
              <option value="WALLET_DEMO_ISSUE">Wallet Demo Issue</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase">Priority</label>
            <select
              value={priority}
              onChange={(e: any) => setPriority(e.target.value)}
              className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
            >
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-muted uppercase">Detailed Description *</label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detail your inquiry..."
            className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground resize-none"
            required
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-muted cursor-pointer mt-1">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="h-4 w-4 rounded bg-card-bg border-card-border text-secondary"
          />
          I acknowledge that this ticket is stored locally for demonstration purposes.
        </label>

        <button
          type="submit"
          className="mt-2 py-3 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md glow-secondary"
        >
          <Send className="h-4 w-4" />
          Submit Demo Support Ticket
        </button>
      </form>
    </div>
  );
}
