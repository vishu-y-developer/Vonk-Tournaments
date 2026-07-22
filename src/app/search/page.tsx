'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import Link from 'next/link';
import { globalSearchService } from '@/lib/services/global-search-service';
import { GlobalSearchCategory, GlobalSearchResult } from '@/types';
import { Search, Trophy, Shield, BookOpen, ArrowRight, X } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('ALL');

  const selectedCat = category === 'ALL' ? undefined : (category as GlobalSearchCategory);
  const results: GlobalSearchResult[] = query ? globalSearchService.search(query, selectedCat) : [];

  const categories = [
    { id: 'ALL', label: 'All Results' },
    { id: 'TOURNAMENTS', label: 'Tournaments' },
    { id: 'TEAMS', label: 'Teams' },
    { id: 'HELP', label: 'Help Articles' },
  ];

  return (
    <div className="flex flex-col gap-6 py-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
          <Search className="h-6 w-6 text-secondary" />
          Global Platform Search
        </h1>
        <p className="text-xs text-muted">
          Search custom-room tournaments, registered team rosters, and help center documentation.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
        <input
          type="text"
          placeholder="Search by tournament name, mode, team, tag, or help keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full pl-12 pr-10 py-3.5 bg-card-bg/60 border border-card-border rounded-2xl text-sm text-foreground focus:outline-none focus:border-secondary/40 shadow-lg"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-card-border pb-2 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              category === c.id
                ? 'border-secondary bg-secondary/15 text-secondary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Results View */}
      {!query ? (
        <div className="p-12 rounded-2xl border border-dashed border-card-border bg-card-bg/10 text-center flex flex-col items-center justify-center gap-2 text-xs text-muted">
          <Search className="h-8 w-8 text-muted/30" />
          <span>Type a query above to search across tournaments, teams, and help topics.</span>
        </div>
      ) : results.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-card-border bg-card-bg/10 text-center text-xs text-muted">
          No matching results found for &quot;{query}&quot;.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-extrabold text-muted uppercase">Found {results.length} Matches</span>
          {results.map((r) => (
            <Link
              key={r.id}
              href={r.href}
              className="p-4 rounded-xl border border-card-border bg-card-bg/25 hover:bg-card-bg/50 flex justify-between items-center transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary">
                  {r.iconType === 'Trophy' && <Trophy className="h-4 w-4" />}
                  {r.iconType === 'Shield' && <Shield className="h-4 w-4" />}
                  {r.iconType === 'BookOpen' && <BookOpen className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-xs">{r.title}</h3>
                  <span className="text-[11px] text-muted">{r.subtitle}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {r.badge && (
                  <span className="px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-card-bg border border-card-border text-muted">
                    {r.badge}
                  </span>
                )}
                <ArrowRight className="h-4 w-4 text-secondary shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
