import { useResults } from '@/providers/ResultProvider';
import { useMemo } from 'react';

export function useMatchResults(matchId: string) {
  const { results, loading, publishResult, correctResult } = useResults();
  
  const matchResults = useMemo(() => {
    return results.filter((r) => r.matchId === matchId);
  }, [results, matchId]);

  return {
    results: matchResults,
    loading,
    publishResult,
    correctResult
  };
}
