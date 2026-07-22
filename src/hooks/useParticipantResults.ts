import { useResults } from '@/providers/ResultProvider';
import { useMemo } from 'react';

export function useParticipantResults(participantId: string) {
  const { results, loading } = useResults();

  const participantResults = useMemo(() => {
    return results.filter((r) => r.participantId === participantId);
  }, [results, participantId]);

  return {
    results: participantResults,
    loading
  };
}
