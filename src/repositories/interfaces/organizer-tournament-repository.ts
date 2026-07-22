import { Tournament } from '@/types';

export interface OrganizerTournamentRepository {
  getByOrganizer(organizerId: string): Tournament[];
  save(tournament: Tournament): void;
  getAll(): Tournament[];
  saveAll(tournaments: Tournament[]): void;
}
