'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  ReportReason,
  ReportStatus,
  ReportTargetType,
  TournamentStatus,
  WalletTransaction
} from '@/types';
import { adminService } from '@/lib/services/admin-service';

interface AdminContextType {
  adminProfile: AdminProfile;
  analytics: PlatformAnalyticsOverview;
  auditLogs: AdminAuditLog[];
  reports: PlatformReport[];
  announcements: PlatformAnnouncement[];
  settings: PlatformSettings;
  players: Player[];
  teams: Team[];
  organizers: OrganizerProfile[];
  tournaments: Tournament[];
  registrations: Registration[];
  matches: Match[];
  results: MatchResult[];

  // Actions
  suspendPlayer: (playerId: string, reason: string) => boolean;
  unsuspendPlayer: (playerId: string) => boolean;
  resetPlayerWallet: (playerId: string) => boolean;
  resetPlayerStats: (playerId: string) => boolean;

  suspendTeam: (teamId: string, reason: string) => boolean;
  restoreTeam: (teamId: string) => boolean;

  approveOrganizer: (organizerId: string) => boolean;
  suspendOrganizer: (organizerId: string, reason: string) => boolean;

  changeTournamentStatus: (tournamentId: string, status: TournamentStatus, reason?: string) => boolean;
  deleteDemoTournament: (tournamentId: string) => boolean;

  forceConfirmRegistration: (registrationId: string) => boolean;
  removeDemoResult: (resultId: string) => boolean;
  recalculateLeaderboard: (tournamentId: string) => void;

  addDemoCredit: (playerId: string, amount: number, title: string, description: string) => WalletTransaction | null;
  deductDemoBalance: (playerId: string, amount: number, title: string, description: string) => WalletTransaction | null;

  createReport: (reportedBy: string, reportedByName: string, targetType: ReportTargetType, targetId: string, targetName: string, reason: ReportReason, description: string) => PlatformReport;
  resolveReport: (reportId: string, status: ReportStatus, notes: string) => boolean;

  createAnnouncement: (title: string, content: string, target: 'EVERYONE' | 'PLAYERS' | 'ORGANIZERS', status?: 'DRAFT' | 'PUBLISHED') => PlatformAnnouncement;
  deleteAnnouncement: (announcementId: string) => boolean;

  updateSettings: (settings: PlatformSettings) => void;
  seedAdminData: () => void;
  resetAdminData: () => void;
  refreshData: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(() => adminService.getAdminProfile());
  const [analytics, setAnalytics] = useState<PlatformAnalyticsOverview>(() => adminService.getAnalytics());
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [reports, setReports] = useState<PlatformReport[]>([]);
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(() => adminService.getSettings());

  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [organizers, setOrganizers] = useState<OrganizerProfile[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);

  const refreshData = useCallback(() => {
    setAdminProfile(adminService.getAdminProfile());
    setAuditLogs(adminService.getAuditLogs());
    setReports(adminService.getAllReports());
    setAnnouncements(adminService.getAllAnnouncements());
    setSettings(adminService.getSettings());

    setPlayers(adminService.getAllPlayers());
    setTeams(adminService.getAllTeams());
    setOrganizers(adminService.getAllOrganizers());
    setTournaments(adminService.getAllTournaments());
    setRegistrations(adminService.getAllRegistrations());
    setMatches(adminService.getAllMatches());
    setResults(adminService.getAllResults());

    setAnalytics(adminService.getAnalytics());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      adminService.seedAdminData();
      refreshData();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshData]);

  // Actions
  const suspendPlayer = (playerId: string, reason: string) => {
    const res = adminService.suspendPlayer(adminProfile.id, playerId, reason);
    refreshData();
    return res;
  };

  const unsuspendPlayer = (playerId: string) => {
    const res = adminService.unsuspendPlayer(adminProfile.id, playerId);
    refreshData();
    return res;
  };

  const resetPlayerWallet = (playerId: string) => {
    const res = adminService.resetPlayerWallet(adminProfile.id, playerId);
    refreshData();
    return res;
  };

  const resetPlayerStats = (playerId: string) => {
    const res = adminService.resetPlayerStats(adminProfile.id, playerId);
    refreshData();
    return res;
  };

  const suspendTeam = (teamId: string, reason: string) => {
    const res = adminService.suspendTeam(adminProfile.id, teamId, reason);
    refreshData();
    return res;
  };

  const restoreTeam = (teamId: string) => {
    const res = adminService.restoreTeam(adminProfile.id, teamId);
    refreshData();
    return res;
  };

  const approveOrganizer = (organizerId: string) => {
    const res = adminService.approveOrganizer(adminProfile.id, organizerId);
    refreshData();
    return res;
  };

  const suspendOrganizer = (organizerId: string, reason: string) => {
    const res = adminService.suspendOrganizer(adminProfile.id, organizerId, reason);
    refreshData();
    return res;
  };

  const changeTournamentStatus = (tournamentId: string, status: TournamentStatus, reason?: string) => {
    const res = adminService.changeTournamentStatus(adminProfile.id, tournamentId, status, reason);
    refreshData();
    return res;
  };

  const deleteDemoTournament = (tournamentId: string) => {
    const res = adminService.deleteDemoTournament(adminProfile.id, tournamentId);
    refreshData();
    return res;
  };

  const forceConfirmRegistration = (registrationId: string) => {
    const res = adminService.forceConfirmRegistration(adminProfile.id, registrationId);
    refreshData();
    return res;
  };

  const removeDemoResult = (resultId: string) => {
    const res = adminService.removeDemoResult(adminProfile.id, resultId);
    refreshData();
    return res;
  };

  const recalculateLeaderboard = (tournamentId: string) => {
    adminService.recalculateLeaderboard(adminProfile.id, tournamentId);
    refreshData();
  };

  const addDemoCredit = (playerId: string, amount: number, title: string, description: string) => {
    const tx = adminService.addDemoCredit(adminProfile.id, playerId, amount, title, description);
    refreshData();
    return tx;
  };

  const deductDemoBalance = (playerId: string, amount: number, title: string, description: string) => {
    const tx = adminService.deductDemoBalance(adminProfile.id, playerId, amount, title, description);
    refreshData();
    return tx;
  };

  const createReport = (reportedBy: string, reportedByName: string, targetType: ReportTargetType, targetId: string, targetName: string, reason: ReportReason, description: string) => {
    const rep = adminService.createReport(reportedBy, reportedByName, targetType, targetId, targetName, reason, description);
    refreshData();
    return rep;
  };

  const resolveReport = (reportId: string, status: ReportStatus, notes: string) => {
    const res = adminService.resolveReport(adminProfile.id, reportId, status, notes);
    refreshData();
    return res;
  };

  const createAnnouncement = (title: string, content: string, target: 'EVERYONE' | 'PLAYERS' | 'ORGANIZERS', status: 'DRAFT' | 'PUBLISHED' = 'PUBLISHED') => {
    const ann = adminService.createAnnouncement(adminProfile.id, title, content, target, status);
    refreshData();
    return ann;
  };

  const deleteAnnouncement = (announcementId: string) => {
    const res = adminService.deleteAnnouncement(adminProfile.id, announcementId);
    refreshData();
    return res;
  };

  const updateSettings = (newSettings: PlatformSettings) => {
    adminService.saveSettings(adminProfile.id, newSettings);
    refreshData();
  };

  const seedAdminData = () => {
    adminService.seedAdminData();
    refreshData();
  };

  const resetAdminData = () => {
    adminService.resetAdminData();
    refreshData();
  };

  return (
    <AdminContext.Provider
      value={{
        adminProfile,
        analytics,
        auditLogs,
        reports,
        announcements,
        settings,
        players,
        teams,
        organizers,
        tournaments,
        registrations,
        matches,
        results,

        suspendPlayer,
        unsuspendPlayer,
        resetPlayerWallet,
        resetPlayerStats,

        suspendTeam,
        restoreTeam,

        approveOrganizer,
        suspendOrganizer,

        changeTournamentStatus,
        deleteDemoTournament,

        forceConfirmRegistration,
        removeDemoResult,
        recalculateLeaderboard,

        addDemoCredit,
        deductDemoBalance,

        createReport,
        resolveReport,

        createAnnouncement,
        deleteAnnouncement,

        updateSettings,
        seedAdminData,
        resetAdminData,
        refreshData
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return ctx;
};
