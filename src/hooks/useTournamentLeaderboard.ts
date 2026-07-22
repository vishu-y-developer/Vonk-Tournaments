import { useResults } from '@/providers/ResultProvider';
import { useMemo } from 'react';

export function useTournamentLeaderboard(tournamentId: string) {
  const { standings, loading, recalculateStandings } = useResults();

  const leaderboard = useMemo(() => {
    return standings.filter((s) => s.tournamentId === tournamentId);
  }, [standings, tournamentId]);

  return {
    standings: leaderboard,
    loading,
    recalculate: () => recalculateStandings(tournamentId)
  };
}
