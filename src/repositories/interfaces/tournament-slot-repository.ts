import { TournamentSlot } from '@/types';

export interface TournamentSlotRepository {
  getAll(): TournamentSlot[];
  getByTournamentId(tournamentId: string): TournamentSlot[];
  save(slot: TournamentSlot): void;
  saveAll(slots: TournamentSlot[]): void;
  reset(tournamentId: string): void;
}
