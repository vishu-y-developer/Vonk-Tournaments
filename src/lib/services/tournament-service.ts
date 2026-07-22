import { Tournament } from '@/types';
import { localTournamentRepository } from '@/repositories/local/local-tournament-repository';

export class TournamentService {
  getAll(): Tournament[] {
    return localTournamentRepository.getAll();
  }

  getById(id: string): Tournament | null {
    return localTournamentRepository.getById(id);
  }

  getBySlug(slug: string): Tournament | null {
    return localTournamentRepository.getBySlug(slug);
  }

  createTournament(tournamentData: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt' | 'registeredParticipants'>): Tournament {
    const id = `tour-${Date.now()}`;
    const slug = tournamentData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newTournament: Tournament = {
      ...tournamentData,
      id,
      slug,
      registeredParticipants: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localTournamentRepository.save(newTournament);
    return newTournament;
  }

  updateTournament(id: string, updates: Partial<Tournament>): Tournament | null {
    const tournament = this.getById(id);
    if (!tournament) return null;

    const updated: Tournament = {
      ...tournament,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localTournamentRepository.save(updated);
    return updated;
  }

  duplicateTournament(id: string): Tournament | null {
    const tournament = this.getById(id);
    if (!tournament) return null;

    const dupData: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt' | 'registeredParticipants'> = {
      title: `${tournament.title} (Copy)`,
      slug: `${tournament.slug}-copy`,
      banner: tournament.banner,
      description: tournament.description,
      game: tournament.game,
      mode: tournament.mode,
      map: tournament.map,
      perspective: tournament.perspective,
      level: tournament.level,
      entryFee: tournament.entryFee,
      prizePool: tournament.prizePool,
      prizePoolType: tournament.prizePoolType,
      platformFeePercentage: tournament.platformFeePercentage,
      perKillReward: tournament.perKillReward,
      maxParticipants: tournament.maxParticipants,
      teamSize: tournament.teamSize,
      substituteLimit: tournament.substituteLimit,
      registrationStart: new Date().toISOString(),
      registrationEnd: new Date(Date.now() + 86400000).toISOString(),
      matchStart: new Date(Date.now() + 172800000).toISOString(),
      roomReleaseTime: new Date(Date.now() + 171900000).toISOString(),
      status: 'Draft',
      visibility: tournament.visibility,
      organizer: tournament.organizer,
      rules: [...tournament.rules],
      scoringSystem: { ...tournament.scoringSystem },
      prizeDistribution: { ...tournament.prizeDistribution },
      tags: [...tournament.tags],
      featured: false,
    };

    return this.createTournament(dupData);
  }

  cancelTournament(id: string): boolean {
    const tournament = this.getById(id);
    if (!tournament) return false;

    // Change status
    this.updateTournament(id, { status: 'Cancelled' });
    return true;
  }
}

export const tournamentService = new TournamentService();
export default tournamentService;
