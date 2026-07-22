/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AdminProfile,
  AdminAuditLog,
  PlatformReport,
  PlatformAnnouncement,
  PlatformSettings,
  PlatformAnalyticsOverview,
  Player,
  Team,
  OrganizerProfile,
  Tournament,
  Registration,
  Match,
  MatchResult,
  ResultDispute,
  Wallet,
  WalletTransaction,
  ReportReason,
  ReportStatus,
  ReportTargetType,
  TournamentStatus
} from '@/types';
import { localAuditLogRepository } from '@/repositories/local/local-audit-log-repository';
import { localReportRepository } from '@/repositories/local/local-report-repository';
import { localPlatformAnnouncementRepository } from '@/repositories/local/local-platform-announcement-repository';
import { localPlatformSettingsRepository } from '@/repositories/local/local-platform-settings-repository';
import { localOrganizerRepository } from '@/repositories/local/local-organizer-repository';
import { localOrganizerTournamentRepository } from '@/repositories/local/local-organizer-tournament-repository';
import { localRegistrationRepository } from '@/repositories/local/local-registration-repository';
import { localResultRepository } from '@/repositories/local/local-result-repository';
import { localDisputeRepository } from '@/repositories/local/local-dispute-repository';
import { localWalletRepository } from '@/repositories/local/local-wallet-repository';
import { localTransactionRepository } from '@/repositories/local/local-transaction-repository';
import { localTeamRepository } from '@/repositories/local/local-team-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';
import { resultService } from './result-service';

export class AdminService {
  // --- AUDIT LOGGING ---
  logAction(
    adminId: string,
    adminName: string,
    entityType: AdminAuditLog['entityType'],
    entityId: string,
    action: string,
    title: string,
    description: string,
    metadata?: Record<string, unknown>
  ): AdminAuditLog {
    const log: AdminAuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminId,
      adminName,
      entityType,
      entityId,
      action,
      title,
      description,
      timestamp: new Date().toISOString(),
      metadata
    };
    localAuditLogRepository.save(log);
    return log;
  }

  getAuditLogs(): AdminAuditLog[] {
    return localAuditLogRepository.getAll();
  }

  // --- ADMIN PROFILE & PERMISSIONS ---
  getAdminProfile(): AdminProfile {
    const defaultAdmin: AdminProfile = {
      id: 'admin-1',
      username: 'SystemAdmin',
      email: 'admin@vonk.gg',
      role: 'SUPER_ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop',
      permissions: ['ALL'],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    };
    const stored = browserStorage.getItem<AdminProfile | null>(STORAGE_KEYS.ADMINS, null);
    return stored || defaultAdmin;
  }

  validateAdminAccess(role: string): boolean {
    return role === 'Admin' || role === 'ADMIN';
  }

  // --- PLAYER MODERATION ---
  getAllPlayers(): Player[] {
    const currentUser = browserStorage.getItem<Player | null>(STORAGE_KEYS.USER, null);
    if (!currentUser) return [];

    // Return current user plus mock demo players for admin oversight
    const demoPlayers: Player[] = [
      currentUser,
      {
        id: 'player-mortal',
        username: 'Mortal',
        inGameName: 'SouL Mortal',
        characterId: '511223344',
        level: 'Conqueror',
        walletBalance: 12500,
        avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop',
        coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop',
        bio: 'Official SouL Captain & BGMI Veteran',
        country: 'India',
        state: 'Maharashtra',
        preferredLanguage: 'Hindi',
        dateJoined: '2024-01-15T10:00:00.000Z',
        onlineStatus: 'Online',
        rank: {
          currentRank: 'Conqueror',
          previousRank: 'Ace',
          highestRank: 'Conqueror',
          rankChange: 'UP',
          leaderboardPosition: 1
        },
        stats: {
          matchesPlayed: 340,
          wins: 120,
          top3Finishes: 210,
          top10Finishes: 290,
          totalKills: 1450,
          totalDamage: 245000,
          kdRatio: 4.26,
          avgPlacement: 4.2,
          winRate: 35.3,
          headshots: 420,
          mvpAwards: 45,
          tournamentsPlayed: 28,
          tournamentsWon: 12,
          totalPrizeWon: 85000,
          favoriteMode: 'Squad',
          favoriteMap: 'Erangel'
        },
        achievements: [],
        badges: ['Verified', 'Champion'],
        socialLinks: {},
        settings: {
          notifications: { tournamentUpdates: true, registrationConfirmed: true, prizeReceived: true, refund: true, organizerAnnouncement: true, systemUpdate: true },
          privacy: { showStats: true, showMatchHistory: true, showSocialLinks: true },
          themePreference: 'dark'
        }
      },
      {
        id: 'player-jonathan',
        username: 'Jonathan',
        inGameName: 'GodL Jonathan',
        characterId: '522334455',
        level: 'Conqueror',
        walletBalance: 15000,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop',
        coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop',
        bio: 'GodLike Fragger',
        country: 'India',
        state: 'Maharashtra',
        preferredLanguage: 'Hindi',
        dateJoined: '2024-02-01T10:00:00.000Z',
        onlineStatus: 'In Match',
        rank: {
          currentRank: 'Conqueror',
          previousRank: 'Conqueror',
          highestRank: 'Conqueror',
          rankChange: 'STABLE',
          leaderboardPosition: 2
        },
        stats: {
          matchesPlayed: 410,
          wins: 135,
          top3Finishes: 250,
          top10Finishes: 340,
          totalKills: 2100,
          totalDamage: 380000,
          kdRatio: 5.12,
          avgPlacement: 3.8,
          winRate: 32.9,
          headshots: 680,
          mvpAwards: 62,
          tournamentsPlayed: 32,
          tournamentsWon: 14,
          totalPrizeWon: 110000,
          favoriteMode: 'Squad',
          favoriteMap: 'Erangel'
        },
        achievements: [],
        badges: ['Verified', 'Top Killer', 'MVP'],
        socialLinks: {},
        settings: {
          notifications: { tournamentUpdates: true, registrationConfirmed: true, prizeReceived: true, refund: true, organizerAnnouncement: true, systemUpdate: true },
          privacy: { showStats: true, showMatchHistory: true, showSocialLinks: true },
          themePreference: 'dark'
        }
      }
    ];

    const storedSuspensions = browserStorage.getItem<Record<string, string>>('vonk:v1:player-suspensions', {});
    return demoPlayers.map((p) => ({
      ...p,
      onlineStatus: storedSuspensions[p.id] ? ('Offline' as any) : p.onlineStatus
    }));
  }

  suspendPlayer(adminId: string, playerId: string, reason: string): boolean {
    const suspensions = browserStorage.getItem<Record<string, string>>('vonk:v1:player-suspensions', {});
    suspensions[playerId] = reason;
    browserStorage.setItem('vonk:v1:player-suspensions', suspensions);

    this.logAction(adminId, 'Admin', 'PLAYER', playerId, 'SUSPEND_PLAYER', 'Player Suspended', `Player ${playerId} suspended: ${reason}`);
    return true;
  }

  unsuspendPlayer(adminId: string, playerId: string): boolean {
    const suspensions = browserStorage.getItem<Record<string, string>>('vonk:v1:player-suspensions', {});
    delete suspensions[playerId];
    browserStorage.setItem('vonk:v1:player-suspensions', suspensions);

    this.logAction(adminId, 'Admin', 'PLAYER', playerId, 'UNSUSPEND_PLAYER', 'Player Restored', `Suspension lifted for player ${playerId}`);
    return true;
  }

  resetPlayerWallet(adminId: string, playerId: string): boolean {
    localWalletRepository.resetWallet(playerId);
    this.logAction(adminId, 'Admin', 'WALLET', playerId, 'RESET_PLAYER_WALLET', 'Player Wallet Reset', `Demo wallet balance reset to ₹0 for player ${playerId}`);
    return true;
  }

  resetPlayerStats(adminId: string, playerId: string): boolean {
    const currentUser = browserStorage.getItem<Player | null>(STORAGE_KEYS.USER, null);
    if (currentUser && currentUser.id === playerId) {
      currentUser.stats.matchesPlayed = 0;
      currentUser.stats.wins = 0;
      currentUser.stats.totalKills = 0;
      currentUser.stats.totalDamage = 0;
      currentUser.stats.kdRatio = 0;
      browserStorage.setItem(STORAGE_KEYS.USER, currentUser);
    }
    this.logAction(adminId, 'Admin', 'PLAYER', playerId, 'RESET_PLAYER_STATS', 'Player Stats Reset', `Statistics reset for player ${playerId}`);
    return true;
  }

  // --- TEAM MODERATION ---
  getAllTeams(): Team[] {
    return localTeamRepository.getAll();
  }

  suspendTeam(adminId: string, teamId: string, reason: string): boolean {
    const team = localTeamRepository.getById(teamId);
    if (!team) return false;

    team.readinessStatus = 'Locked';
    localTeamRepository.save(team);

    this.logAction(adminId, 'Admin', 'TEAM', teamId, 'SUSPEND_TEAM', 'Team Locked', `Team "${team.name}" locked/suspended: ${reason}`);
    return true;
  }

  restoreTeam(adminId: string, teamId: string): boolean {
    const team = localTeamRepository.getById(teamId);
    if (!team) return false;

    team.readinessStatus = 'Tournament Ready';
    localTeamRepository.save(team);

    this.logAction(adminId, 'Admin', 'TEAM', teamId, 'RESTORE_TEAM', 'Team Restored', `Team "${team.name}" restored to Tournament Ready`);
    return true;
  }

  // --- ORGANIZER MODERATION ---
  getAllOrganizers(): OrganizerProfile[] {
    const org = localOrganizerRepository.get();
    if (!org) return [];
    return [org];
  }

  suspendOrganizer(adminId: string, organizerId: string, reason: string): boolean {
    const org = localOrganizerRepository.get();
    if (org && org.id === organizerId) {
      org.isVerified = false;
      localOrganizerRepository.save(org);
    }
    this.logAction(adminId, 'Admin', 'ORGANIZER', organizerId, 'SUSPEND_ORGANIZER', 'Organizer Suspended', `Organizer ${organizerId} verification revoked: ${reason}`);
    return true;
  }

  approveOrganizer(adminId: string, organizerId: string): boolean {
    const org = localOrganizerRepository.get();
    if (org && org.id === organizerId) {
      org.isVerified = true;
      localOrganizerRepository.save(org);
    }
    this.logAction(adminId, 'Admin', 'ORGANIZER', organizerId, 'APPROVE_ORGANIZER', 'Organizer Approved', `Organizer ${organizerId} verified`);
    return true;
  }

  // --- TOURNAMENT MODERATION ---
  getAllTournaments(): Tournament[] {
    return localOrganizerTournamentRepository.getAll();
  }

  changeTournamentStatus(adminId: string, tournamentId: string, status: TournamentStatus, reason?: string): boolean {
    const tournaments = localOrganizerTournamentRepository.getAll();
    const idx = tournaments.findIndex((t) => t.id === tournamentId);
    if (idx === -1) return false;

    tournaments[idx].status = status;
    tournaments[idx].updatedAt = new Date().toISOString();
    localOrganizerTournamentRepository.saveAll(tournaments);

    this.logAction(adminId, 'Admin', 'TOURNAMENT', tournamentId, 'CHANGE_TOURNAMENT_STATUS', 'Tournament Status Updated', `Tournament "${tournaments[idx].title}" status set to ${status}. ${reason ? 'Reason: ' + reason : ''}`);
    return true;
  }

  deleteDemoTournament(adminId: string, tournamentId: string): boolean {
    const tournaments = localOrganizerTournamentRepository.getAll();
    const filtered = tournaments.filter((t) => t.id !== tournamentId);
    localOrganizerTournamentRepository.saveAll(filtered);

    this.logAction(adminId, 'Admin', 'TOURNAMENT', tournamentId, 'DELETE_TOURNAMENT', 'Demo Tournament Deleted', `Tournament ID ${tournamentId} removed from demo storage`);
    return true;
  }

  // --- REGISTRATION MODERATION ---
  getAllRegistrations(): Registration[] {
    return localRegistrationRepository.getAll();
  }

  forceConfirmRegistration(adminId: string, registrationId: string): boolean {
    const reg = localRegistrationRepository.getById(registrationId);
    if (!reg) return false;

    reg.status = 'CONFIRMED';
    reg.paymentStatus = 'SUCCESS';
    localRegistrationRepository.save(reg);

    this.logAction(adminId, 'Admin', 'REGISTRATION', registrationId, 'FORCE_CONFIRM_REGISTRATION', 'Registration Force Confirmed', `Registration ${registrationId} force confirmed by Admin`);
    return true;
  }

  // --- MATCH & RESULT MODERATION ---
  getAllMatches(): Match[] {
    return browserStorage.getItem<Match[]>('vonk:v1:matches', []);
  }

  getAllResults(): MatchResult[] {
    return localResultRepository.getAll();
  }

  removeDemoResult(adminId: string, resultId: string): boolean {
    const results = localResultRepository.getAll().filter((r) => r.id !== resultId);
    localResultRepository.saveAll(results);

    this.logAction(adminId, 'Admin', 'RESULT', resultId, 'REMOVE_DEMO_RESULT', 'Demo Result Removed', `Result record ${resultId} deleted`);
    return true;
  }

  recalculateLeaderboard(adminId: string, tournamentId: string): void {
    resultService.recalculateStandings(tournamentId);
    this.logAction(adminId, 'Admin', 'RESULT', tournamentId, 'RECALCULATE_LEADERBOARD', 'Leaderboard Recalculated', `Recalculated standings for tournament ${tournamentId}`);
  }

  // --- WALLET MODERATION ---
  addDemoCredit(adminId: string, playerId: string, amount: number, title: string, description: string): WalletTransaction | null {
    const wallet = localWalletRepository.getWallet(playerId);
    if (!wallet) return null;

    const balBefore = wallet.balance;
    wallet.balance += amount;
    wallet.totalAdded += amount;
    localWalletRepository.saveWallet(wallet);

    const tx: WalletTransaction = {
      id: `tx-admin-cred-${Date.now()}`,
      playerId,
      type: 'ADJUSTMENT',
      direction: 'CREDIT',
      amount,
      title: title || 'Admin Demo Credit',
      description: description || 'Simulated admin credit adjustment',
      status: 'SUCCESS',
      balanceBefore: balBefore,
      balanceAfter: wallet.balance,
      referenceId: adminId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true
    };
    localTransactionRepository.save(tx);

    this.logAction(adminId, 'Admin', 'WALLET', playerId, 'ADD_DEMO_CREDIT', 'Demo Credit Added', `Credited ₹${amount} to player ${playerId}`);
    return tx;
  }

  deductDemoBalance(adminId: string, playerId: string, amount: number, title: string, description: string): WalletTransaction | null {
    const wallet = localWalletRepository.getWallet(playerId);
    if (!wallet) return null;

    const balBefore = wallet.balance;
    wallet.balance = Math.max(0, wallet.balance - amount);
    localWalletRepository.saveWallet(wallet);

    const tx: WalletTransaction = {
      id: `tx-admin-deb-${Date.now()}`,
      playerId,
      type: 'ADJUSTMENT',
      direction: 'DEBIT',
      amount,
      title: title || 'Admin Demo Deduction',
      description: description || 'Simulated admin balance deduction',
      status: 'SUCCESS',
      balanceBefore: balBefore,
      balanceAfter: wallet.balance,
      referenceId: adminId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true
    };
    localTransactionRepository.save(tx);

    this.logAction(adminId, 'Admin', 'WALLET', playerId, 'DEDUCT_DEMO_BALANCE', 'Demo Balance Deducted', `Deducted ₹${amount} from player ${playerId}`);
    return tx;
  }

  // --- REPORT MODERATION ---
  getAllReports(): PlatformReport[] {
    return localReportRepository.getAll();
  }

  createReport(reportedBy: string, reportedByName: string, targetType: ReportTargetType, targetId: string, targetName: string, reason: ReportReason, description: string): PlatformReport {
    const report: PlatformReport = {
      id: `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      reportedBy,
      reportedByName,
      targetType,
      targetId,
      targetName,
      reason,
      description,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      isDemo: true
    };
    localReportRepository.save(report);
    return report;
  }

  resolveReport(adminId: string, reportId: string, status: ReportStatus, notes: string): boolean {
    const report = localReportRepository.getById(reportId);
    if (!report) return false;

    report.status = status;
    report.resolutionNotes = notes;
    report.resolvedAt = new Date().toISOString();
    localReportRepository.save(report);

    this.logAction(adminId, 'Admin', 'REPORT', reportId, 'RESOLVE_REPORT', 'Report Resolved', `Report #${reportId} updated to ${status}: ${notes}`);
    return true;
  }

  // --- PLATFORM ANNOUNCEMENTS ---
  getAllAnnouncements(): PlatformAnnouncement[] {
    return localPlatformAnnouncementRepository.getAll();
  }

  createAnnouncement(adminId: string, title: string, content: string, target: 'EVERYONE' | 'PLAYERS' | 'ORGANIZERS', status: 'DRAFT' | 'PUBLISHED' = 'PUBLISHED'): PlatformAnnouncement {
    const ann: PlatformAnnouncement = {
      id: `ann-plat-${Date.now()}`,
      title,
      content,
      target,
      status,
      publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      isDemo: true
    };
    localPlatformAnnouncementRepository.save(ann);

    this.logAction(adminId, 'Admin', 'ANNOUNCEMENT', ann.id, 'CREATE_ANNOUNCEMENT', 'Platform Announcement Published', `Published broadcast: "${title}" targetting ${target}`);
    return ann;
  }

  deleteAnnouncement(adminId: string, announcementId: string): boolean {
    const list = localPlatformAnnouncementRepository.getAll().filter((a) => a.id !== announcementId);
    localPlatformAnnouncementRepository.saveAll(list);

    this.logAction(adminId, 'Admin', 'ANNOUNCEMENT', announcementId, 'DELETE_ANNOUNCEMENT', 'Platform Announcement Deleted', `Deleted announcement ${announcementId}`);
    return true;
  }

  // --- PLATFORM SETTINGS ---
  getSettings(): PlatformSettings {
    const defaultSettings: PlatformSettings = {
      platformName: 'VONK Tournaments',
      theme: 'dark',
      defaultTournamentSettings: {
        defaultMode: 'Squad',
        defaultMap: 'Erangel',
        defaultPlatformFee: 10
      },
      demoMode: true,
      walletLimits: {
        maxDemoBalance: 100000,
        maxBonusClaim: 500
      },
      announcementDefaults: {
        autoBroadcast: true
      }
    };
    return localPlatformSettingsRepository.get() || defaultSettings;
  }

  saveSettings(adminId: string, settings: PlatformSettings): void {
    localPlatformSettingsRepository.save(settings);
    this.logAction(adminId, 'Admin', 'SETTINGS', 'global', 'UPDATE_SETTINGS', 'Platform Settings Updated', 'Admin updated platform defaults & limits');
  }

  // --- PLATFORM ANALYTICS ---
  getAnalytics(): PlatformAnalyticsOverview {
    const players = this.getAllPlayers();
    const teams = this.getAllTeams();
    const organizers = this.getAllOrganizers();
    const tournaments = this.getAllTournaments();
    const registrations = this.getAllRegistrations();
    const matches = this.getAllMatches();
    const results = this.getAllResults();
    const disputes = localDisputeRepository.getAll();
    const reports = this.getAllReports();

    const activeTournaments = tournaments.filter((t) => t.status === 'LIVE' || t.status === 'Live' || t.status === 'REGISTRATION_OPEN' || t.status === 'Registration Open').length;
    const totalPrizePayouts = tournaments.reduce((sum, t) => sum + (t.prizePool || 0), 0);

    return {
      totalPlayers: players.length,
      totalTeams: teams.length,
      totalOrganizers: organizers.length,
      totalTournaments: tournaments.length,
      activeTournaments,
      totalRegistrations: registrations.length,
      totalMatches: matches.length,
      totalResults: results.length,
      pendingDisputes: disputes.filter((d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW').length,
      totalPrizePayouts,
      totalReports: reports.filter((r) => r.status === 'OPEN' || r.status === 'REVIEWING').length,
      platformActivityOverTime: [
        { date: 'Jul 15', registrations: 14, tournaments: 2 },
        { date: 'Jul 16', registrations: 22, tournaments: 4 },
        { date: 'Jul 17', registrations: 38, tournaments: 5 },
        { date: 'Jul 18', registrations: registrations.length, tournaments: tournaments.length }
      ]
    };
  }

  // --- SEEDING & RESET ---
  seedAdminData(): void {
    // Seed sample reports if empty
    const reports = localReportRepository.getAll();
    if (reports.length === 0) {
      this.createReport('player-user', 'Apex Player', 'PLAYER', 'player-jonathan', 'GodL Jonathan', 'CHEATING', 'Suspected wallhacks in Round 2 match.');
      this.createReport('player-user', 'Apex Player', 'RESULT', 'res-tour-5-r1-soul', 'Match Result #1', 'WRONG_IGN', 'Participant IGN character ID does not match roster submission.');
    }

    // Seed sample platform announcement
    const anns = localPlatformAnnouncementRepository.getAll();
    if (anns.length === 0) {
      this.createAnnouncement('admin-1', 'VONK Esports Summer Championship Announced!', 'All organizers and players can now register teams for the summer Invitational ladder.', 'EVERYONE');
    }

    // Log seed audit
    this.logAction('admin-1', 'System Admin', 'SETTINGS', 'seed', 'SEED_ADMIN_DATA', 'Admin Seed Data Loaded', 'Sample platform reports, audit logs, and announcements initialized.');
  }

  resetAdminData(): void {
    localAuditLogRepository.clear();
    localReportRepository.clear();
    localPlatformAnnouncementRepository.clear();
    localPlatformSettingsRepository.clear();
    browserStorage.setItem('vonk:v1:player-suspensions', {});
  }
}

export const adminService = new AdminService();
export default adminService;
