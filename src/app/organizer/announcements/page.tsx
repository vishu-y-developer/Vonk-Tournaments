'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { useOrganizer } from '@/providers/OrganizerProvider';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import { Megaphone, Send, Info } from 'lucide-react';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';
import { OrganizerAnnouncement } from '@/types';

export default function AnnouncementsHubPage() {
  const { managedTournaments, publishAnnouncement } = useOrganizer();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tourId, setTourId] = useState('');
  const [type, setType] = useState<'GENERAL' | 'URGENT' | 'SCHEDULE_CHANGE'>('GENERAL');

  // Fetch announcements
  const list = useMemo(() => {
    return browserStorage.getItem<OrganizerAnnouncement[]>(STORAGE_KEYS.ORGANIZER_ANNOUNCEMENTS, []);
  }, [managedTournaments]);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !tourId) {
      alert('Please fill all required fields.');
      return;
    }
    publishAnnouncement({
      tournamentId: tourId,
      title,
      content,
      type: type as any,
      targetAudience: 'ALL'
    });
    alert('Announcement published successfully!');
    setTitle('');
    setContent('');
    window.location.reload();
  };

  return (
    <OrganizerShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-secondary" />
            Lobby & Match Announcements
          </h1>
          <p className="text-xs text-muted">
            Broadcast rules revisions, schedule updates, or check-in warning alerts to registered contestants.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form */}
          <form onSubmit={handlePublish} className="lg:col-span-5 p-5 rounded-xl border border-card-border bg-card-bg/15 flex flex-col gap-4">
            <h3 className="text-xs uppercase font-extrabold text-foreground tracking-wide">
              Create New Broadcast
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Select Target Tournament *</label>
              <select
                value={tourId}
                onChange={(e) => setTourId(e.target.value)}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
              >
                <option value="">Choose tournament...</option>
                {managedTournaments.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Headline *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Schedule delay warning"
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Message *</label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter updates text..."
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Broadcast Category</label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs"
              >
                <option value="GENERAL">General update</option>
                <option value="SCHEDULE_CHANGE">Schedule Delay</option>
                <option value="URGENT">Urgent Alert</option>
              </select>
            </div>

            <button
              type="submit"
              className="py-3 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="h-4 w-4" />
              Broadcast Message
            </button>
          </form>

          {/* List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-muted">Broadcast History</h3>
            {list.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted border border-dashed border-card-border rounded-xl">
                No active announcements found.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {list.map((ann) => (
                  <div 
                    key={ann.id}
                    className="p-4 rounded-xl border border-card-border bg-card-bg/15 flex flex-col gap-1 hover:bg-card-bg/25 transition-all text-xs font-semibold"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-extrabold text-foreground">{ann.title}</span>
                      <span className="text-[9px] text-muted">
                        {ann.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted italic my-1">
                      &quot;{ann.content}&quot;
                    </p>
                    <span className="text-[9px] text-muted">
                      Target ID: {ann.tournamentId}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </OrganizerShell>
  );
}
