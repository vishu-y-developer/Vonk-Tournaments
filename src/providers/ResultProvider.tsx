'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  MatchResult, 
  TournamentStanding, 
  ResultPenalty, 
  MVPRecord, 
  ResultDispute,
  ResultStatus,
  PenaltyType,
  ScoringConfiguration,
  ScoringSystem
} from '@/types';
import { resultService } from '@/lib/services/result-service';
import { localResultRepository } from '@/repositories/local/local-result-repository';
import { localStandingRepository } from '@/repositories/local/local-standing-repository';
import { localPenaltyRepository } from '@/repositories/local/local-penalty-repository';
import { localMVPRepository } from '@/repositories/local/local-mvp-repository';
import { localDisputeRepository } from '@/repositories/local/local-dispute-repository';

interface ResultContextType {
  results: MatchResult[];
  standings: TournamentStanding[];
  penalties: ResultPenalty[];
  mvpRecords: MVPRecord[];
  disputes: ResultDispute[];
  loading: boolean;
  error: string | null;
  
  getMatchResults: (matchId: string) => MatchResult[];
  getTournamentStandings: (tournamentId: string) => TournamentStanding[];
  getParticipantResults: (participantId: string) => MatchResult[];
  calculateMatchResult: (
    placement: number,
    kills: number,
    system: ScoringSystem,
    bonusPoints?: number,
    penaltyPoints?: number
  ) => { placementPoints: number; killPoints: number; totalPoints: number };
  recalculateStandings: (tournamentId: string) => TournamentStanding[];
  publishResult: (resultId: string) => boolean;
  correctResult: (resultId: string, updates: Partial<MatchResult>, reason: string, correctedBy: string) => boolean;
  disputeResult: (resultId: string, playerId: string, reason: string, description: string) => ResultDispute | null;
  finalizeResult: (resultId: string) => boolean;
  getMVP: (tournamentId: string, matchId?: string) => MVPRecord | null;
  getTopFragger: (tournamentId: string, matchId?: string) => MVPRecord | null;
  seedResultData: () => void;
  resetResultData: () => void;
  refreshResults: () => void;
}

const ResultContext = createContext<ResultContextType | undefined>(undefined);

export const ResultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [standings, setStandings] = useState<TournamentStanding[]>([]);
  const [penalties, setPenalties] = useState<ResultPenalty[]>([]);
  const [mvpRecords, setMvpRecords] = useState<MVPRecord[]>([]);
  const [disputes, setDisputes] = useState<ResultDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(() => {
    try {
      setLoading(true);
      const res = localResultRepository.getAll();
      const std = localStandingRepository.getAll();
      const pen = localPenaltyRepository.getAll();
      const mvp = localMVPRepository.getAll();
      const disp = localDisputeRepository.getAll();

      setResults(res);
      setStandings(std);
      setPenalties(pen);
      setMvpRecords(mvp);
      setDisputes(disp);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Failed to retrieve result records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAllData]);

  const getMatchResults = useCallback((matchId: string) => {
    return results.filter((r) => r.matchId === matchId);
  }, [results]);

  const getTournamentStandings = useCallback((tournamentId: string) => {
    return standings.filter((s) => s.tournamentId === tournamentId);
  }, [standings]);

  const getParticipantResults = useCallback((participantId: string) => {
    return results.filter((r) => r.participantId === participantId);
  }, [results]);

  const calculateMatchResult = useCallback((
    placement: number,
    kills: number,
    system: ScoringSystem,
    bonusPoints = 0,
    penaltyPoints = 0
  ) => {
    return resultService.calculateTotalMatchPoints(placement, kills, system, bonusPoints, penaltyPoints);
  }, []);

  const recalculateStandings = useCallback((tournamentId: string) => {
    const std = resultService.recalculateStandings(tournamentId);
    fetchAllData();
    return std;
  }, [fetchAllData]);

  const publishResult = useCallback((resultId: string) => {
    const success = resultService.publishResult(resultId);
    if (success) {
      fetchAllData();
    }
    return success;
  }, [fetchAllData]);

  const correctResult = useCallback((
    resultId: string, 
    updates: Partial<MatchResult>, 
    reason: string, 
    correctedBy: string
  ) => {
    const success = resultService.correctResult(resultId, updates, reason, correctedBy);
    if (success) {
      fetchAllData();
    }
    return success;
  }, [fetchAllData]);

  const disputeResult = useCallback((
    resultId: string, 
    playerId: string, 
    reason: string, 
    description: string
  ) => {
    const disp = resultService.disputeResult(resultId, playerId, reason, description);
    if (disp) {
      fetchAllData();
    }
    return disp;
  }, [fetchAllData]);

  const finalizeResult = useCallback((resultId: string) => {
    const success = resultService.finalizeResult(resultId);
    if (success) {
      fetchAllData();
    }
    return success;
  }, [fetchAllData]);

  const getMVP = useCallback((tournamentId: string, matchId?: string) => {
    const list = mvpRecords.filter((m) => m.tournamentId === tournamentId && (matchId ? m.matchId === matchId : true));
    return list.length > 0 ? list[0] : null;
  }, [mvpRecords]);

  const getTopFragger = useCallback((tournamentId: string, matchId?: string) => {
    const list = mvpRecords.filter(
      (m) => m.tournamentId === tournamentId && 
             m.category === 'Top Fragger' && 
             (matchId ? m.matchId === matchId : true)
    );
    return list.length > 0 ? list[0] : null;
  }, [mvpRecords]);

  const seedResultData = useCallback(() => {
    resultService.seedResultData();
    fetchAllData();
  }, [fetchAllData]);

  const resetResultData = useCallback(() => {
    resultService.resetResultData();
    fetchAllData();
  }, [fetchAllData]);

  return (
    <ResultContext.Provider
      value={{
        results,
        standings,
        penalties,
        mvpRecords,
        disputes,
        loading,
        error,
        getMatchResults,
        getTournamentStandings,
        getParticipantResults,
        calculateMatchResult,
        recalculateStandings,
        publishResult,
        correctResult,
        disputeResult,
        finalizeResult,
        getMVP,
        getTopFragger,
        seedResultData,
        resetResultData,
        refreshResults: fetchAllData
      }}
    >
      {children}
    </ResultContext.Provider>
  );
};

export const useResults = () => {
  const context = useContext(ResultContext);
  if (!context) {
    throw new Error('useResults must be used within a ResultProvider');
  }
  return context;
};
