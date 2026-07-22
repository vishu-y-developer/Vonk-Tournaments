import { useResults } from '@/providers/ResultProvider';
import { useMemo } from 'react';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';
import { ResultRevision } from '@/types';

export function useResultDetails(resultId: string) {
  const { results, penalties, loading } = useResults();

  const result = useMemo(() => {
    return results.find((r) => r.id === resultId) || null;
  }, [results, resultId]);

  const resultPenalties = useMemo(() => {
    return penalties.filter((p) => p.resultId === resultId);
  }, [penalties, resultId]);

  const revisions = useMemo(() => {
    const list = browserStorage.getItem<ResultRevision[]>(STORAGE_KEYS.RESULT_REVISIONS, []);
    return list.filter((r) => r.resultId === resultId);
  }, [resultId]);

  return {
    result,
    penalties: resultPenalties,
    revisions,
    loading
  };
}
