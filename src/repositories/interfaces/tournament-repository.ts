import { Tournament } from '@/types';

export interface TournamentRepository {
  getAll(): Tournament[];
  getById(id: string): Tournament | null;
  getBySlug(slug: string): Tournament | null;
  save(tournament: Tournament): void;
  saveAll(tournaments: Tournament[]): void;
}
