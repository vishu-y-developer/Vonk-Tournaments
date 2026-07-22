'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import Link from 'next/link';
import { useSupport } from '@/providers/SupportProvider';
import DemoSupportNotice from '@/components/support/DemoSupportNotice';
import { BookOpen, Search, ArrowRight, Sparkles } from 'lucide-react';

export default function HelpCenterPage() {
  const { helpArticles, searchHelp } = useSupport();
  const [query, setQuery] = useState('');

  const articles = query ? searchHelp(query) : helpArticles;

  return (
    <div className="flex flex-col gap-6 py-4 max-w-5xl mx-auto">
      <DemoSupportNotice />

      <div className="flex flex-col gap-2">
        <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          VONK Help Center
        </h1>
        <p className="text-xs text-muted">
          Comprehensive guides, tournament rules, demo wallet explanations, and troubleshooting steps.
        </p>
      </div>

      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          type="text"
          placeholder="Search help articles by topic or keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((art) => (
          <Link
            key={art.id}
            href={`/help/${art.slug}`}
            className="p-5 rounded-2xl border border-card-border bg-card-bg/25 hover:bg-card-bg/40 flex flex-col gap-2 transition-all hover:scale-[1.01]"
          >
            <div className="flex justify-between items-start">
              <span className="px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-primary/20 text-primary border border-primary/30">
                {art.category}
              </span>
              <span className="text-[10px] text-muted font-mono">{new Date(art.updatedAt).toLocaleDateString()}</span>
            </div>
            <h3 className="text-sm font-extrabold text-foreground">{art.title}</h3>
            <p className="text-xs text-muted leading-relaxed line-clamp-3">{art.summary}</p>
            <div className="flex items-center gap-1 text-xs font-bold text-secondary mt-2">
              Read Guide <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
