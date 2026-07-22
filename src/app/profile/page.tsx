'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useWallet } from '@/providers/WalletProvider';
import { useTournaments } from '@/providers/TournamentProvider';
import { useResults } from '@/providers/ResultProvider';
import { Player, MatchHistory, Tournament, Registration } from '@/types';
import { STORAGE_KEYS, ROUTES } from '@/constants';
import { browserStorage } from '@/lib/storage/browser-storage';
import LevelBadge from '@/components/common/LevelBadge';
import TournamentCard from '@/components/tournaments/TournamentCard';
import {
  User,
  Shield,
  Trophy,
  Activity,
  History,
  Bookmark,
  Settings as SettingsIcon,
  Camera,
  Share2,
  Download,
  Search,
  Check,
  Trash2,
  ExternalLink,
  Tv,
  Bell,
  Eye,
  QrCode
} from 'lucide-react';

export default function PlayerProfile() {
  const { user, updateProfile } = useAuth();
  const { balance } = useWallet();
  const { tournaments } = useTournaments();
  const { results, standings } = useResults();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'matches' | 'saved' | 'settings'>('overview');
  const [myTournamentsTab, setMyTournamentsTab] = useState<'upcoming' | 'live' | 'completed' | 'cancelled'>('upcoming');

  // Interactive Chart state
  const [chartMetric, setChartMetric] = useState<'kills' | 'placements' | 'winnings'>('kills');

  // Search & Filter state inside profile
  const [searchQuery, setSearchQuery] = useState('');
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedCard, setCopiedCard] = useState(false);

  // Profile Edit fields state
  const [editUsername, setEditUsername] = useState('');
  const [editIGN, setEditIGN] = useState('');
  const [editCharID, setEditCharID] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editState, setEditState] = useState('');
  const [editLanguage, setEditLanguage] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editCover, setEditCover] = useState('');
  
  // Settings Preference fields
  const [notifyUpdates, setNotifyUpdates] = useState(true);
  const [notifyReg, setNotifyReg] = useState(true);
  const [notifyPrize, setNotifyPrize] = useState(true);
  const [notifyRefund, setNotifyRefund] = useState(true);
  const [notifyAnnounce, setNotifyAnnounce] = useState(true);
  const [notifySys, setNotifySys] = useState(false);
  const [privacyStats, setPrivacyStats] = useState(true);
  const [privacyHistory, setPrivacyHistory] = useState(true);
  const [privacySocials, setPrivacySocials] = useState(true);
  const [themePref, setThemePref] = useState<'dark' | 'light' | 'amoled'>('dark');

  // Social Links edit fields
  const [socialInsta, setSocialInsta] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');
  const [socialDiscord, setSocialDiscord] = useState('');
  const [socialX, setSocialX] = useState('');

  // Refs for file uploads
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Load from Storage on mount
  useEffect(() => {
    if (user) {
      const storedHistory = browserStorage.getItem<MatchHistory[]>(STORAGE_KEYS.MATCH_HISTORY, []);
      const storedFavs = browserStorage.getItem<string[]>(STORAGE_KEYS.FAVORITES, []);

      setTimeout(() => {
        setMatchHistory(storedHistory);
        setFavorites(storedFavs);

        // Set form default fields
        setEditUsername(user.username);
        setEditIGN(user.inGameName);
        setEditCharID(user.characterId);
        setEditBio(user.bio || '');
        setEditCountry(user.country || '');
        setEditState(user.state || '');
        setEditLanguage(user.preferredLanguage || '');
        setEditAvatar(user.avatarUrl || '');
        setEditCover(user.coverUrl || '');

        // Settings
        if (user.settings) {
          setNotifyUpdates(user.settings.notifications.tournamentUpdates);
          setNotifyReg(user.settings.notifications.registrationConfirmed);
          setNotifyPrize(user.settings.notifications.prizeReceived);
          setNotifyRefund(user.settings.notifications.refund);
          setNotifyAnnounce(user.settings.notifications.organizerAnnouncement);
          setNotifySys(user.settings.notifications.systemUpdate);
          setPrivacyStats(user.settings.privacy.showStats);
          setPrivacyHistory(user.settings.privacy.showMatchHistory);
          setPrivacySocials(user.settings.privacy.showSocialLinks);
          setThemePref(user.settings.themePreference || 'dark');
        }

        // Socials
        if (user.socialLinks) {
          setSocialInsta(user.socialLinks.instagram || '');
          setSocialYoutube(user.socialLinks.youtube || '');
          setSocialDiscord(user.socialLinks.discord || '');
          setSocialX(user.socialLinks.x || '');
        }
      }, 0);
    }
  }, [user]);

  // Profile completeness calculation
  const profileCompleteness = useMemo(() => {
    if (!user) return 0;
    let score = 0;
    const total = 6;
    
    if (user.avatarUrl) score++;
    if (user.coverUrl) score++;
    if (user.bio) score++;
    if (user.country) score++;
    if (user.socialLinks?.instagram || user.socialLinks?.youtube || user.socialLinks?.discord || user.socialLinks?.x) score++;
    if (user.characterId) score++;

    return Math.round((score / total) * 100);
  }, [user]);

  // Player specific results from local storage
  const playerResults = useMemo(() => {
    if (!user) return [];
    return results.filter((r) => r.participantId === user.id || (r.teamId && r.participantId === r.teamId));
  }, [results, user]);

  const latestResult = useMemo(() => {
    return playerResults.length > 0 ? playerResults[0] : null;
  }, [playerResults]);

  const latestStanding = useMemo(() => {
    if (!user) return null;
    return standings.find((s) => s.participantId === user.id || (s.teamId && s.participantId === s.teamId)) || null;
  }, [standings, user]);

  // Renders missing items list
  const missingItems = useMemo(() => {
    if (!user) return [];
    const missing = [];
    if (!user.coverUrl) missing.push('Cover Banner');
    if (!user.avatarUrl) missing.push('Profile Avatar');
    if (!user.bio) missing.push('Player Bio');
    if (!user.country) missing.push('Country Details');
    if (!user.socialLinks?.instagram && !user.socialLinks?.youtube && !user.socialLinks?.discord && !user.socialLinks?.x) {
      missing.push('Social Media Links');
    }
    return missing;
  }, [user]);

  // Progressive XP logic (Ace to Conqueror simulation)
  const playerXP = 4250; // mock total points
  const nextRankXP = 5000;
  const xpPercent = Math.round((playerXP / nextRankXP) * 100);

  // File Upload Previews (Base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) {
        alert('Image size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          setEditAvatar(reader.result as string);
        } else {
          setEditCover(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Frontend validations
    if (!editUsername.trim() || editUsername.length < 3) {
      alert('Username must be at least 3 characters.');
      return;
    }
    if (!editIGN.trim()) {
      alert('In-Game Name cannot be blank.');
      return;
    }
    if (!editCharID.trim() || !/^\d{5,15}$/.test(editCharID)) {
      alert('Character ID must be numeric (5-15 digits).');
      return;
    }
    if (editBio.length > 150) {
      alert('Bio must be less than 150 characters.');
      return;
    }

    // Save fields
    const updatedProfile: Partial<Player> = {
      username: editUsername,
      inGameName: editIGN,
      characterId: editCharID,
      bio: editBio,
      country: editCountry,
      state: editState,
      preferredLanguage: editLanguage,
      avatarUrl: editAvatar,
      coverUrl: editCover,
      socialLinks: {
        instagram: socialInsta,
        youtube: socialYoutube,
        discord: socialDiscord,
        x: socialX,
      },
      settings: {
        notifications: {
          tournamentUpdates: notifyUpdates,
          registrationConfirmed: notifyReg,
          prizeReceived: notifyPrize,
          refund: notifyRefund,
          organizerAnnouncement: notifyAnnounce,
          systemUpdate: notifySys,
        },
        privacy: {
          showStats: privacyStats,
          showMatchHistory: privacyHistory,
          showSocialLinks: privacySocials,
        },
        themePreference: themePref,
      },
    };

    updateProfile(updatedProfile);

    // Write Phase 3 specific key duplicates as requested
    browserStorage.setItem(STORAGE_KEYS.SETTINGS, updatedProfile.settings);

    alert('VONK profile settings saved successfully!');
    setActiveTab('overview');
  };

  // Favorites logic toggle
  const handleToggleFavorite = (tournamentId: string) => {
    const updated = favorites.includes(tournamentId)
      ? favorites.filter((id) => id !== tournamentId)
      : [...favorites, tournamentId];

    setFavorites(updated);
    browserStorage.setItem(STORAGE_KEYS.FAVORITES, updated);
  };

  // Filter Match History and bookmarked
  const searchedMatches = useMemo(() => {
    return matchHistory.filter((mh) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        mh.tournamentName.toLowerCase().includes(query) ||
        mh.mode.toLowerCase().includes(query) ||
        mh.map.toLowerCase().includes(query)
      );
    });
  }, [matchHistory, searchQuery]);

  const searchedAchievements = useMemo(() => {
    if (!user) return [];
    return user.achievements.filter((ach) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return ach.title.toLowerCase().includes(query) || ach.description.toLowerCase().includes(query);
    });
  }, [user, searchQuery]);

  // Registered Lobbies Category tabs
  const myRegistrations = useMemo(() => {
    // Find all registrations for this user player
    if (!user) return [];
    const allRegs = browserStorage.getItem<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
    return allRegs.filter((reg) => reg.playerId === user.id);
  }, [user]);

  const userLobbies = useMemo(() => {
    const list: (Tournament & { slotNumber?: number; regStatus: string })[] = [];
    myRegistrations.forEach((reg) => {
      const tour = tournaments.find((t) => t.id === reg.tournamentId);
      if (tour) {
        list.push({
          ...tour,
          slotNumber: reg.slotNumber,
          regStatus: reg.status,
        });
      }
    });
    return list;
  }, [myRegistrations, tournaments]);

  const registeredTabs = useMemo(() => {
    const upcoming = userLobbies.filter((l) => l.status === 'Upcoming' || l.status === 'Registration Open' || l.status === 'Filling Fast' || l.status === 'Registration Closed');
    const live = userLobbies.filter((l) => l.status === 'Live' || l.status === 'Room Released');
    const completed = userLobbies.filter((l) => l.status === 'Completed' || l.status === 'Result Pending');
    const cancelled = userLobbies.filter((l) => l.status === 'Cancelled' || l.status === 'Refunded');

    return { upcoming, live, completed, cancelled };
  }, [userLobbies]);

  // Bookmarked Tournaments list
  const bookmarkedTournamentsList = useMemo(() => {
    return tournaments.filter((t) => favorites.includes(t.id));
  }, [tournaments, favorites]);

  // Recommended tournaments
  const recommendedTournaments = useMemo(() => {
    if (!user) return tournaments.slice(0, 3);
    // filter by player level matching or squad mode
    return tournaments
      .filter((t) => t.level === user.rank.currentRank || t.mode === 'Squad')
      .slice(0, 3);
  }, [tournaments, user]);

  const handleSharePlayerCard = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(`${window.location.origin}/profile/${user?.username}`);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 my-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mb-4" />
        <h2 className="text-sm font-bold text-muted">Retrieving player profile...</h2>
      </div>
    );
  }

  // Pure SVG Performance Chart Rendering logic
  const renderSVGChart = () => {
    // Render static grid lines and custom paths depending on tab
    let points: { x: number; y: number; label: string; value: number }[] = [];
    if (chartMetric === 'kills') {
      points = [
        { x: 50, y: 150, label: 'Match 1', value: 8 },
        { x: 150, y: 190, label: 'Match 2', value: 4 },
        { x: 250, y: 110, label: 'Match 3', value: 12 },
        { x: 350, y: 210, label: 'Match 4', value: 2 },
      ];
    } else if (chartMetric === 'placements') {
      // lower y coordinate = better placement (1st place at top)
      points = [
        { x: 50, y: 60, label: 'Match 1', value: 1 },
        { x: 150, y: 120, label: 'Match 2', value: 5 },
        { x: 250, y: 80, label: 'Match 3', value: 2 },
        { x: 350, y: 220, label: 'Match 4', value: 14 },
      ];
    } else {
      points = [
        { x: 50, y: 100, label: 'Match 1', value: 1500 },
        { x: 150, y: 230, label: 'Match 2', value: 0 },
        { x: 250, y: 160, label: 'Match 3', value: 800 },
        { x: 350, y: 230, label: 'Match 4', value: 0 },
      ];
    }

    const pathData = points.reduce((acc, p, idx) => {
      return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
    }, '');

    return (
      <svg className="w-full h-64 bg-[#0a0a0f] border border-card-border rounded-xl p-4" viewBox="0 0 400 260">
        {/* Horizontal grid lines */}
        <line x1="30" y1="60" x2="380" y2="60" stroke="#1f2937" strokeDasharray="3,3" />
        <line x1="30" y1="120" x2="380" y2="120" stroke="#1f2937" strokeDasharray="3,3" />
        <line x1="30" y1="180" x2="380" y2="180" stroke="#1f2937" strokeDasharray="3,3" />
        <line x1="30" y1="230" x2="380" y2="230" stroke="#374151" />

        {/* Path line */}
        <path d={pathData} fill="none" stroke={chartMetric === 'placements' ? '#8b5cf6' : '#00ff66'} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots & tooltips */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="5.5"
              fill={chartMetric === 'placements' ? '#8b5cf6' : '#00ff66'}
              className="hover:scale-125 transition-transform"
            />
            {/* Label */}
            <text x={p.x} y="250" textAnchor="middle" fill="#64748b" className="text-[9px] font-bold uppercase">
              {p.label}
            </text>
            {/* Value overlay */}
            <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#f8fafc" className="text-[10px] font-bold font-mono bg-card-bg">
              {chartMetric === 'winnings' ? `₹${p.value}` : chartMetric === 'placements' ? `#${p.value}` : `${p.value} K`}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-20 px-4 md:px-0 pt-4">
      {/* cover banner header */}
      <div className="relative rounded-3xl border border-card-border bg-[#0d0d12] overflow-hidden group">
        <div className="h-44 md:h-56 w-full bg-slate-950 relative">
          {editCover ? (
            <img src={editCover} alt="Cover Banner" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-card-bg via-[#0c0d12] to-secondary/10 opacity-70" />
          )}

          {activeTab === 'settings' && (
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 p-2 rounded-xl bg-background/80 hover:bg-background border border-card-border text-foreground transition-all active:scale-95"
            >
              <Camera className="h-4 w-4" />
            </button>
          )}

          {/* Hidden input */}
          <input
            type="file"
            ref={coverInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'cover')}
          />
        </div>

        {/* Profile Card Overlay */}
        <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-12 md:-mt-16 relative z-10">
          <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-2xl border-4 border-[#08080c] bg-slate-900 overflow-hidden shrink-0 group">
            {editAvatar ? (
              <img src={editAvatar} alt={user.inGameName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-card-bg text-muted">
                <User className="h-10 w-10 opacity-30" />
              </div>
            )}

            {activeTab === 'settings' && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 bg-background/60 hover:bg-background/85 flex items-center justify-center text-foreground transition-all"
              >
                <Camera className="h-5 w-5" />
              </button>
            )}

            <input
              type="file"
              ref={avatarInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'avatar')}
            />
          </div>

          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-1 mb-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black tracking-tight">{user.inGameName}</h2>
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>
            <p className="text-xs text-muted font-bold font-mono">ID: {user.characterId}</p>
            <p className="text-xs text-foreground/80 max-w-sm mt-1 leading-relaxed">
              {user.bio || 'Add a professional player bio inside settings!'}
            </p>
          </div>

          {/* Quick Stats Overlays */}
          <div className="shrink-0 flex items-center gap-3">
            <LevelBadge level={user.rank.currentRank} />
            <span className="px-3 py-1.5 rounded-full border border-card-border bg-[#09090d] text-xs font-mono font-bold text-gradient-prize">
              ₹{balance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-card-border overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'stats' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Performance & Stats
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'matches' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          My Matches
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'saved' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Saved Lobbies
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Settings
        </button>
      </div>

      {/* SEARCH BAR (Global search inside profile tabs) */}
      {activeTab !== 'settings' && (
        <div className="relative max-w-md w-full px-4 md:px-0">
          <Search className="absolute left-7 md:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <input
            type="text"
            placeholder="Search past matches, achievements, saved tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card-bg border border-card-border rounded-xl text-xs text-foreground focus:border-primary/50 focus:outline-none"
          />
        </div>
      )}

      {/* MAIN CONTENT PANES */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Completeness & Player card & Socials) */}
          <div className="flex flex-col gap-6">
            {/* Completeness */}
            <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted">Profile Completeness:</span>
                <span className="text-primary">{profileCompleteness}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#171720] rounded-full overflow-hidden border border-card-border">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${profileCompleteness}%` }} />
              </div>
              {missingItems.length > 0 && (
                <p className="text-[10px] text-muted">
                  Missing: <strong className="text-foreground">{missingItems.join(', ')}</strong>
                </p>
              )}
            </div>

            {/* DIGITAL PLAYER ID CARD */}
            <div className="rounded-2xl border border-card-border bg-gradient-to-b from-[#111116] to-[#08080a] p-5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10" />
              <div className="flex justify-between items-center border-b border-card-border pb-3 mb-4">
                <span className="text-[10px] font-extrabold uppercase text-primary tracking-widest">VONK Player Card</span>
                <span className="text-[9px] font-mono text-muted uppercase">VERIFIED LOBBY ID</span>
              </div>

              <div className="flex gap-4 items-center mb-6">
                <div className="h-16 w-16 rounded-xl border border-card-border bg-slate-900 overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <h4 className="text-sm font-black text-foreground">{user.inGameName}</h4>
                  <span className="text-[10px] font-bold text-muted font-mono">{user.characterId}</span>
                  <LevelBadge level={user.rank.currentRank} className="mt-0.5" />
                </div>
              </div>

              {/* Specs columns */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-6 border-t border-b border-card-border/50 py-3 bg-muted-bg/30 px-2 rounded-xl">
                <div>
                  <p className="text-[9px] font-bold text-muted uppercase">Leaderboard Pos</p>
                  <p className="font-extrabold text-foreground">#{user.rank.leaderboardPosition}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-muted uppercase">Favorite Mode</p>
                  <p className="font-extrabold text-foreground">{user.stats.favoriteMode}</p>
                </div>
              </div>

              {/* QR and Code */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-bold text-muted uppercase">Card ID:</span>
                  <span className="text-[9px] font-mono text-foreground/80 font-bold">VNK-32890-SLY</span>
                </div>
                <QrCode className="h-8 w-8 text-foreground opacity-60" />
              </div>

              {/* Card Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-card-border/50">
                <button
                  onClick={handleSharePlayerCard}
                  className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-card-border bg-card-bg/60 hover:bg-card-bg text-[10px] font-bold text-foreground transition-all touch-target"
                >
                  {copiedCard ? <Check className="h-3 w-3 text-primary" /> : <Share2 className="h-3 w-3" />}
                  <span>{copiedCard ? 'Copied' : 'Share ID'}</span>
                </button>
                <button
                  onClick={() => alert('Player card downloaded locally. Available in offline gallery.')}
                  className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-background text-[10px] font-bold transition-all touch-target"
                >
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Social Links Panel */}
            <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-muted">Social Channels</span>
              <div className="flex flex-col gap-2">
                {user.socialLinks?.instagram && (
                  <a
                    href={user.socialLinks.instagram}
                    target="_blank"
                    className="flex items-center justify-between text-xs text-foreground/80 hover:text-primary transition-all p-2 rounded-lg border border-card-border bg-muted-bg/30"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                      Instagram
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted" />
                  </a>
                )}
                {user.socialLinks?.youtube && (
                  <a
                    href={user.socialLinks.youtube}
                    target="_blank"
                    className="flex items-center justify-between text-xs text-foreground/80 hover:text-primary transition-all p-2 rounded-lg border border-card-border bg-muted-bg/30"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/><polygon points="10 15 15 12 10 9"/></svg>
                      YouTube
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted" />
                  </a>
                )}
                {user.socialLinks?.discord && (
                  <a
                    href={user.socialLinks.discord}
                    target="_blank"
                    className="flex items-center justify-between text-xs text-foreground/80 hover:text-primary transition-all p-2 rounded-lg border border-card-border bg-muted-bg/30"
                  >
                    <span className="flex items-center gap-2">
                      <Tv className="h-4 w-4 text-indigo-400" />
                      Discord Server
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted" />
                  </a>
                )}
                {user.socialLinks?.x && (
                  <a
                    href={user.socialLinks.x}
                    target="_blank"
                    className="flex items-center justify-between text-xs text-foreground/80 hover:text-primary transition-all p-2 rounded-lg border border-card-border bg-muted-bg/30"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                      X (Twitter)
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Columns (Achievements & Badges showcase) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Tournament Performance scorecard */}
            <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-card-border/40 pb-3">
                <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-primary" />
                  Tournament Performance Scorecard
                </span>
                
                <Link 
                  href="/results" 
                  className="text-[10px] font-black text-primary hover:text-yellow-500 uppercase tracking-wider transition-all"
                >
                  View Career Hall &rarr;
                </Link>
              </div>

              {latestResult ? (
                <div className="space-y-4 text-xs">
                  {/* Grid of latest performance highlights */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 bg-black/25 border border-card-border rounded-xl space-y-0.5">
                      <span className="text-[8px] font-bold text-muted uppercase">Latest Placement</span>
                      <span className="font-extrabold text-foreground block font-mono">#{latestResult.placement}</span>
                    </div>
                    <div className="p-2.5 bg-black/25 border border-card-border rounded-xl space-y-0.5">
                      <span className="text-[8px] font-bold text-muted uppercase">Latest Kills</span>
                      <span className="font-extrabold text-foreground block font-mono">{latestResult.kills}</span>
                    </div>
                    <div className="p-2.5 bg-black/25 border border-card-border rounded-xl space-y-0.5">
                      <span className="text-[8px] font-bold text-muted uppercase font-mono">Total Points</span>
                      <span className="font-black text-primary block">{latestResult.totalPoints} Pts</span>
                    </div>
                    <div className="p-2.5 bg-black/25 border border-card-border rounded-xl space-y-0.5">
                      <span className="text-[8px] font-bold text-muted uppercase">Rank Change</span>
                      {latestStanding ? (
                        <span className={`font-extrabold block font-mono ${latestStanding.rankChange > 0 ? 'text-green-400' : latestStanding.rankChange < 0 ? 'text-red-400' : 'text-foreground'}`}>
                          {latestStanding.rankChange > 0 ? `+${latestStanding.rankChange}` : latestStanding.rankChange || '0'}
                        </span>
                      ) : (
                        <span className="font-extrabold text-foreground block font-mono">STABLE</span>
                      )}
                    </div>
                  </div>

                  {/* Standings status indicator */}
                  {latestStanding && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-muted font-bold block">Current Tournament Standings Rank</span>
                        <span className="font-black text-foreground">Rank #{latestStanding.rank} Overall</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                        latestStanding.qualificationStatus === 'WINNER' || latestStanding.qualificationStatus === 'ADVANCING'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {latestStanding.qualificationStatus}
                      </span>
                    </div>
                  )}

                  {/* List of recent results rows */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-muted uppercase">Recent Match logs</span>
                    {playerResults.slice(0, 2).map((res) => (
                      <div key={res.id} className="flex justify-between items-center p-2 bg-black/20 border border-card-border/60 rounded-lg text-[11px]">
                        <span className="font-bold truncate max-w-[150px]">{res.roundId || 'Stage 1'}</span>
                        <span className="font-mono text-muted">#{res.placement} Place • {res.kills} Kills &rarr; <strong className="text-primary">{res.totalPoints} Pts</strong></span>
                      </div>
                    ))}
                  </div>

                </div>
              ) : (
                <div className="text-center py-6 text-[11px] text-muted border border-dashed border-card-border rounded-xl bg-card-bg/20">
                  No competitive results registered for your profile yet. Participate in active lobbies to log scores!
                </div>
              )}
            </div>

            {/* Badges showcase */}
            <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-muted">Premium Badges</span>
              <div className="flex flex-wrap gap-2.5">
                {user.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-secondary/10 border border-secondary/25 text-secondary font-black uppercase text-[10px] tracking-wider rounded-lg"
                  >
                    🏆 {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Achievements List */}
            <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4">
              <span className="text-xs uppercase font-extrabold tracking-wider text-muted">Player Achievements</span>
              {searchedAchievements.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {searchedAchievements.map((ach) => (
                    <div
                      key={ach.id}
                      className={`p-3.5 rounded-xl border border-card-border flex gap-3.5 items-center relative overflow-hidden ${
                        ach.progress === 100 ? 'bg-primary/[0.02]' : 'bg-[#09090d]'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{ach.badge}</span>
                      <div className="flex-1 flex flex-col gap-1.5 text-left">
                        <div className="flex justify-between items-center text-xs">
                          <h4 className="font-bold text-foreground/90">{ach.title}</h4>
                          {ach.progress === 100 ? (
                            <span className="text-[9px] font-extrabold text-primary uppercase">UNLOCKED</span>
                          ) : (
                            <span className="text-[9px] font-mono text-muted">{ach.progress}%</span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted leading-tight">{ach.description}</p>
                        
                        {/* Progress bar */}
                        <div className="w-full h-1 bg-[#171720] rounded-full overflow-hidden border border-card-border/50">
                          <div className={`h-full rounded-full ${ach.progress === 100 ? 'bg-primary' : 'bg-secondary'}`} style={{ width: `${ach.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted text-center py-4">No matching achievements found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED STATS & PERFORMANCE CHARTS */}
      {activeTab === 'stats' && (
        <div className="flex flex-col gap-6">
          {/* Progressive Level Badge Indicator bar */}
          <div className="rounded-2xl border border-card-border bg-[#0a0a0f] p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-muted flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                VONK Ranks Level Progressive XP
              </span>
              <span className="text-primary font-mono">{playerXP} / {nextRankXP} pts to Conqueror</span>
            </div>
            <div className="w-full h-2.5 bg-[#171720] rounded-full overflow-hidden border border-card-border">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-card-border bg-card-bg/40 text-center">
              <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Matches Played</p>
              <p className="text-lg font-black text-foreground font-mono">{user.stats.matchesPlayed}</p>
            </div>
            <div className="p-4 rounded-xl border border-card-border bg-card-bg/40 text-center">
              <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Wins</p>
              <p className="text-lg font-black text-primary font-mono">{user.stats.wins}</p>
            </div>
            <div className="p-4 rounded-xl border border-card-border bg-card-bg/40 text-center">
              <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Headshots</p>
              <p className="text-lg font-black text-foreground font-mono">{user.stats.headshots}</p>
            </div>
            <div className="p-4 rounded-xl border border-card-border bg-card-bg/40 text-center">
              <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">K/D Ratio</p>
              <p className="text-lg font-black text-gradient-prize font-mono">{user.stats.kdRatio}</p>
            </div>
            <div className="p-4 rounded-xl border border-card-border bg-card-bg/40 text-center">
              <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Top 3 Finishes</p>
              <p className="text-lg font-black text-foreground font-mono">{user.stats.top3Finishes}</p>
            </div>
            <div className="p-4 rounded-xl border border-card-border bg-card-bg/40 text-center">
              <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Top 10 Finishes</p>
              <p className="text-lg font-black text-foreground font-mono">{user.stats.top10Finishes}</p>
            </div>
            <div className="p-4 rounded-xl border border-card-border bg-card-bg/40 text-center">
              <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">MVP Awards</p>
              <p className="text-lg font-black text-secondary font-mono">{user.stats.mvpAwards}</p>
            </div>
            <div className="p-4 rounded-xl border border-card-border bg-card-bg/40 text-center">
              <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Total Prize Won</p>
              <p className="text-lg font-black text-gradient-prize font-mono">₹{user.stats.totalPrizeWon}</p>
            </div>
          </div>

          {/* PERFORMANCE CHARTS */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-card-border pb-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-primary" />
                Performance Charts
              </span>
              <div className="flex gap-2 bg-[#09090d] p-1 rounded-lg border border-card-border">
                <button
                  onClick={() => setChartMetric('kills')}
                  className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all ${
                    chartMetric === 'kills' ? 'bg-primary text-background' : 'text-muted hover:text-foreground'
                  }`}
                >
                  Kills
                </button>
                <button
                  onClick={() => setChartMetric('placements')}
                  className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all ${
                    chartMetric === 'placements' ? 'bg-primary text-background' : 'text-muted hover:text-foreground'
                  }`}
                >
                  Placements
                </button>
                <button
                  onClick={() => setChartMetric('winnings')}
                  className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all ${
                    chartMetric === 'winnings' ? 'bg-primary text-background' : 'text-muted hover:text-foreground'
                  }`}
                >
                  Winnings
                </button>
              </div>
            </div>

            {/* SVG Render */}
            {renderSVGChart()}
          </div>
        </div>
      )}

      {/* TAB 3: MY MATCHES / REGISTERED LOBBIES */}
      {activeTab === 'matches' && (
        <div className="flex flex-col gap-8">
          {/* Registered Lobbies Section */}
          <div className="flex flex-col gap-4 text-left">
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5 border-b border-card-border pb-3">
              <Trophy className="h-4 w-4 text-primary" />
              Registered Tournaments
            </span>

            {/* Sub Tabs Selection */}
            <div className="flex gap-2 bg-[#09090d] p-1 rounded-xl border border-card-border w-fit">
              {(['upcoming', 'live', 'completed', 'cancelled'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMyTournamentsTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    myTournamentsTab === tab ? 'bg-primary text-background' : 'text-muted hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sub Tab Lobbies list */}
            {registeredTabs[myTournamentsTab].length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {registeredTabs[myTournamentsTab].map((lobby) => (
                  <div key={lobby.id} className="p-4 rounded-2xl border border-card-border bg-[#0d0d12]/40 flex flex-col gap-4 hover:border-card-hover-border transition-all">
                    <div className="flex gap-3">
                      <div className="h-16 w-16 rounded-xl bg-card-bg overflow-hidden shrink-0">
                        <img src={lobby.banner} alt={lobby.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <h4 className="text-xs font-black text-foreground line-clamp-1">{lobby.title}</h4>
                        <div className="flex flex-wrap gap-2 text-[9px] font-bold text-muted uppercase mt-0.5">
                          <span>Fee: ₹{lobby.entryFee}</span>
                          <span>•</span>
                          <span className="text-gradient-prize">Prize: ₹{lobby.prizePool}</span>
                        </div>
                        {/* Reg Status Badge */}
                        <div className="mt-1">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            lobby.regStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            Status: {lobby.regStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Details */}
                    <div className="flex flex-col gap-1.5 pt-3 border-t border-card-border/50 text-[10px] text-muted">
                      <div className="flex justify-between">
                        <span>Room Status:</span>
                        <span className="font-extrabold text-foreground">
                          {lobby.status === 'Room Released' ? 'Credentials Released' : 'Release Pending'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Result Status:</span>
                        <span className="font-extrabold text-foreground">
                          {lobby.status === 'Completed' ? 'Published' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted text-center py-6 bg-card-bg/10 border border-dashed border-card-border rounded-2xl">
                No registered tournaments found in {myTournamentsTab} lobbies.
              </p>
            )}
          </div>

          {/* Match History (Past results) */}
          <div className="flex flex-col gap-4 text-left">
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5 border-b border-card-border pb-3">
              <History className="h-4 w-4 text-primary" />
              Match Results history
            </span>
            
            {searchedMatches.length > 0 ? (
              <div className="flex flex-col gap-3">
                {searchedMatches.map((mh) => (
                  <div
                    key={mh.id}
                    className="p-4 rounded-2xl border border-card-border bg-card-bg/40 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-card-hover-border transition-all"
                  >
                    <div className="flex flex-col gap-1 text-left">
                      <h4 className="text-sm font-bold text-foreground">{mh.tournamentName}</h4>
                      <div className="flex gap-4 text-[10px] font-bold text-muted uppercase mt-0.5">
                        <span>Mode: {mh.mode}</span>
                        <span className="border-l border-card-border/50 pl-4">Map: {mh.map}</span>
                        <span className="border-l border-card-border/50 pl-4">
                          Date: {new Date(mh.date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                      <div className="flex gap-4 font-mono font-bold text-right">
                        <div>
                          <p className="text-[9px] font-semibold text-muted uppercase">Kills</p>
                          <p className="text-foreground">{mh.kills}</p>
                        </div>
                        <div className="border-l border-card-border/50 pl-4">
                          <p className="text-[9px] font-semibold text-muted uppercase">Placement</p>
                          <p className="text-foreground">#{mh.placement}</p>
                        </div>
                        <div className="border-l border-card-border/50 pl-4">
                          <p className="text-[9px] font-semibold text-muted uppercase">Winnings</p>
                          <p className="text-gradient-prize">₹{mh.prizeWon}</p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                          mh.status === 'Win' ? 'bg-primary/10 text-primary' : 'bg-muted-bg text-muted'
                        }`}
                      >
                        {mh.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted text-center py-6 bg-card-bg/20 border border-dashed border-card-border rounded-xl">
                No past match entries recorded.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SAVED LOBBIES */}
      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Favorites List - Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5 border-b border-card-border pb-3">
              <Bookmark className="h-4 w-4 text-primary fill-primary/10" />
              Bookmarked Tournaments ({bookmarkedTournamentsList.length})
            </span>

            {bookmarkedTournamentsList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {bookmarkedTournamentsList.map((t) => (
                  <div key={t.id} className="relative">
                    <button
                      onClick={() => handleToggleFavorite(t.id)}
                      className="absolute top-3 right-3 z-20 p-2 bg-background/80 hover:bg-background rounded-full border border-card-border text-danger transition-all active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <TournamentCard tournament={t} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-card-border rounded-2xl bg-card-bg/10 flex flex-col items-center gap-3">
                <Bookmark className="h-10 w-10 text-muted opacity-30" />
                <h4 className="text-xs font-bold text-foreground">No Bookmarks Saved</h4>
                <p className="text-[11px] text-muted max-w-xs mx-auto">
                  Click the bookmark icon or toggle favorites inside Explore boards to follow matches.
                </p>
              </div>
            )}
          </div>

          {/* Recommended list - Right Column */}
          <div className="flex flex-col gap-4 border-l-0 lg:border-l lg:border-card-border lg:pl-6">
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted border-b border-card-border pb-3 flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-primary" />
              Recommended Scrims
            </span>
            <div className="flex flex-col gap-4">
              {recommendedTournaments.map((t) => (
                <div key={t.id} className="p-3 bg-[#0a0a0f] border border-card-border rounded-xl flex gap-3 items-center">
                  <div className="h-12 w-12 rounded-lg bg-card-bg overflow-hidden shrink-0">
                    <img src={t.banner} alt={t.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col text-left">
                    <Link href={`${ROUTES.TOURNAMENTS}/${t.slug}`} className="text-xs font-bold text-foreground line-clamp-1 hover:text-primary transition-colors">
                      {t.title}
                    </Link>
                    <p className="text-[9px] text-muted font-bold uppercase mt-0.5">Prize: ₹{t.prizePool} • Fee: ₹{t.entryFee}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PROFILE EDIT SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveProfile} className="max-w-2xl mx-auto w-full rounded-2xl border border-card-border bg-card-bg/40 p-5 md:p-6 flex flex-col gap-6 text-left">
          <div className="flex items-center gap-2 border-b border-card-border pb-3">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">Edit Player Settings</h3>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Username</label>
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">In-Game Name (IGN)</label>
              <input
                type="text"
                value={editIGN}
                onChange={(e) => setEditIGN(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">BGMI Character ID</label>
              <input
                type="text"
                value={editCharID}
                onChange={(e) => setEditCharID(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Preferred Language</label>
              <input
                type="text"
                value={editLanguage}
                onChange={(e) => setEditLanguage(e.target.value)}
                placeholder="e.g. English, Hindi"
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Country</label>
              <input
                type="text"
                value={editCountry}
                onChange={(e) => setEditCountry(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">State</label>
              <input
                type="text"
                value={editState}
                onChange={(e) => setEditState(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Bio (Max 150 Chars)</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              maxLength={150}
              rows={3}
              className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
            />
          </div>

          {/* Social Links Form */}
          <div className="flex flex-col gap-4 border-t border-card-border pt-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted">Social Accounts</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Instagram URL</label>
                <input
                  type="text"
                  value={socialInsta}
                  onChange={(e) => setSocialInsta(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">YouTube URL</label>
                <input
                  type="text"
                  value={socialYoutube}
                  onChange={(e) => setSocialYoutube(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Discord Invitation</label>
                <input
                  type="text"
                  value={socialDiscord}
                  onChange={(e) => setSocialDiscord(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">X (Twitter) URL</label>
                <input
                  type="text"
                  value={socialX}
                  onChange={(e) => setSocialX(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Privacy preferences */}
          <div className="flex flex-col gap-4 border-t border-card-border pt-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-primary" />
              Privacy Preferences
            </span>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground/80">Show my statistics on profile</span>
                <input
                  type="checkbox"
                  checked={privacyStats}
                  onChange={(e) => setPrivacyStats(e.target.checked)}
                  className="rounded border-card-border text-primary focus:ring-primary h-4 w-4 bg-[#0a0a0f]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground/80">Show my match history on profile</span>
                <input
                  type="checkbox"
                  checked={privacyHistory}
                  onChange={(e) => setPrivacyHistory(e.target.checked)}
                  className="rounded border-card-border text-primary focus:ring-primary h-4 w-4 bg-[#0a0a0f]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground/80">Show social channels to public</span>
                <input
                  type="checkbox"
                  checked={privacySocials}
                  onChange={(e) => setPrivacySocials(e.target.checked)}
                  className="rounded border-card-border text-primary focus:ring-primary h-4 w-4 bg-[#0a0a0f]"
                />
              </div>
            </div>
          </div>

          {/* Notification toggles */}
          <div className="flex flex-col gap-4 border-t border-card-border pt-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-secondary" />
              Notification Settings
            </span>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground/80">Tournament schedule updates</span>
                <input
                  type="checkbox"
                  checked={notifyUpdates}
                  onChange={(e) => setNotifyUpdates(e.target.checked)}
                  className="rounded border-card-border text-primary focus:ring-primary h-4 w-4 bg-[#0a0a0f]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground/80">Registration confirmation emails</span>
                <input
                  type="checkbox"
                  checked={notifyReg}
                  onChange={(e) => setNotifyReg(e.target.checked)}
                  className="rounded border-card-border text-primary focus:ring-primary h-4 w-4 bg-[#0a0a0f]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground/80">Prize credit deposits alert</span>
                <input
                  type="checkbox"
                  checked={notifyPrize}
                  onChange={(e) => setNotifyPrize(e.target.checked)}
                  className="rounded border-card-border text-primary focus:ring-primary h-4 w-4 bg-[#0a0a0f]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground/80">Cancellations refund deposit logs</span>
                <input
                  type="checkbox"
                  checked={notifyRefund}
                  onChange={(e) => setNotifyRefund(e.target.checked)}
                  className="rounded border-card-border text-primary focus:ring-primary h-4 w-4 bg-[#0a0a0f]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 bg-primary hover:bg-primary/95 text-background font-black text-xs tracking-wider rounded-xl transition-all shadow-md active:scale-95 glow-primary"
          >
            Save Profile Configuration
          </button>
        </form>
      )}
    </div>
  );
}
