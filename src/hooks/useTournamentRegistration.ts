import { useRegistrations } from '@/providers/RegistrationProvider';
import { useMemo } from 'react';

export function useTournamentRegistration(tournamentId: string, playerId: string) {
  const { registrations, getTournamentRegistration } = useRegistrations();

  return useMemo(() => {
    return getTournamentRegistration(tournamentId, playerId);
  }, [registrations, tournamentId, playerId, getTournamentRegistration]);
}
