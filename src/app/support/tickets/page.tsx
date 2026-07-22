'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import Link from 'next/link';
import { useSupport } from '@/providers/SupportProvider';
import SupportTicketCard from '@/components/support/SupportTicketCard';
import DemoSupportNotice from '@/components/support/DemoSupportNotice';
import { Ticket, Plus } from 'lucide-react';

export default function SupportTicketsPage() {
  const { tickets } = useSupport();
  const [filter, setFilter] = useState('ALL');

  const filtered = tickets.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto">
      <DemoSupportNotice />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Ticket className="h-6 w-6 text-secondary" />
            Support Ticket History
          </h1>
          <p className="text-xs text-muted">
            Track active support inquiries, view ticket updates, and communicate with simulated support.
          </p>
        </div>

        <Link
          href="/support/tickets/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs shadow-md glow-secondary"
        >
          <Plus className="h-4 w-4" />
          Create Support Ticket
        </Link>
      </div>

      <div className="flex gap-2 border-b border-card-border pb-2">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === st ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'text-muted hover:text-foreground'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-muted border border-dashed border-card-border rounded-xl">
          No support tickets found matching filter.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((t) => (
            <SupportTicketCard key={t.id} ticket={t} />
          ))}
        </div>
      )}
    </div>
  );
}
