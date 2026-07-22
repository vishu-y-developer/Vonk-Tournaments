import { Tournament, Player, Team, Registration, WalletTransaction, Dispute, Notification, MatchResult, MatchHistory, TeamInvitation, TeamJoinRequest, TeamActivity } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { browserStorage } from './browser-storage';

export function seedDatabase(): void {
  // 1. Mock Player Profile (User)
  const defaultPlayer: Player = {
    id: 'user-player-1',
    username: 'soul_slayer',
    inGameName: 'VONK⚡Slayer',
    characterId: '5819384729',
    level: 'Ace',
    walletBalance: 750,
    avatarUrl: '', // Base64 or placeholder
    coverUrl: '',
    bio: 'BGMI Assaulter & Headshot Expert. Playing competitive matches since 2024. Competing in Pro lobbies.',
    country: 'India',
    state: 'Delhi',
    preferredLanguage: 'English',
    dateJoined: '2026-06-01T12:00:00Z',
    onlineStatus: 'Online',
    rank: {
      currentRank: 'Ace',
      previousRank: 'Crown',
      highestRank: 'Conqueror',
      rankChange: 'UP',
      leaderboardPosition: 145,
    },
    stats: {
      matchesPlayed: 32,
      wins: 8,
      top3Finishes: 12,
      top10Finishes: 24,
      totalKills: 142,
      totalDamage: 48900,
      kdRatio: 4.44,
      avgPlacement: 4.2,
      winRate: 25.0,
      headshots: 38,
      mvpAwards: 4,
      tournamentsPlayed: 12,
      tournamentsWon: 3,
      totalPrizeWon: 3200,
      favoriteMode: 'Squad',
      favoriteMap: 'Erangel',
    },
    achievements: [
      { id: 'ach-1', badge: '🎯', title: 'First Victory', description: 'Unlock your first match victory.', unlockedDate: '2026-06-15T10:00:00Z', progress: 100 },
      { id: 'ach-2', badge: '🔥', title: 'Kill Machine', description: 'Accumulate 100 kills in tournaments.', unlockedDate: '2026-07-02T14:30:00Z', progress: 100 },
      { id: 'ach-3', badge: '👑', title: 'Champion', description: 'Win 3 high-tier tournaments.', unlockedDate: '2026-07-15T19:00:00Z', progress: 100 },
      { id: 'ach-4', badge: '💎', title: 'Diamond Player', description: 'Reach Diamond tier rank.', unlockedDate: '2026-06-25T11:00:00Z', progress: 100 },
      { id: 'ach-5', badge: '⚡', title: '100 Matches', description: 'Complete 100 match entries.', progress: 32 },
      { id: 'ach-6', badge: '🎯', title: 'Headshot Expert', description: 'Accumulate 50 headshots.', progress: 76 },
      { id: 'ach-7', badge: '🥇', title: 'Tournament Winner', description: 'Win any official custom scrim.', unlockedDate: '2026-06-15T10:00:00Z', progress: 100 },
      { id: 'ach-8', badge: '🏅', title: 'MVP Award', description: 'Get selected as MVP in a lobby.', unlockedDate: '2026-07-15T19:00:00Z', progress: 100 },
    ],
    badges: ['Verified', 'Beta User', 'Elite', 'Champion'],
    socialLinks: {
      instagram: 'https://instagram.com/soul_slayer',
      youtube: 'https://youtube.com/soul_slayer_gaming',
      discord: 'https://discord.gg/vonk',
      x: 'https://x.com/soul_slayer',
    },
    settings: {
      notifications: {
        tournamentUpdates: true,
        registrationConfirmed: true,
        prizeReceived: true,
        refund: true,
        organizerAnnouncement: true,
        systemUpdate: false,
      },
      privacy: {
        showStats: true,
        showMatchHistory: true,
        showSocialLinks: true,
      },
      themePreference: 'dark',
    },
  };

  const defaultMatchHistory: MatchHistory[] = [
    {
      id: 'mh-1',
      tournamentId: 'tour-5',
      tournamentName: 'VONK Ultimate Championship Phase 1',
      tournamentSlug: 'vonk-ultimate-championship-phase-1',
      date: '2026-07-15T18:00:00Z',
      mode: 'Squad',
      map: 'Erangel',
      kills: 8,
      placement: 1,
      points: 23,
      prizeWon: 1500,
      status: 'Win',
    },
    {
      id: 'mh-2',
      tournamentId: 'tour-3',
      tournamentName: 'VONK Pro Invitational Scrims',
      tournamentSlug: 'vonk-pro-invitational-scrims',
      date: '2026-07-10T19:00:00Z',
      mode: 'Squad',
      map: 'Sanhok',
      kills: 4,
      placement: 5,
      points: 10,
      prizeWon: 0,
      status: 'Loss',
    },
    {
      id: 'mh-3',
      tournamentId: 'tour-2',
      tournamentName: 'Miramar Sniper-Only Solo Arena',
      tournamentSlug: 'miramar-sniper-only-solo-arena',
      date: '2026-07-05T15:00:00Z',
      mode: 'Sniper Only',
      map: 'Miramar',
      kills: 12,
      placement: 2,
      points: 22,
      prizeWon: 800,
      status: 'Win',
    },
    {
      id: 'mh-4',
      tournamentId: 'tour-1',
      tournamentName: 'VONK Erangel Squad Showdown',
      tournamentSlug: 'vonk-erangel-squad-showdown',
      date: '2026-07-01T17:00:00Z',
      mode: 'Squad',
      map: 'Erangel',
      kills: 2,
      placement: 14,
      points: 2,
      prizeWon: 0,
      status: 'Loss',
    },
  ];

  const defaultFavorites = ['tour-1', 'tour-3'];

  // 2. Mock Teams
  const defaultTeams: Team[] = [
    {
      id: 'team-soul',
      name: 'Team SouL',
      shortName: 'SOUL',
      type: 'Squad',
      bio: 'Legendary BGMI lineup, competing since the beginning.',
      preferredMode: 'Squad',
      preferredMap: 'Erangel',
      skillLevel: 'Pro',
      region: 'India',
      language: 'Hindi',
      logoUrl: '',
      bannerUrl: '',
      colorTheme: '#10b981',
      tag: 'SOUL',
      motto: 'It\'s all about soul.',
      code: 'SOUL77',
      captainId: 'player-soul-cap',
      members: [
        { playerId: 'player-soul-cap', inGameName: 'SouL_Mortal', characterId: '5129384810', role: 'Captain', joinedAt: '2026-01-10T12:00:00Z' },
        { playerId: 'player-soul-2', inGameName: 'SouL_Viper', characterId: '5129384811', role: 'Sniper', joinedAt: '2026-01-11T12:00:00Z' },
        { playerId: 'player-soul-3', inGameName: 'SouL_Regaltos', characterId: '5129384812', role: 'Assaulter', joinedAt: '2026-01-12T12:00:00Z' },
        { playerId: 'player-soul-4', inGameName: 'SouL_Clutch', characterId: '5129384813', role: 'Support', joinedAt: '2026-01-13T12:00:00Z' },
      ],
      stats: {
        matches: 120,
        wins: 45,
        kills: 620,
        podiums: 85,
        kdRatio: 5.16,
        avgPlacement: 2.1,
        prizeWon: 25000,
        streak: 3
      },
      privacySettings: {
        publicTeam: true,
        showStats: true,
        allowJoinRequests: true,
        inviteOnly: false,
        showHistory: true,
        showCharacterIds: true,
        showOnlineStatus: true,
      },
      readinessStatus: 'Tournament Ready',
      activities: [
        { id: 'act-s1', type: 'MemberJoined', description: 'SouL_Clutch joined the squad.', timestamp: '2026-01-13T12:00:00Z' },
        { id: 'act-s2', type: 'ProfileUpdated', description: 'Team motto was updated.', timestamp: '2026-07-15T10:00:00Z' }
      ],
      achievements: [
        { id: 'ach-s1', title: 'First Squad Created', description: 'Formed a complete active roster.', unlockedDate: '2026-01-13T12:00:00Z', progress: 100, badge: '🎮' },
        { id: 'ach-s2', title: 'Tournament Champions', description: 'Win a high-tier championship scrim.', unlockedDate: '2026-07-15T19:00:00Z', progress: 100, badge: '👑' }
      ],
      tournamentHistory: [
        { tournamentId: 'tour-5', tournamentTitle: 'VONK Ultimate Championship', placement: 1, points: 28, winnings: 25000, date: '2026-07-15T18:00:00Z' },
      ],
    },
    {
      id: 'team-godl',
      name: 'GodLike Esports',
      shortName: 'GODL',
      type: 'Squad',
      bio: 'GodLike Esports, home of competitive champions.',
      preferredMode: 'Squad',
      preferredMap: 'Miramar',
      skillLevel: 'Pro',
      region: 'India',
      language: 'Hindi',
      logoUrl: '',
      bannerUrl: '',
      colorTheme: '#e02424',
      tag: 'GODL',
      motto: 'Champions by design.',
      code: 'GODL99',
      captainId: 'player-godl-cap',
      members: [
        { playerId: 'player-godl-cap', inGameName: 'GodL_JONATHAN', characterId: '5238472910', role: 'Captain', joinedAt: '2026-02-15T12:00:00Z' },
        { playerId: 'player-godl-2', inGameName: 'GodL_ZGOD', characterId: '5238472911', role: 'IGL', joinedAt: '2026-02-16T12:00:00Z' },
        { playerId: 'player-godl-3', inGameName: 'GodL_Neyoo', characterId: '5238472912', role: 'Entry Fragger', joinedAt: '2026-02-17T12:00:00Z' },
        { playerId: 'player-godl-4', inGameName: 'GodL_ClutchGod', characterId: '5238472913', role: 'Support', joinedAt: '2026-02-18T12:00:00Z' },
      ],
      stats: {
        matches: 150,
        wins: 50,
        kills: 840,
        podiums: 90,
        kdRatio: 5.6,
        avgPlacement: 2.3,
        prizeWon: 15000,
        streak: 1
      },
      privacySettings: {
        publicTeam: true,
        showStats: true,
        allowJoinRequests: true,
        inviteOnly: false,
        showHistory: true,
        showCharacterIds: true,
        showOnlineStatus: true,
      },
      readinessStatus: 'Tournament Ready',
      activities: [],
      achievements: [
        { id: 'ach-g1', title: 'First Squad Created', description: 'Formed a complete active roster.', unlockedDate: '2026-02-18T12:00:00Z', progress: 100, badge: '🎮' }
      ],
      tournamentHistory: [
        { tournamentId: 'tour-5', tournamentTitle: 'VONK Ultimate Championship', placement: 2, points: 20, winnings: 15000, date: '2026-07-15T18:00:00Z' },
      ],
    },
    {
      id: 'team-user',
      name: 'VONK Gladiators',
      shortName: 'VNK',
      type: 'Squad',
      bio: 'VONK community scrims squad, climbing ranks.',
      preferredMode: 'Squad',
      preferredMap: 'Erangel',
      skillLevel: 'Advanced',
      region: 'India',
      language: 'English',
      logoUrl: '',
      bannerUrl: '',
      colorTheme: '#8b5cf6',
      tag: 'VNK',
      motto: 'Slay and Conquer.',
      code: 'VONK12',
      captainId: 'user-player-1',
      members: [
        { playerId: 'user-player-1', inGameName: 'VONK⚡Slayer', characterId: '5819384729', role: 'Captain', joinedAt: '2026-07-18T10:00:00Z' },
        { playerId: 'mock-p-2', inGameName: 'VONK⚡Sniper', characterId: '5819384730', role: 'Sniper', joinedAt: '2026-07-18T11:00:00Z' },
      ],
      stats: {
        matches: 5,
        wins: 1,
        kills: 28,
        podiums: 2,
        kdRatio: 5.6,
        avgPlacement: 4.8,
        prizeWon: 0,
        streak: 0
      },
      privacySettings: {
        publicTeam: true,
        showStats: true,
        allowJoinRequests: true,
        inviteOnly: false,
        showHistory: true,
        showCharacterIds: true,
        showOnlineStatus: true,
      },
      readinessStatus: 'Incomplete',
      activities: [
        { id: 'act-u1', type: 'MemberJoined', description: 'VONK⚡Sniper joined the team.', timestamp: '2026-07-18T11:00:00Z' }
      ],
      achievements: [
        { id: 'ach-u1', title: 'First Squad Created', description: 'Formed a squad.', unlockedDate: '2026-07-18T10:00:00Z', progress: 100, badge: '🎮' }
      ],
      tournamentHistory: [],
    },
  ];

  // 3. Mock Tournaments
  const baseTime = new Date('2026-07-19T15:20:00.000Z');



  const addHours = (date: Date, hours: number) => {
    const res = new Date(date);
    res.setHours(res.getHours() + hours);
    return res.toISOString();
  };

  const defaultTournaments: Tournament[] = [
    {
      id: 'tour-1',
      title: 'VONK Erangel Squad Showdown',
      slug: 'vonk-erangel-squad-showdown',
      banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
      description: 'The ultimate Erangel Squad Battle. Bring your A-game, coordinate with your squad, and battle it out for the top spots. Full competitive custom room hosting.',
      game: 'BGMI',
      mode: 'Squad',
      map: 'Erangel',
      perspective: 'TPP',
      level: 'Intermediate',
      entryFee: 50,
      prizePool: 10000,
      prizePoolType: 'FIXED',
      platformFeePercentage: 10,
      perKillReward: 5,
      maxParticipants: 25,
      registeredParticipants: 18,
      teamSize: 4,
      substituteLimit: 1,
      registrationStart: addHours(baseTime, -48),
      registrationEnd: addHours(baseTime, 24),
      matchStart: addHours(baseTime, 26),
      roomReleaseTime: addHours(baseTime, 25.75), // 15 mins before match
      status: 'Registration Open',
      visibility: 'Public',
      organizer: 'VONK Official',
      rules: [
        'All matches will be played in Squad mode (TPP).',
        'Emulators are strictly blocked. iOS and Android only.',
        'Scores will be compiled within 2 hours of match completion.',
        'Dynamic points: 1 Kill = 1 Point.',
      ],
      scoringSystem: {
        pointsPerKill: 1,
        placementPoints: { 1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1, 10: 1 },
      },
      prizeDistribution: {
        placePercentages: { 1: 50, 2: 30, 3: 20 },
        perKillReward: 5,
        mvpReward: 500,
      },
      tags: ['Squad', 'Paid', 'Erangel'],
      featured: true,
      createdAt: addHours(baseTime, -72),
      updatedAt: addHours(baseTime, -48),
    },
    {
      id: 'tour-2',
      title: 'Miramar Sniper-Only Solo Arena',
      slug: 'miramar-sniper-only-solo-arena',
      banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
      description: 'Long-range snipers only in the vast desert of Miramar. One shot, one kill. Test your patience and accuracy.',
      game: 'BGMI',
      mode: 'Sniper Only',
      map: 'Miramar',
      perspective: 'FPP',
      level: 'Advanced',
      entryFee: 20,
      prizePool: 4000,
      prizePoolType: 'DYNAMIC',
      platformFeePercentage: 15,
      perKillReward: 2,
      maxParticipants: 100,
      registeredParticipants: 94,
      teamSize: 1,
      substituteLimit: 0,
      registrationStart: addHours(baseTime, -72),
      registrationEnd: addHours(baseTime, 1),
      matchStart: addHours(baseTime, 2),
      roomReleaseTime: addHours(baseTime, 1.75), // 15 mins before match
      status: 'Filling Fast',
      visibility: 'Public',
      organizer: 'Delta Gaming',
      rules: [
        'Bolt Action Rifles (M24, AWM, Kar98k) and DMRs only.',
        'Melee and throwing weapons are allowed, pistols are prohibited.',
        'Solo match. Team-up will result in a permanent ban.',
      ],
      scoringSystem: {
        pointsPerKill: 1,
        placementPoints: { 1: 15, 2: 10, 3: 8, 4: 6, 5: 5, 6: 4, 7: 3, 8: 2, 9: 1, 10: 1 },
      },
      prizeDistribution: {
        placePercentages: { 1: 60, 2: 30, 3: 10 },
      },
      tags: ['Solo', 'Sniper', 'Miramar', 'Dynamic'],
      featured: false,
      createdAt: addHours(baseTime, -96),
      updatedAt: addHours(baseTime, -72),
    },
    {
      id: 'tour-3',
      title: 'VONK Pro Invitational Scrims',
      slug: 'vonk-pro-invitational-scrims',
      banner: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=600&auto=format&fit=crop',
      description: 'Private custom lobbies for Pro level players and teams. Direct invitation required. Free entry with massive cash rewards.',
      game: 'BGMI',
      mode: 'Squad',
      map: 'Sanhok',
      perspective: 'TPP',
      level: 'Pro',
      entryFee: 0,
      prizePool: 25000,
      prizePoolType: 'FIXED',
      platformFeePercentage: 0,
      perKillReward: 10,
      maxParticipants: 20,
      registeredParticipants: 14,
      teamSize: 4,
      substituteLimit: 2,
      registrationStart: addHours(baseTime, -24),
      registrationEnd: addHours(baseTime, 48),
      matchStart: addHours(baseTime, 50),
      roomReleaseTime: addHours(baseTime, 49.75),
      status: 'Upcoming',
      visibility: 'Invite Only',
      organizer: 'VONK Esports',
      rules: [
        'Invited tier-1 / tier-2 teams only.',
        'Points matching official BGMI tournament metrics.',
        'Roster locked 2 hours before the start.',
      ],
      scoringSystem: {
        pointsPerKill: 1,
        placementPoints: { 1: 15, 2: 12, 3: 10, 4: 8, 5: 6, 6: 4, 7: 2, 8: 1, 9: 1, 10: 1 },
      },
      prizeDistribution: {
        placePercentages: { 1: 50, 2: 25, 3: 15, 4: 10 },
        mvpReward: 1000,
      },
      tags: ['Invite Only', 'Free', 'Pro', 'Sanhok'],
      featured: true,
      createdAt: addHours(baseTime, -48),
      updatedAt: addHours(baseTime, -24),
    },
    {
      id: 'tour-4',
      title: 'Nusa Duo Fast Attack Scrims',
      slug: 'nusa-duo-fast-attack-scrims',
      banner: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?q=80&w=600&auto=format&fit=crop',
      description: 'Simulated room release and live match monitoring. Room credentials are released now! Jump in and secure your spot.',
      game: 'BGMI',
      mode: 'Duo',
      map: 'Nusa',
      perspective: 'TPP',
      level: 'Beginner',
      entryFee: 10,
      prizePool: 1000,
      prizePoolType: 'FIXED',
      platformFeePercentage: 10,
      perKillReward: 1,
      maxParticipants: 50,
      registeredParticipants: 48,
      teamSize: 2,
      substituteLimit: 1,
      registrationStart: addHours(baseTime, -24),
      registrationEnd: addHours(baseTime, -0.5),
      matchStart: addHours(baseTime, 0.5), // starts in 30 minutes
      roomReleaseTime: addHours(baseTime, -0.1), // released 6 mins ago
      status: 'Room Released',
      visibility: 'Public',
      organizer: 'VONK Official',
      rules: [
        'Duo queue matches.',
        'Credentials released. Check match lobby tab.',
        'Slot locking applies. Violations lead to warning kicks.',
      ],
      scoringSystem: {
        pointsPerKill: 1,
        placementPoints: { 1: 10, 2: 6, 3: 4, 4: 3, 5: 2 },
      },
      prizeDistribution: {
        placePercentages: { 1: 70, 2: 30 },
      },
      tags: ['Duo', 'Nusa', 'Simulated Room'],
      featured: false,
      roomDetails: {
        roomId: '8849201',
        roomPassword: 'VONK_LOBBY_99',
      },
      createdAt: addHours(baseTime, -36),
      updatedAt: addHours(baseTime, -1),
    },
    {
      id: 'tour-5',
      title: 'VONK Ultimate Championship Phase 1',
      slug: 'vonk-ultimate-championship-phase-1',
      banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop',
      description: 'Completed tournament archive. Review rankings, placement points, kills, and mock prizes payout ledger.',
      game: 'BGMI',
      mode: 'Squad',
      map: 'Erangel',
      perspective: 'TPP',
      level: 'Championship',
      entryFee: 100,
      prizePool: 50000,
      prizePoolType: 'FIXED',
      platformFeePercentage: 5,
      perKillReward: 20,
      maxParticipants: 20,
      registeredParticipants: 20,
      teamSize: 4,
      substituteLimit: 2,
      registrationStart: addHours(baseTime, -120),
      registrationEnd: addHours(baseTime, -48),
      matchStart: addHours(baseTime, -46),
      roomReleaseTime: addHours(baseTime, -46.25),
      status: 'Completed',
      visibility: 'Public',
      organizer: 'VONK Official',
      rules: [
        'Final tournament rules apply.',
        'Prizes released immediately post review.',
      ],
      scoringSystem: {
        pointsPerKill: 1,
        placementPoints: { 1: 15, 2: 12, 3: 10, 4: 8, 5: 6, 6: 4, 7: 2, 8: 1, 9: 1, 10: 1 },
      },
      prizeDistribution: {
        placePercentages: { 1: 50, 2: 30, 3: 20 },
      },
      tags: ['Championship', 'Completed', 'Squad', 'Erangel'],
      featured: false,
      roomDetails: {
        roomId: '8842100',
        roomPassword: 'CLOSED_LOBBY',
      },
      createdAt: addHours(baseTime, -144),
      updatedAt: addHours(baseTime, -46),
    },
  ];

  // 4. Mock Registrations
  // Register default player to Miramar Solo and Nusa Duo
  const defaultRegistrations: Registration[] = [
    {
      id: 'reg-user-1',
      tournamentId: 'tour-2', // Miramar Sniper
      playerId: 'user-player-1',
      membersRegistered: [
        { playerId: 'user-player-1', inGameName: 'VONK⚡Slayer', characterId: '5819384729' },
      ],
      slotNumber: 14,
      entryFeePaid: 20,
      paymentStatus: 'SUCCESS',
      paymentMethod: 'Simulated Wallet',
      registeredAt: addHours(baseTime, -24),
      status: 'APPROVED',
    },
    {
      id: 'reg-user-2',
      tournamentId: 'tour-4', // Nusa Duo
      playerId: 'user-player-1',
      teamId: 'team-user',
      teamName: 'VONK Gladiators',
      membersRegistered: [
        { playerId: 'user-player-1', inGameName: 'VONK⚡Slayer', characterId: '5819384729' },
        { playerId: 'mock-p-2', inGameName: 'VONK⚡Sniper', characterId: '5819384730' },
      ],
      slotNumber: 8,
      entryFeePaid: 10,
      paymentStatus: 'SUCCESS',
      paymentMethod: 'Simulated Wallet',
      registeredAt: addHours(baseTime, -12),
      status: 'APPROVED',
    },
  ];

  // 5. Mock Wallet Transactions
  const defaultTransactions: WalletTransaction[] = [
    {
      id: 'tx-1',
      playerId: 'user-player-1',
      type: 'DEMO_CREDIT',
      direction: 'CREDIT',
      amount: 500,
      title: 'Demo Balance Added',
      description: 'Simulated deposit (Mock Wallet Setup)',
      status: 'SUCCESS',
      balanceBefore: 0,
      balanceAfter: 500,
      referenceId: 'VNK-TX-938101',
      createdAt: addHours(baseTime, -72),
      updatedAt: addHours(baseTime, -72),
      isDemo: true,
    },
    {
      id: 'tx-2',
      playerId: 'user-player-1',
      type: 'BONUS',
      direction: 'CREDIT',
      amount: 300,
      title: 'Welcome Bonus Claimed',
      description: 'VONK Welcome Promo Credit',
      status: 'SUCCESS',
      balanceBefore: 500,
      balanceAfter: 800,
      referenceId: 'VNK-TX-938102',
      createdAt: addHours(baseTime, -72),
      updatedAt: addHours(baseTime, -72),
      isDemo: true,
    },
    {
      id: 'tx-3',
      playerId: 'user-player-1',
      type: 'ENTRY_FEE',
      direction: 'DEBIT',
      amount: 20,
      title: 'Entry Fee Deduction',
      description: 'Registered for Miramar Sniper-Only Arena',
      status: 'SUCCESS',
      balanceBefore: 800,
      balanceAfter: 780,
      tournamentId: 'tour-2',
      tournamentName: 'Miramar Sniper-Only Arena',
      referenceId: 'VNK-TX-938103',
      createdAt: addHours(baseTime, -24),
      updatedAt: addHours(baseTime, -24),
      isDemo: true,
    },
    {
      id: 'tx-4',
      playerId: 'user-player-1',
      type: 'ENTRY_FEE',
      direction: 'DEBIT',
      amount: 10,
      title: 'Entry Fee Deduction',
      description: 'Registered for Nusa Duo Fast Attack Scrims',
      status: 'SUCCESS',
      balanceBefore: 780,
      balanceAfter: 770,
      tournamentId: 'tour-4',
      tournamentName: 'Nusa Duo Fast Attack Scrims',
      referenceId: 'VNK-TX-938104',
      createdAt: addHours(baseTime, -12),
      updatedAt: addHours(baseTime, -12),
      isDemo: true,
    },
    {
      id: 'tx-5',
      playerId: 'user-player-1',
      type: 'PRIZE_WINNING',
      direction: 'CREDIT',
      amount: 1500,
      title: 'Prize Winnings Credited',
      description: 'Simulated Prize Win: TDM Weekly Cup',
      status: 'SUCCESS',
      balanceBefore: 770,
      balanceAfter: 2270,
      referenceId: 'VNK-TX-938105',
      createdAt: addHours(baseTime, -4),
      updatedAt: addHours(baseTime, -4),
      metadata: { category: 'Winner Prize' },
      isDemo: true,
    },
    {
      id: 'tx-6',
      playerId: 'user-player-1',
      type: 'DEMO_CREDIT',
      direction: 'CREDIT',
      amount: 1000,
      title: 'Demo Balance Added',
      description: 'Simulated deposit',
      status: 'SUCCESS',
      balanceBefore: 2270,
      balanceAfter: 3270,
      referenceId: 'VNK-TX-938106',
      createdAt: addHours(baseTime, -2),
      updatedAt: addHours(baseTime, -2),
      isDemo: true,
    },
  ];

  // Adjust mock player balance based on transactions:
  defaultPlayer.walletBalance = 3270;

  // 6. Mock Notifications
  const defaultNotifications: Notification[] = [
    {
      id: 'notif-1',
      playerId: 'user-player-1',
      type: 'REGISTRATION_CONFIRMED',
      title: 'Registration Approved!',
      message: 'Your squad registration for Miramar Sniper-Only Arena is confirmed. Slot #14 is assigned.',
      read: false,
      createdAt: addHours(baseTime, -24),
    },
    {
      id: 'notif-2',
      playerId: 'user-player-1',
      type: 'ROOM_RELEASED',
      title: 'Room Credentials Released!',
      message: 'Room details for Nusa Duo Fast Attack Scrims are now visible. Copy Room ID and Password.',
      read: false,
      createdAt: addHours(baseTime, -0.1),
    },
    {
      id: 'notif-3',
      playerId: 'user-player-1',
      type: 'PRIZE_CREDITED',
      title: 'Simulated Prize Money Credited!',
      message: 'Congratulations! ₹1,500 has been credited to your mock wallet for winning the TDM Weekly Cup.',
      read: true,
      createdAt: addHours(baseTime, -4),
    },
  ];

  // 7. Mock Disputes
  const defaultDisputes: Dispute[] = [
    {
      id: 'disp-1',
      playerId: 'user-player-1',
      playerName: 'VONK⚡Slayer',
      tournamentId: 'tour-5',
      tournamentTitle: 'VONK Ultimate Championship Phase 1',
      type: 'Score Incorrect',
      description: 'Our squad had 12 kills, but the published leaderboard only shows 10 kills.',
      screenshotUrl: '',
      status: 'Resolved',
      organizerResponse: 'Thank you for raising this. Leaderboard reviewed and updated. Placement scores adjusted.',
      createdAt: addHours(baseTime, -44),
      updatedAt: addHours(baseTime, -40),
    },
  ];

  // 8. Mock Match Results
  const defaultMatchResults: MatchResult[] = [
    {
      id: 'res-tour-5',
      tournamentId: 'tour-5',
      publishedAt: addHours(baseTime, -45),
      payoutStatus: 'COMPLETED',
      results: [
        { teamName: 'Team SouL', placement: 1, kills: 18, placementPoints: 15, killPoints: 18, bonusPoints: 0, penaltyPoints: 0, totalPoints: 33, mvpPlayerName: 'SouL_Mortal' },
        { teamName: 'GodLike Esports', placement: 2, kills: 15, placementPoints: 12, killPoints: 15, bonusPoints: 0, penaltyPoints: 0, totalPoints: 27, mvpPlayerName: 'GodL_JONATHAN' },
        { teamName: 'Entity Gaming', placement: 3, kills: 8, placementPoints: 10, killPoints: 8, bonusPoints: 0, penaltyPoints: 0, totalPoints: 18 },
        { teamName: 'Global Esports', placement: 4, kills: 10, placementPoints: 8, killPoints: 10, bonusPoints: 0, penaltyPoints: 0, totalPoints: 18 },
        { teamName: 'Team XSpark', placement: 5, kills: 7, placementPoints: 6, killPoints: 7, bonusPoints: 0, penaltyPoints: 0, totalPoints: 13 },
      ],
    },
    {
      id: 'res-tour-4',
      tournamentId: 'tour-4',
      publishedAt: addHours(baseTime, 1.5),
      payoutStatus: 'PENDING',
      results: [],
    },
  ];

  const defaultInvitations: TeamInvitation[] = [
    {
      id: 'inv-1',
      teamId: 'team-godl',
      teamName: 'GodLike Esports',
      playerId: 'user-player-1',
      playerName: 'VONK⚡Slayer',
      role: 'Assaulter',
      status: 'Pending',
      createdAt: addHours(baseTime, -10),
    },
    {
      id: 'inv-2',
      teamId: 'team-soul',
      teamName: 'Team SouL',
      playerId: 'user-player-1',
      playerName: 'VONK⚡Slayer',
      role: 'Sniper',
      status: 'Rejected',
      createdAt: addHours(baseTime, -48),
    }
  ];

  const defaultJoinRequests: TeamJoinRequest[] = [
    {
      id: 'req-1',
      teamId: 'team-user',
      playerId: 'mock-p-3',
      playerName: 'VONK⚡Assaulter',
      playerLevel: 'Gold',
      preferredRole: 'Assaulter',
      statsPreview: {
        matchesPlayed: 45,
        kdRatio: 3.12,
        winRate: 15.0
      },
      status: 'Pending',
      createdAt: addHours(baseTime, -5)
    },
    {
      id: 'req-2',
      teamId: 'team-user',
      playerId: 'mock-p-4',
      playerName: 'VONK⚡IGL',
      playerLevel: 'Platinum',
      preferredRole: 'IGL',
      statsPreview: {
        matchesPlayed: 82,
        kdRatio: 4.89,
        winRate: 30.5
      },
      status: 'Pending',
      createdAt: addHours(baseTime, -2)
    }
  ];

  const defaultActivities: TeamActivity[] = [
    { id: 'act-1', type: 'MemberJoined', description: 'VONK⚡Sniper joined Team VONK Gladiators.', timestamp: addHours(baseTime, -24) }
  ];

  // Store in LocalStorage
  // Store in LocalStorage
  browserStorage.setItem(STORAGE_KEYS.USER, defaultPlayer);
  browserStorage.setItem(STORAGE_KEYS.ROLE, 'Player'); // default role
  browserStorage.setItem(STORAGE_KEYS.TEAMS, defaultTeams);
  browserStorage.setItem(STORAGE_KEYS.TOURNAMENTS, defaultTournaments);
  browserStorage.setItem(STORAGE_KEYS.REGISTRATIONS, defaultRegistrations);
  browserStorage.setItem(STORAGE_KEYS.TRANSACTIONS, defaultTransactions);
  browserStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications);
  browserStorage.setItem(STORAGE_KEYS.DISPUTES, defaultDisputes);
  browserStorage.setItem(STORAGE_KEYS.RESULTS, defaultMatchResults);

  // Phase 3 specific keys
  browserStorage.setItem(STORAGE_KEYS.PLAYER_STATS, defaultPlayer.stats);
  browserStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, defaultMatchHistory);
  browserStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, defaultPlayer.achievements);
  browserStorage.setItem(STORAGE_KEYS.FAVORITES, defaultFavorites);
  browserStorage.setItem(STORAGE_KEYS.SETTINGS, defaultPlayer.settings);

  // Phase 4 specific keys
  browserStorage.setItem(STORAGE_KEYS.TEAM_INVITATIONS, defaultInvitations);
  browserStorage.setItem(STORAGE_KEYS.TEAM_JOIN_REQUESTS, defaultJoinRequests);
  browserStorage.setItem(STORAGE_KEYS.TEAM_ACTIVITIES, defaultActivities);

  // Phase 5 specific keys (Wallet record)
  const defaultWalletRecord = {
    'user-player-1': {
      playerId: 'user-player-1',
      balance: 3270,
      totalAdded: 1500,
      totalFeesPaid: 30,
      totalPrizesWon: 1500,
      totalRefunds: 0,
      totalBonuses: 300,
      updatedAt: baseTime.toISOString(),
    }
  };
  browserStorage.setItem(STORAGE_KEYS.WALLET, defaultWalletRecord);

  console.log('VONK Tournaments Database successfully seeded!');
}
