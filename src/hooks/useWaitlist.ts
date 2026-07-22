import { useRegistrations } from '@/providers/RegistrationProvider';
import { useMemo, useCallback } from 'react';
import { registrationService } from '@/lib/services/registration-service';

export function useWaitlist(tournamentId?: string) {
  const { registrations, promoteWaitlistEntry } = useRegistrations();

  const waitlist = useMemo(() => {
    return registrationService.getWaitlist(tournamentId);
  }, [registrations, tournamentId]);

  const promote = useCallback((tId: string) => {
    return promoteWaitlistEntry(tId);
  }, [promoteWaitlistEntry]);

  return {
    waitlist,
    promoteWaitlistEntry: promote
  };
}
