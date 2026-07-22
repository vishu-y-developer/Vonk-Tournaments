import { useResults } from '@/providers/ResultProvider';
import { useMemo } from 'react';

export function useTopFragger(tournamentId: string, matchId?: string) {
  const { getTopFragger, loading } = useResults();

  const topFragger = useMemo(() => {
    return getTopFragger(tournamentId, matchId);
  }, [getTopFragger, tournamentId, matchId]);

  return {
    topFragger,
    loading
  };
}
