'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Tournament, 
  Registration, 
  Match, 
  MatchResult,
  ResultDispute, 
  PrizeDistributionRecord, 
  OrganizerProfile, 
  OrganizerSettings, 
  OrganizerActivity,
  OrganizerSummary,
  OrganizerRole,
  TournamentStatus,
  RegistrationRejectionReason,
  OrganizerAnnouncement
} from '@/types';
import { organizerService } from '@/lib/services/organizer-service';
import { localOrganizerTournamentRepository } from '@/repositories/local/local-organizer-tournament-repository';
import { localOrganizerActivityRepository } from '@/repositories/local/local-organizer-activity-repository';
import { localOrganizerSettingsRepository } from '@/repositories/local/local-organizer-settings-repository';
import { localPrizeDistributionRepository } from '@/repositories/local/local-prize-distribution-repository';
import { useAuth } from './AuthProvider';

interface OrganizerContextType {
  organizer: OrganizerProfile | null;
  managedTournaments: Tournament[];
  organizerSummary: OrganizerSummary | null;
  organizerActivities: OrganizerActivity[];
  organizerSettings: OrganizerSettings | null;
  prizeDistributions: PrizeDistributionRecord[];
  loading: boolean;
  error: string | null;
  
  createTournament: (data: Partial<Tournament>) => Tournament;
  updateTournament: (tournamentId: string, updates: Partial<Tournament>) => Tournament | null;
  duplicateTournament: (tournamentId: string) => Tournament | null;
  changeTournamentStatus: (tournamentId: string, status: TournamentStatus) => boolean;
  approveRegistration: (registrationId: string) => boolean;
  rejectRegistration: (registrationId: string, reason: RegistrationRejectionReason, notes?: string) => boolean;
  assignSlot: (tournamentId: string, slotNumber: number, registrationId: string) => boolean;
  swapSlots: (tournamentId: string, slotA: number, slotB: number) => boolean;
  createMatch: (tournamentId: string, data: Partial<Match>) => Match;
  releaseCredentials: (matchId: string, roomId: string, password: string) => boolean;
  publishAnnouncement: (data: Partial<OrganizerAnnouncement>) => OrganizerAnnouncement;
  publishResult: (resultId: string) => boolean;
  correctResult: (resultId: string, updates: Partial<MatchResult>, reason: string) => boolean;
  resolveDispute: (disputeId: string, resolution: 'ACCEPTED' | 'REJECTED', notes: string) => boolean;
  calculatePrizeDistribution: (tournamentId: string) => PrizeDistributionRecord;
  approvePrizeDistribution: (tournamentId: string) => boolean;
  creditDemoPrizes: (tournamentId: string) => boolean;
  updateSettings: (updates: Partial<OrganizerSettings>) => void;
  seedOrganizerData: () => void;
  resetOrganizerData: () => void;
  refreshData: () => void;
}

const OrganizerContext = createContext<OrganizerContextType | undefined>(undefined);

export const OrganizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizer, setOrganizer] = useState<OrganizerProfile | null>(null);
  const [managedTournaments, setManagedTournaments] = useState<Tournament[]>([]);
  const [organizerSummary, setOrganizerSummary] = useState<OrganizerSummary | null>(null);
  const [organizerActivities, setOrganizerActivities] = useState<OrganizerActivity[]>([]);
  const [organizerSettings, setOrganizerSettings] = useState<OrganizerSettings | null>(null);
  const [prizeDistributions, setPrizeDistributions] = useState<PrizeDistributionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user, isLoaded } = useAuth();

  const refreshData = useCallback(() => {
    try {
      setLoading(true);
      const profile = organizerService.getProfile();
      if (profile) {
        setOrganizer(profile);
        const tour = localOrganizerTournamentRepository.getByOrganizer(profile.id);
        setManagedTournaments(tour);

        const acts = localOrganizerActivityRepository.getByOrganizer(profile.id);
        setOrganizerActivities(acts.reverse()); // Show newest activities first

        const settings = localOrganizerSettingsRepository.get(profile.id);
        setOrganizerSettings(settings);

        const prizes = localPrizeDistributionRepository.getAll();
        setPrizeDistributions(prizes);

        // Compute summary metrics
        const drafts = tour.filter((t) => t.status === 'DRAFT').length;
        const pub = tour.filter((t) => t.status === 'REGISTRATION_OPEN' || t.status === 'Registration Open').length;
        const live = tour.filter((t) => t.status === 'LIVE' || t.status === 'Live').length;
        const comp = tour.filter((t) => t.status === 'COMPLETED' || t.status === 'Completed').length;
        
        // Count registrations
        const regs = tour.reduce((sum, t) => sum + (t.registeredParticipants || 0), 0);

        setOrganizerSummary({
          totalTournaments: tour.length,
          draftTournaments: drafts,
          publishedTournaments: pub,
          liveTournaments: live,
          completedTournaments: comp,
          totalRegistrations: regs,
          pendingApprovals: 1, // Mock
          upcomingMatches: 1, // Mock
          resultsPendingReview: 0,
          openDisputes: 1, // Mock
          demoPrizeObligations: tour.reduce((sum, t) => sum + (t.prizePool || 0), 0)
        });
      } else {
        setOrganizer(null);
        setManagedTournaments([]);
        setOrganizerSummary(null);
        setOrganizerActivities([]);
        setOrganizerSettings(null);
        setPrizeDistributions([]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh organizer session.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        // Automatically seed profile if none exists for demo convenience
        const profile = organizerService.getProfile();
        if (!profile) {
          organizerService.seedData();
        }
        refreshData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, refreshData]);

  const createTournament = (data: Partial<Tournament>) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const tour = organizerService.createTournament(organizer.id, data);
    refreshData();
    return tour;
  };

  const updateTournament = (tournamentId: string, updates: Partial<Tournament>) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const tour = organizerService.updateTournament(organizer.id, tournamentId, updates);
    refreshData();
    return tour;
  };

  const duplicateTournament = (tournamentId: string) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const tour = organizerService.duplicateTournament(organizer.id, tournamentId);
    refreshData();
    return tour;
  };

  const changeTournamentStatus = (tournamentId: string, status: TournamentStatus) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const res = organizerService.changeTournamentStatus(organizer.id, tournamentId, status);
    refreshData();
    return res;
  };

  const approveRegistration = (registrationId: string) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const res = organizerService.approveRegistration(organizer.id, registrationId);
    refreshData();
    return res;
  };

  const rejectRegistration = (registrationId: string, reason: RegistrationRejectionReason, notes?: string) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const res = organizerService.rejectRegistration(organizer.id, registrationId, reason, notes);
    refreshData();
    return res;
  };

  const assignSlot = (tournamentId: string, slotNumber: number, registrationId: string) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const res = organizerService.assignSlot(organizer.id, tournamentId, slotNumber, registrationId);
    refreshData();
    return res;
  };

  const swapSlots = (tournamentId: string, slotA: number, slotB: number) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const res = organizerService.swapSlots(organizer.id, tournamentId, slotA, slotB);
    refreshData();
    return res;
  };

  const createMatch = (tournamentId: string, data: Partial<Match>) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const m = organizerService.createMatch(organizer.id, tournamentId, data);
    refreshData();
    return m;
  };

  const releaseCredentials = (matchId: string, roomId: string, password: string) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const res = organizerService.releaseCredentials(organizer.id, matchId, roomId, password);
    refreshData();
    return res;
  };

  const publishAnnouncement = (data: Partial<OrganizerAnnouncement>) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const ann = organizerService.publishAnnouncement(organizer.id, data);
    refreshData();
    return ann;
  };

  const publishResult = (resultId: string) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const res = organizerService.publishMatchResult(organizer.id, resultId);
    refreshData();
    return res;
  };

  const correctResult = (resultId: string, updates: Partial<MatchResult>, reason: string) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const res = organizerService.correctMatchResult(organizer.id, resultId, updates, reason);
    refreshData();
    return res;
  };

  const resolveDispute = (disputeId: string, resolution: 'ACCEPTED' | 'REJECTED', notes: string) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const res = organizerService.resolveDispute(organizer.id, disputeId, resolution, notes);
    refreshData();
    return res;
  };

  const calculatePrizeDistribution = (tournamentId: string) => {
    const record = organizerService.calculatePrizeDistribution(tournamentId);
    refreshData();
    return record;
  };

  const approvePrizeDistribution = (tournamentId: string) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const res = organizerService.approvePrizeDistribution(organizer.id, tournamentId);
    refreshData();
    return res;
  };

  const creditDemoPrizes = (tournamentId: string) => {
    if (!organizer) throw new Error('No active organizer profile.');
    const res = organizerService.creditDemoPrizes(organizer.id, tournamentId);
    refreshData();
    return res;
  };

  const updateSettings = (updates: Partial<OrganizerSettings>) => {
    if (!organizer) return;
    const settings = localOrganizerSettingsRepository.get(organizer.id);
    if (settings) {
      const updated = { ...settings, ...updates };
      localOrganizerSettingsRepository.save(updated);
      refreshData();
    }
  };

  const seedOrganizerData = () => {
    organizerService.seedData();
    refreshData();
  };

  const resetOrganizerData = () => {
    organizerService.resetData();
    refreshData();
  };

  return (
    <OrganizerContext.Provider
      value={{
        organizer,
        managedTournaments,
        organizerSummary,
        organizerActivities,
        organizerSettings,
        prizeDistributions,
        loading,
        error,
        createTournament,
        updateTournament,
        duplicateTournament,
        changeTournamentStatus,
        approveRegistration,
        rejectRegistration,
        assignSlot,
        swapSlots,
        createMatch,
        releaseCredentials,
        publishAnnouncement,
        publishResult,
        correctResult,
        resolveDispute,
        calculatePrizeDistribution,
        approvePrizeDistribution,
        creditDemoPrizes,
        updateSettings,
        seedOrganizerData,
        resetOrganizerData,
        refreshData
      }}
    >
      {children}
    </OrganizerContext.Provider>
  );
};

export const useOrganizer = () => {
  const context = useContext(OrganizerContext);
  if (context === undefined) {
    throw new Error('useOrganizer must be used within an OrganizerProvider');
  }
  return context;
};
export default useOrganizer;
