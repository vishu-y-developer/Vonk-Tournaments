'use client';

import React, { useState, useMemo } from 'react';
import { useTournaments } from '@/providers/TournamentProvider';
import TournamentCard from '@/components/tournaments/TournamentCard';
import { BGMI_MAPS, TOURNAMENT_LEVELS, TOURNAMENT_MODES } from '@/constants';
import { Search, SlidersHorizontal, ArrowUpDown, X, Gamepad } from 'lucide-react';

const MOCK_NOW_MS = new Date('2026-07-19T15:20:00.000Z').getTime();
const MOCK_TODAY_STR = new Date('2026-07-19T15:20:00.000Z').toDateString();

export default function TournamentsExplore() {
  const { tournaments } = useTournaments();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFee, setSelectedFee] = useState<string>('all');
  const [selectedPrize, setSelectedPrize] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedMap, setSelectedMap] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Mobile Filter Drawer visibility
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Reset helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedFee('all');
    setSelectedPrize('all');
    setSelectedType('all');
    setSelectedMode('all');
    setSelectedMap('all');
    setSelectedLevel('all');
    setSelectedStatus('all');
    setSelectedDate('all');
    setSortBy('newest');
  };

  // Filter calculations
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      // 1. Search Query (Title, Organizer, Mode)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesOrganizer = t.organizer.toLowerCase().includes(query);
        const matchesMode = t.mode.toLowerCase().includes(query);
        if (!matchesTitle && !matchesOrganizer && !matchesMode) return false;
      }

      // 2. Entry Fee
      if (selectedFee !== 'all') {
        const fee = t.entryFee;
        if (selectedFee === 'free' && fee !== 0) return false;
        if (selectedFee === '1-50' && (fee < 1 || fee > 50)) return false;
        if (selectedFee === '51-100' && (fee < 51 || fee > 100)) return false;
        if (selectedFee === '101-250' && (fee < 101 || fee > 250)) return false;
        if (selectedFee === '251-500' && (fee < 251 || fee > 500)) return false;
        if (selectedFee === '500plus' && fee <= 500) return false;
      }

      // 3. Prize Pool
      if (selectedPrize !== 'all') {
        const prize = t.prizePool;
        if (selectedPrize === '100-500' && (prize < 100 || prize > 500)) return false;
        if (selectedPrize === '500-1000' && (prize < 500 || prize > 1000)) return false;
        if (selectedPrize === '1000-5000' && (prize < 1000 || prize > 5000)) return false;
        if (selectedPrize === '5000-10000' && (prize < 5000 || prize > 10000)) return false;
        if (selectedPrize === '10000plus' && prize <= 10000) return false;
      }

      // 4. Tournament Type
      if (selectedType !== 'all') {
        if (selectedType === 'free' && t.entryFee !== 0) return false;
        if (selectedType === 'paid' && t.entryFee === 0) return false;
        if (selectedType === 'sponsored' && t.visibility !== 'Public') return false; // simulated
        if (selectedType === 'invitational' && t.visibility !== 'Invite Only') return false;
      }

      // 5. Game Mode
      if (selectedMode !== 'all') {
        if (t.mode !== selectedMode) return false;
      }

      // 6. Map
      if (selectedMap !== 'all') {
        if (t.map !== selectedMap) return false;
      }

      // 7. Skill Level
      if (selectedLevel !== 'all') {
        if (t.level !== selectedLevel) return false;
      }

      // 8. Status
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'open' && t.status !== 'Registration Open' && t.status !== 'Filling Fast') return false;
        if (selectedStatus === 'closing' && t.status !== 'Filling Fast') return false;
        if (selectedStatus === 'full' && t.status !== 'Registration Closed') return false;
        if (selectedStatus === 'upcoming' && t.status !== 'Upcoming') return false;
        if (selectedStatus === 'live' && t.status !== 'Live' && t.status !== 'Room Released') return false;
      }

      // 9. Match Date
      if (selectedDate !== 'all') {
        const matchTime = new Date(t.matchStart).getTime();
        const now = MOCK_NOW_MS;
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (selectedDate === 'today') {
          const isToday = new Date(t.matchStart).toDateString() === MOCK_TODAY_STR;
          if (!isToday) return false;
        } else if (selectedDate === 'tomorrow') {
          const tomorrowStr = new Date(MOCK_NOW_MS + oneDay).toDateString();
          const isTomorrow = new Date(t.matchStart).toDateString() === tomorrowStr;
          if (!isTomorrow) return false;
        } else if (selectedDate === 'week') {
          if (matchTime > now + 7 * oneDay || matchTime < now) return false;
        } else if (selectedDate === 'month') {
          if (matchTime > now + 30 * oneDay || matchTime < now) return false;
        }
      }

      return true;
    });
  }, [tournaments, searchQuery, selectedFee, selectedPrize, selectedType, selectedMode, selectedMap, selectedLevel, selectedStatus, selectedDate]);

  // Sorting calculations
  const sortedTournaments = useMemo(() => {
    const list = [...filteredTournaments];
    switch (sortBy) {
      case 'highest-prize':
        return list.sort((a, b) => b.prizePool - a.prizePool);
      case 'lowest-entry':
        return list.sort((a, b) => a.entryFee - b.entryFee);
      case 'newest':
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'popular':
        return list.sort((a, b) => b.registeredParticipants - a.registeredParticipants);
      case 'filling-fast':
        return list.sort((a, b) => {
          const aRatio = a.registeredParticipants / a.maxParticipants;
          const bRatio = b.registeredParticipants / b.maxParticipants;
          return bRatio - aRatio;
        });
      case 'closest-time':
        return list.sort((a, b) => new Date(a.matchStart).getTime() - new Date(b.matchStart).getTime());
      default:
        return list;
    }
  }, [filteredTournaments, sortBy]);

  // Sidebar Filter component
  const renderFilterSidebarContent = () => (
    <div className="flex flex-col gap-6">
      {/* Reset Button */}
      <div className="flex items-center justify-between border-b border-card-border pb-3">
        <span className="text-xs uppercase font-extrabold tracking-wider text-muted">Filters</span>
        <button
          onClick={handleResetFilters}
          className="text-xs font-bold text-primary hover:underline hover:text-primary/95"
        >
          Reset All
        </button>
      </div>

      {/* Entry Fee Range */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Entry Fee</label>
        <select
          value={selectedFee}
          onChange={(e) => setSelectedFee(e.target.value)}
          className="w-full bg-[#0a0a0f] border border-card-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground/80 focus:border-primary/50 focus:outline-none"
        >
          <option value="all">Any Fee</option>
          <option value="free">Free Entry (₹0)</option>
          <option value="1-50">₹1 – ₹50</option>
          <option value="51-100">₹51 – ₹100</option>
          <option value="101-250">₹101 – ₹250</option>
          <option value="251-500">₹251 – ₹500</option>
          <option value="500plus">₹500+</option>
        </select>
      </div>

      {/* Prize Pool Range */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Prize Pool</label>
        <select
          value={selectedPrize}
          onChange={(e) => setSelectedPrize(e.target.value)}
          className="w-full bg-[#0a0a0f] border border-card-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground/80 focus:border-primary/50 focus:outline-none"
        >
          <option value="all">Any Prize</option>
          <option value="100-500">₹100 – ₹500</option>
          <option value="500-1000">₹500 – ₹1,000</option>
          <option value="1000-5000">₹1,000 – ₹5,000</option>
          <option value="5000-10000">₹5,000 – ₹10,000</option>
          <option value="10000plus">₹10,000+</option>
        </select>
      </div>

      {/* Mode */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Game Mode</label>
        <select
          value={selectedMode}
          onChange={(e) => setSelectedMode(e.target.value)}
          className="w-full bg-[#0a0a0f] border border-card-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground/80 focus:border-primary/50 focus:outline-none"
        >
          <option value="all">All Modes</option>
          {TOURNAMENT_MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Map */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Maps</label>
        <select
          value={selectedMap}
          onChange={(e) => setSelectedMap(e.target.value)}
          className="w-full bg-[#0a0a0f] border border-card-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground/80 focus:border-primary/50 focus:outline-none"
        >
          <option value="all">All Maps</option>
          {BGMI_MAPS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Skill Level */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Skill Level</label>
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="w-full bg-[#0a0a0f] border border-card-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground/80 focus:border-primary/50 focus:outline-none"
        >
          <option value="all">Any Level</option>
          {TOURNAMENT_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Match Date</label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full bg-[#0a0a0f] border border-card-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground/80 focus:border-primary/50 focus:outline-none"
        >
          <option value="all">Any Date</option>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-2 font-semibold">
        <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Status</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full bg-[#0a0a0f] border border-card-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground/80 focus:border-primary/50 focus:outline-none"
        >
          <option value="all">Any Status</option>
          <option value="open">Registration Open</option>
          <option value="closing">Filling Fast</option>
          <option value="full">Registration Closed</option>
          <option value="upcoming">Upcoming</option>
          <option value="live">Live / Released</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 px-4 md:px-0 py-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-card-border pb-4">
        <h1 className="text-xl md:text-3xl font-black tracking-tight flex items-center gap-2">
          <Gamepad className="h-6 w-6 text-primary" />
          EXPLORE TOURNAMENTS
        </h1>
        <p className="text-xs text-muted">
          Find public or private arenas, check slots, filter by fee/map size, and join custom rooms.
        </p>
      </div>

      {/* Top Search & Filter Actions Toolbar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search matches, organizers, modes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card-bg border border-card-border rounded-xl text-xs font-semibold text-foreground/90 focus:border-primary/50 focus:outline-none"
          />
        </div>

        {/* Sort By */}
        <div className="relative shrink-0 hidden sm:flex items-center gap-1.5 border border-card-border bg-card-bg/60 rounded-xl px-3 py-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-0 text-xs font-bold text-foreground/80 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="highest-prize">Highest Prize</option>
            <option value="lowest-entry">Lowest Entry</option>
            <option value="popular">Most Popular</option>
            <option value="filling-fast">Filling Fast</option>
            <option value="closest-time">Closest Time</option>
          </select>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex md:hidden items-center justify-center gap-1.5 px-3 py-2.5 bg-card-bg border border-card-border rounded-xl text-xs font-bold text-foreground/85 active:bg-card-border transition-all touch-target"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Layout Split: Sidebar filters (Desktop) + Grid display list */}
      <div className="flex gap-6 mt-2">
        {/* Sidebar Filters - Left */}
        <aside className="w-64 shrink-0 hidden md:block rounded-2xl border border-card-border bg-card-bg/40 p-5 h-fit sticky top-24">
          {renderFilterSidebarContent()}
        </aside>

        {/* Grid List - Right */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between text-xs font-bold text-muted">
            <span>Found {sortedTournaments.length} Match Arenas</span>
            <div className="sm:hidden flex items-center gap-1.5 border border-card-border bg-card-bg/60 rounded-lg px-2.5 py-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-0 text-[10px] font-extrabold text-foreground/80 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="highest-prize">Highest Prize</option>
                <option value="lowest-entry">Lowest Entry</option>
                <option value="popular">Most Popular</option>
                <option value="filling-fast">Filling Fast</option>
                <option value="closest-time">Closest Time</option>
              </select>
            </div>
          </div>

          {sortedTournaments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTournaments.map((t) => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-card-border bg-card-bg/10 max-w-md mx-auto my-8">
              <div className="p-4 rounded-full bg-card-bg border border-card-border text-muted mb-4">
                <Gamepad className="h-8 w-8 opacity-40 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1.5">No tournament matches found</h3>
              <p className="text-xs text-muted leading-relaxed mb-6">
                We couldn&apos;t find any tournaments matching your active search queries or filter selections. Try adjusting your parameters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-primary text-background font-black text-xs rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md touch-target"
              >
                Clear Filters & Search
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 10. MOBILE FILTER SLIDING DRAWER DIALOG */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[110] flex md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          {/* Content Pane */}
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-card-bg border-l border-card-border p-5 flex flex-col h-full overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-card-border pb-3 mb-4">
              <span className="text-sm font-extrabold uppercase text-foreground">Filter Lobbies</span>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1">
              {renderFilterSidebarContent()}
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="mt-6 w-full py-2.5 bg-primary hover:bg-primary/95 text-background font-black text-xs rounded-xl transition-all shadow-md touch-target"
            >
              Apply Filter Parameters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
