import { useRegistrations } from '@/providers/RegistrationProvider';
import { Tournament, Player, Team } from '@/types';
import { useMemo } from 'react';

export function useRegistrationEligibility(
  tournament: Tournament,
  player: Player,
  team?: Team | null,
  selectedRosterIds?: string[]
) {
  const { validateEligibility } = useRegistrations();

  return useMemo(() => {
    return validateEligibility(tournament, player, team, selectedRosterIds);
  }, [validateEligibility, tournament, player, team, selectedRosterIds]);
}
