import { useRegistrations } from '@/providers/RegistrationProvider';
import { useMemo } from 'react';
import { registrationService } from '@/lib/services/registration-service';
import { Tournament } from '@/types';

export function useTournamentSlots(tournamentId: string) {
  const { registrations } = useRegistrations();

  return useMemo(() => {
    const slots = registrationService.generateSlots({ id: tournamentId } as unknown as Tournament);
    const available = slots.filter((s) => s.status === 'AVAILABLE');
    const occupied = slots.filter((s) => s.status === 'OCCUPIED');
    const reserved = slots.filter((s) => s.status === 'RESERVED');
    return {
      slots,
      available,
      occupied,
      reserved
    };
  }, [registrations, tournamentId]);
}
