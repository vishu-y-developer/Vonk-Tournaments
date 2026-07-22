'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { useOrganizer } from '@/providers/OrganizerProvider';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import { Sword, Plus, Calendar, Key, AlertTriangle, Info } from 'lucide-react';
import { Match } from '@/types';
import { browserStorage } from '@/lib/storage/browser-storage';

export default function MatchesPage() {
  const { managedTournaments, createMatch, releaseCredentials } = useOrganizer();

  const [tourId, setTourId] = useState('');
  const [matchTime, setMatchTime] = useState(() => new Date(Date.now() + 3600000).toISOString().substring(0, 16));
  const [map, setMap] = useState('Erangel');

  const [credMatchId, setCredMatchId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomPw, setRoomPw] = useState('');

  // Fetch matches from localStorage
  const matches: Match[] = useMemo(() => {
    return browserStorage.getItem<Match[]>('vonk:v1:matches', []);
  }, [managedTournaments]);

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourId) {
      alert('Please select a tournament.');
      return;
    }
    createMatch(tourId, {
      startTime: new Date(matchTime).toISOString()
    });
    alert('Match created successfully!');
    window.location.reload();
  };

  const handleRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credMatchId || !roomId || !roomPw) {
      alert('Please fill all fields.');
      return;
    }
    releaseCredentials(credMatchId, roomId, roomPw);
    alert('Room credentials published! Notifications dispatched.');
    setRoomId('');
    setRoomPw('');
    window.location.reload();
  };

  return (
    <OrganizerShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Sword className="h-6 w-6 text-secondary" />
            Match Scheduler & Credential Hub
          </h1>
          <p className="text-xs text-muted">
            Configure round schedules maps, release lobby identifiers, and confirm check-in statuses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Match */}
          <form onSubmit={handleCreateMatch} className="p-5 rounded-xl border border-card-border bg-card-bg/15 flex flex-col gap-4">
            <h3 className="text-xs uppercase font-extrabold text-foreground tracking-wide flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-secondary" />
              Schedule New Match
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Select Tournament</label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted uppercase">Start Time</label>
                <input
                  type="datetime-local"
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted uppercase">Battle Map</label>
                <select
                  value={map}
                  onChange={(e) => setMap(e.target.value)}
                  className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
                >
                  <option value="Erangel">Erangel</option>
                  <option value="Miramar">Miramar</option>
                  <option value="Sanhok">Sanhok</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="py-3 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs transition-colors"
            >
              Add Match Schedule
            </button>
          </form>

          {/* Release Credentials */}
          <form onSubmit={handleRelease} className="p-5 rounded-xl border border-card-border bg-card-bg/15 flex flex-col gap-4">
            <h3 className="text-xs uppercase font-extrabold text-foreground tracking-wide flex items-center gap-1.5">
              <Key className="h-4 w-4 text-secondary" />
              Publish Lobby Room Credentials
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Select Scheduled Match</label>
              <select
                value={credMatchId}
                onChange={(e) => setCredMatchId(e.target.value)}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
              >
                <option value="">Choose match...</option>
                {matches.filter((m) => !m.roomIdReleased).map((m) => (
                  <option key={m.id} value={m.id}>
                    Match {m.id} - {new Date(m.startTime).toLocaleTimeString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted uppercase">Room ID</label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="e.g. 982182"
                  className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted uppercase">Password</label>
                <input
                  type="password"
                  value={roomPw}
                  onChange={(e) => setRoomPw(e.target.value)}
                  placeholder="Lobby password"
                  className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-[#ffffff] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-3 bg-success/20 hover:bg-success/30 border border-success/35 text-success font-extrabold rounded-xl text-xs transition-colors"
            >
              Release Credentials
            </button>
          </form>
        </div>

        {/* Matches list */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-muted">Lobby Credentials Timeline</h3>
          {matches.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted border border-dashed border-card-border rounded-xl">
              No matches scheduled.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {matches.map((m) => (
                <div 
                  key={m.id}
                  className="p-4 rounded-xl border border-card-border bg-card-bg/15 flex justify-between items-center text-xs font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <Sword className="h-4 w-4 text-secondary" />
                    <div className="flex flex-col">
                      <span className="font-extrabold text-foreground">Match {m.id}</span>
                      <span className="text-[10px] text-muted">
                        Starts: {new Date(m.startTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-extrabold tracking-wider ${
                    m.roomIdReleased ? 'bg-success/15 border-success/30 text-success' : 'bg-muted/15 border-card-border text-muted'
                  }`}>
                    {m.roomIdReleased ? 'CREDENTIALS RELEASED' : 'WAITING FOR RELEASE'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </OrganizerShell>
  );
}
