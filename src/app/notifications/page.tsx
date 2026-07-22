'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNotifications } from '@/providers/NotificationProvider';
import NotificationCard from '@/components/notifications/NotificationCard';
import DemoNotificationNotice from '@/components/notifications/DemoNotificationNotice';
import { Bell, Search, CheckCheck, Archive, Sparkles, Filter } from 'lucide-react';
import useNotificationFilters from '@/hooks/useNotificationFilters';

export default function NotificationsPage() {
  const { unreadCount, markAllAsRead } = useNotifications();
  const { filtered, tab, setTab, search, setSearch } = useNotificationFilters();

  const tabs = [
    { id: 'ALL', label: 'All Alerts' },
    { id: 'UNREAD', label: `Unread (${unreadCount})` },
    { id: 'TOURNAMENT', label: 'Tournaments' },
    { id: 'MATCH', label: 'Matches' },
    { id: 'RESULT', label: 'Results' },
    { id: 'TEAM', label: 'Teams' },
    { id: 'WALLET', label: 'Wallet' },
    { id: 'SUPPORT', label: 'Support' },
    { id: 'ARCHIVED', label: 'Archived' },
  ];

  return (
    <div className="flex flex-col gap-6 py-4 max-w-5xl mx-auto">
      <DemoNotificationNotice />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-secondary" />
            Notification Center
          </h1>
          <p className="text-xs text-muted">
            Platform updates, room credential releases, match reminders, and simulated wallet ledgers.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-secondary/15 hover:bg-secondary/25 border border-secondary/30 text-secondary font-extrabold rounded-xl text-xs transition-all"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search notifications by keyword, title, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card-bg/40 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
          />
        </div>

        <div className="flex overflow-x-auto gap-2 border-b border-card-border pb-2 scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                tab === t.id
                  ? 'border-secondary bg-secondary/15 text-secondary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="p-16 rounded-2xl border border-dashed border-card-border bg-card-bg/10 text-center flex flex-col items-center justify-center gap-2">
          <Bell className="h-8 w-8 text-muted/30" />
          <span className="text-xs font-bold text-muted">No notifications matching filters.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((n) => (
            <NotificationCard key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}
