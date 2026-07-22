'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAdmin } from '@/providers/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';
import UserStatusBadge from '@/components/admin/UserStatusBadge';
import { Megaphone, Send, Trash2 } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const { announcements, createAnnouncement, deleteAnnouncement } = useAdmin();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<'EVERYONE' | 'PLAYERS' | 'ORGANIZERS'>('EVERYONE');

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    createAnnouncement(title, content, target, 'PUBLISHED');
    alert('Platform announcement published broadcast!');
    setTitle('');
    setContent('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this platform broadcast announcement?')) {
      deleteAnnouncement(id);
      alert('Announcement deleted.');
    }
  };

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-warning" />
            Platform-Wide Announcements
          </h1>
          <p className="text-xs text-muted">
            Broadcast platform updates, maintenance notices, and tournament season invitations to all users.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Create Announcement Form */}
          <form onSubmit={handlePublish} className="lg:col-span-5 p-5 rounded-xl border border-card-border bg-card-bg/20 flex flex-col gap-4">
            <h3 className="text-xs uppercase font-extrabold text-foreground tracking-wide">
              Create Platform Broadcast
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Headline *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer Championship Season 1 Announced"
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Target Audience</label>
              <select
                value={target}
                onChange={(e: any) => setTarget(e.target.value)}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs"
              >
                <option value="EVERYONE">Everyone (All Users)</option>
                <option value="PLAYERS">Players Only</option>
                <option value="ORGANIZERS">Organizers Only</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Announcement Message *</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter details of announcement..."
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="py-3 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md glow-secondary"
            >
              <Send className="h-4 w-4" />
              Publish Broadcast
            </button>
          </form>

          {/* Announcements List */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-muted">Broadcast History</h3>
            {announcements.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted border border-dashed border-card-border rounded-xl">
                No platform announcements published.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-xl border border-card-border bg-card-bg/20 flex flex-col gap-2 hover:bg-card-bg/30 transition-all text-xs"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-extrabold text-foreground">{ann.title}</span>
                      <UserStatusBadge status={ann.target} />
                    </div>
                    <p className="text-[11px] text-muted italic my-1">
                      &quot;{ann.content}&quot;
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-muted pt-2 border-t border-card-border">
                      <span>Status: {ann.status}</span>
                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="text-danger hover:underline font-bold flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
