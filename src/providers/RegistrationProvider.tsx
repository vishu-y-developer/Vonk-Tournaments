'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Registration,
  Tournament,
  Player,
  Team,
  RegistrationEligibility,
  TournamentSlot,
  WaitlistEntry,
  RegistrationActivity
} from '@/types';
import { registrationService } from '@/lib/services/registration-service';
import { useWallet } from './WalletProvider';

interface RegistrationContextType {
  registrations: Registration[];
  loading: boolean;
  error: string | null;
  validateEligibility: (
    tournament: Tournament,
    player: Player,
    team?: Team | null,
    selectedRosterIds?: string[]
  ) => RegistrationEligibility;
  submitRegistration: (params: {
    tournament: Tournament;
    player: Player;
    team?: Team | null;
    selectedRosterIds?: string[];
    selectedSlotNumber?: number;
    consent: boolean;
  }) => { success: boolean; error?: string; registration?: Registration };
  cancelRegistration: (registrationId: string, reason: string) => { success: boolean; error?: string };
  promoteWaitlistEntry: (tournamentId: string) => { success: boolean; error?: string };
  getAvailableSlots: (tournamentId: string) => TournamentSlot[];
  getRegistration: (id: string) => Registration | null;
  getTournamentRegistration: (tournamentId: string, playerId: string) => Registration | null;
  getActivities: (registrationId?: string) => RegistrationActivity[];
  resetRegistrationData: () => void;
  seedRegistrationData: () => void;
  refreshRegistrations: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { refreshWallet } = useWallet();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = useCallback(() => {
    try {
      setLoading(true);
      const list = registrationService.getAll();
      setRegistrations(list);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch registrations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchRegistrations();
    }, 0);
  }, [fetchRegistrations]);

  const validateEligibility = useCallback((
    tournament: Tournament,
    player: Player,
    team?: Team | null,
    selectedRosterIds?: string[]
  ) => {
    return registrationService.validateRegistrationEligibility(tournament, player, team, selectedRosterIds);
  }, []);

  const submitRegistration = useCallback((params: {
    tournament: Tournament;
    player: Player;
    team?: Team | null;
    selectedRosterIds?: string[];
    selectedSlotNumber?: number;
    consent: boolean;
  }) => {
    const res = registrationService.submitRegistration(params);
    if (res.success) {
      fetchRegistrations();
      refreshWallet();
    }
    return res;
  }, [fetchRegistrations, refreshWallet]);

  const cancelRegistration = useCallback((registrationId: string, reason: string) => {
    const res = registrationService.cancelRegistration(registrationId, reason);
    if (res.success) {
      fetchRegistrations();
      refreshWallet();
    }
    return res;
  }, [fetchRegistrations, refreshWallet]);

  const promoteWaitlistEntry = useCallback((tournamentId: string) => {
    const res = registrationService.promoteWaitlistEntry(tournamentId);
    if (res.success) {
      fetchRegistrations();
    }
    return res;
  }, [fetchRegistrations]);

  const getAvailableSlots = useCallback((tournamentId: string) => {
    return registrationService.getAvailableSlots(tournamentId);
  }, []);

  const getRegistration = useCallback((id: string) => {
    return registrationService.getById(id);
  }, []);

  const getTournamentRegistration = useCallback((tournamentId: string, playerId: string) => {
    const list = registrationService.getAll();
    return list.find(
      (r) => r.tournamentId === tournamentId && 
             r.playerId === playerId && 
             r.status !== 'CANCELLED' && 
             r.status !== 'REFUNDED'
    ) || null;
  }, []);

  const getActivities = useCallback((registrationId?: string) => {
    return registrationService.getActivities(registrationId);
  }, []);

  const resetRegistrationData = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('vonk:v1:registrations');
    localStorage.removeItem('vonk:v1:tournament-slots');
    localStorage.removeItem('vonk:v1:registration-activities');
    localStorage.removeItem('vonk:v1:waitlist');
    fetchRegistrations();
  }, [fetchRegistrations]);

  const seedRegistrationData = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Seed standard registrations
    const seeds: Registration[] = [
      {
        id: 'VONK-REG-FREE1',
        tournamentId: 'tour-1',
        tournamentTitle: 'VONK BGMI Solo Ultimate Battlegrounds',
        playerId: 'user-player-1',
        membersRegistered: [
          { playerId: 'user-player-1', inGameName: 'VONK_Gamer', characterId: '5123984561', role: 'Captain' }
        ],
        slotNumber: 15,
        entryFeePaid: 0,
        paymentStatus: 'SIMULATED',
        paymentMethod: 'Simulated Wallet',
        registeredAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'CONFIRMED',
        operationId: 'VONK-OP-SEED1'
      },
      {
        id: 'VONK-REG-PAID1',
        tournamentId: 'tour-2',
        tournamentTitle: 'VONK BGMI Squad Showdown Elite',
        playerId: 'user-player-1',
        teamId: 'team-1',
        teamName: 'Apex Hunters',
        membersRegistered: [
          { playerId: 'user-player-1', inGameName: 'VONK_Gamer', characterId: '5123984561', role: 'Captain' },
          { playerId: 'player-2', inGameName: 'Mamba_BGMI', characterId: '5123984562', role: 'Member' },
          { playerId: 'player-3', inGameName: 'Slayer_YT', characterId: '5123984563', role: 'Member' },
          { playerId: 'player-4', inGameName: 'Dynamo_Op', characterId: '5123984564', role: 'Member' }
        ],
        slotNumber: 7,
        entryFeePaid: 50,
        paymentStatus: 'SUCCESS',
        paymentMethod: 'Simulated Wallet',
        registeredAt: new Date(Date.now() - 172800000).toISOString(),
        status: 'CONFIRMED',
        operationId: 'VONK-OP-SEED2'
      },
      {
        id: 'VONK-REG-WL1',
        tournamentId: 'tour-3',
        tournamentTitle: 'VONK BGMI Duo Championship Arena',
        playerId: 'user-player-1',
        teamId: 'team-1',
        teamName: 'Apex Hunters',
        membersRegistered: [
          { playerId: 'user-player-1', inGameName: 'VONK_Gamer', characterId: '5123984561', role: 'Captain' },
          { playerId: 'player-2', inGameName: 'Mamba_BGMI', characterId: '5123984562', role: 'Member' }
        ],
        entryFeePaid: 20,
        paymentStatus: 'SUCCESS',
        paymentMethod: 'Simulated Wallet',
        registeredAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'WAITLISTED',
        operationId: 'VONK-OP-SEED3'
      }
    ];

    localStorage.setItem('vonk:v1:registrations', JSON.stringify(seeds));

    // Seed Slots
    const slots: TournamentSlot[] = [
      {
        id: 'slot-tour-1-15',
        tournamentId: 'tour-1',
        slotNumber: 15,
        status: 'OCCUPIED',
        registrationId: 'VONK-REG-FREE1',
        participantId: 'user-player-1',
        participantName: 'VONK_Gamer',
        confirmedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'slot-tour-2-7',
        tournamentId: 'tour-2',
        slotNumber: 7,
        status: 'OCCUPIED',
        registrationId: 'VONK-REG-PAID1',
        participantId: 'team-1',
        participantName: 'Apex Hunters',
        teamId: 'team-1',
        teamName: 'Apex Hunters',
        confirmedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    localStorage.setItem('vonk:v1:tournament-slots', JSON.stringify(slots));

    // Seed Waitlist
    const waitlist: WaitlistEntry[] = [
      {
        id: 'wl-seed-1',
        tournamentId: 'tour-3',
        playerId: 'user-player-1',
        teamId: 'team-1',
        position: 1,
        joinedAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'WAITING'
      }
    ];
    localStorage.setItem('vonk:v1:waitlist', JSON.stringify(waitlist));

    fetchRegistrations();
  }, [fetchRegistrations]);

  return (
    <RegistrationContext.Provider
      value={{
        registrations,
        loading,
        error,
        validateEligibility,
        submitRegistration,
        cancelRegistration,
        promoteWaitlistEntry,
        getAvailableSlots,
        getRegistration,
        getTournamentRegistration,
        getActivities,
        resetRegistrationData,
        seedRegistrationData,
        refreshRegistrations: fetchRegistrations
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistrations = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistrations must be used within a RegistrationProvider');
  }
  return context;
};
