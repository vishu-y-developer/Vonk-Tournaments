import { useResults } from '@/providers/ResultProvider';
import { useMemo } from 'react';

export function useResultDisputes(tournamentId?: string) {
  const { disputes, disputeResult, loading } = useResults();

  const filteredDisputes = useMemo(() => {
    if (!tournamentId) return disputes;
    return disputes.filter((d) => d.tournamentId === tournamentId);
  }, [disputes, tournamentId]);

  return {
    disputes: filteredDisputes,
    disputeResult,
    loading
  };
}
