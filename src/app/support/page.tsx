'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import Link from 'next/link';
import DemoSupportNotice from '@/components/support/DemoSupportNotice';
import FAQAccordion from '@/components/support/FAQAccordion';
import { 
  LifeBuoy, 
  Search, 
  HelpCircle, 
  Ticket, 
  Plus, 
  Flag, 
  Activity, 
  BookOpen, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useSupport } from '@/providers/SupportProvider';

export default function SupportHubPage() {
  const { helpArticles, searchHelp } = useSupport();
  const [query, setQuery] = useState('');

  const searchResults = query ? searchHelp(query) : [];

  const categories = [
    { name: 'Getting Started', desc: 'Account registration and profile creation', count: 4 },
    { name: 'Tournaments & Brackets', desc: 'Custom room formats, registration rules, check-in', count: 6 },
    { name: 'Demo Wallet', desc: 'Simulated entry fees, refunds, and prize payouts', count: 5 },
    { name: 'Match Center', desc: 'Retrieving room ID and passwords', count: 3 },
  ];

  return (
    <div className="flex flex-col gap-6 py-4 max-w-5xl mx-auto">
      <DemoSupportNotice />

      {/* Header Banner */}
      <div className="p-8 rounded-2xl border border-card-border bg-gradient-to-r from-primary/15 via-secondary/15 to-card-bg text-center flex flex-col items-center gap-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
          <LifeBuoy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight">
            How can we help you?
          </h1>
          <p className="text-xs text-muted max-w-md mt-1 mx-auto leading-relaxed">
            Search our knowledgebase articles, check platform status, or submit a support ticket.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full max-w-lg mt-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search articles, FAQs, keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card-bg/90 border border-card-border rounded-xl text-xs text-foreground focus:outline-none focus:border-secondary/40 shadow-lg"
          />
        </div>
      </div>

      {/* Search Results Dropdown */}
      {query && (
        <div className="p-4 rounded-xl border border-card-border bg-card-bg/30 flex flex-col gap-2">
          <h4 className="text-xs font-extrabold uppercase text-foreground">Search Results ({searchResults.length})</h4>
          {searchResults.length === 0 ? (
            <div className="text-xs text-muted">No matching articles found.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {searchResults.map((a) => (
                <Link
                  key={a.id}
                  href={`/help/${a.slug}`}
                  className="p-3 rounded-lg border border-card-border bg-card-bg/40 hover:bg-card-bg/60 flex justify-between items-center text-xs font-semibold"
                >
                  <div>
                    <span className="font-extrabold text-foreground block">{a.title}</span>
                    <span className="text-[10px] text-muted">{a.summary}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-secondary shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Shortcut Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/support/tickets"
          className="p-4 rounded-xl border border-card-border bg-card-bg/20 hover:bg-card-bg/40 flex flex-col gap-2 text-xs font-bold transition-all hover:scale-[1.02]"
        >
          <Ticket className="h-5 w-5 text-secondary" />
          <span>My Support Tickets</span>
        </Link>
        <Link
          href="/support/tickets/new"
          className="p-4 rounded-xl border border-card-border bg-card-bg/20 hover:bg-card-bg/40 flex flex-col gap-2 text-xs font-bold transition-all hover:scale-[1.02]"
        >
          <Plus className="h-5 w-5 text-success" />
          <span>Submit Support Ticket</span>
        </Link>
        <Link
          href="/support/report"
          className="p-4 rounded-xl border border-card-border bg-card-bg/20 hover:bg-card-bg/40 flex flex-col gap-2 text-xs font-bold transition-all hover:scale-[1.02]"
        >
          <Flag className="h-5 w-5 text-danger" />
          <span>Report a Problem</span>
        </Link>
        <Link
          href="/support/status"
          className="p-4 rounded-xl border border-card-border bg-card-bg/20 hover:bg-card-bg/40 flex flex-col gap-2 text-xs font-bold transition-all hover:scale-[1.02]"
        >
          <Activity className="h-5 w-5 text-primary" />
          <span>Platform System Status</span>
        </Link>
      </div>

      {/* Popular Help Categories */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-extrabold uppercase text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          Popular Help Topics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {helpArticles.map((art) => (
            <Link
              key={art.id}
              href={`/help/${art.slug}`}
              className="p-4 rounded-xl border border-card-border bg-card-bg/20 hover:bg-card-bg/40 flex flex-col gap-1 transition-all"
            >
              <span className="font-extrabold text-foreground text-xs">{art.title}</span>
              <p className="text-[11px] text-muted line-clamp-2">{art.summary}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <FAQAccordion />
    </div>
  );
}
