'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Tournament } from '@/types';
import { tournamentService } from '@/lib/services/tournament-service';
import { registrationService } from '@/lib/services/registration-service';
import { useAuth } from './AuthProvider';

interface TournamentContextType {
  tournaments: Tournament[];
  getTournamentBySlug: (slug: string) => Tournament | null;
  getTournamentById: (id: string) => Tournament | null;
  createTournament: (data: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt' | 'registeredParticipants'>) => Tournament;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  duplicateTournament: (id: string) => void;
  cancelTournament: (id: string) => void;
  refreshTournaments: () => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const { isLoaded } = useAuth();

  const refreshTournaments = useCallback(() => {
    setTournaments(tournamentService.getAll());
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        refreshTournaments();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, refreshTournaments]);

  const getTournamentBySlug = (slug: string) => {
    return tournamentService.getBySlug(slug);
  };

  const getTournamentById = (id: string) => {
    return tournamentService.getById(id);
  };

  const createTournament = (data: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt' | 'registeredParticipants'>) => {
    const created = tournamentService.createTournament(data);
    refreshTournaments();
    return created;
  };

  const updateTournament = (id: string, updates: Partial<Tournament>) => {
    tournamentService.updateTournament(id, updates);
    refreshTournaments();
  };

  const duplicateTournament = (id: string) => {
    tournamentService.duplicateTournament(id);
    refreshTournaments();
  };

  const cancelTournament = (id: string) => {
    // 1. Cancel the tournament status
    tournamentService.cancelTournament(id);
    // 2. Automatically trigger refunds for registered players
    registrationService.processCancellationRefunds(id);
    refreshTournaments();
  };

  return (
    <TournamentContext.Provider
      value={{
        tournaments,
        getTournamentBySlug,
        getTournamentById,
        createTournament,
        updateTournament,
        duplicateTournament,
        cancelTournament,
        refreshTournaments,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournaments = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournaments must be used within a TournamentProvider');
  }
  return context;
};
