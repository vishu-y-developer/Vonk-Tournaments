import { useResults } from '@/providers/ResultProvider';
import { useMemo } from 'react';

export function useMVP(tournamentId: string, matchId?: string) {
  const { getMVP, loading } = useResults();

  const mvp = useMemo(() => {
    return getMVP(tournamentId, matchId);
  }, [getMVP, tournamentId, matchId]);

  return {
    mvp,
    loading
  };
}
