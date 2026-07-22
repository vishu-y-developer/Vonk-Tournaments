/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  MatchResult, 
  TournamentStanding, 
  ResultPenalty, 
  ResultBonus, 
  MVPRecord, 
  ResultDispute, 
  ResultRevision,
  ScoringConfiguration,
  Tournament,
  Player,
  Team,
  ResultStatus,
  QualificationStatus,
  TieBreakerRule,
  PenaltyType,
  PenaltyStatus,
  BonusType,
  MVPCategory
} from '@/types';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS, DEFAULT_SCORING } from '@/constants';
import { localResultRepository } from '@/repositories/local/local-result-repository';
import { localStandingRepository } from '@/repositories/local/local-standing-repository';
import { localPenaltyRepository } from '@/repositories/local/local-penalty-repository';
import { localMVPRepository } from '@/repositories/local/local-mvp-repository';
import { localDisputeRepository } from '@/repositories/local/local-dispute-repository';
import { localTournamentRepository } from '@/repositories/local/local-tournament-repository';
import { localRegistrationRepository } from '@/repositories/local/local-registration-repository';
import { localTeamRepository } from '@/repositories/local/local-team-repository';
import { localWalletRepository } from '@/repositories/local/local-wallet-repository';
import { notificationService } from './notification-service';

export class ResultService {
  
  // --- SCORING CALCULATIONS ---

  calculatePlacementPoints(placement: number, system: ScoringConfiguration | any): number {
    const rules = system.placementPoints || DEFAULT_SCORING.placementPoints;
    return rules[placement] !== undefined ? rules[placement] : 0;
  }

  calculateTotalMatchPoints(
    placement: number,
    kills: number,
    system: ScoringConfiguration | any,
    bonusPoints = 0,
    penaltyPoints = 0
  ): { placementPoints: number; killPoints: number; totalPoints: number } {
    const pointsPerKill = system.pointsPerKill || DEFAULT_SCORING.pointsPerKill;
    const placementPoints = this.calculatePlacementPoints(placement, system);
    const killPoints = kills * pointsPerKill;
    const totalPoints = placementPoints + killPoints + bonusPoints - penaltyPoints;

    return {
      placementPoints,
      killPoints,
      totalPoints: Math.max(0, totalPoints),
    };
  }

  // --- RESULT PROCESSING & LIFECYCLE ---

  validateResultInput(resultData: Partial<MatchResult>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!resultData.tournamentId) errors.push('Tournament ID is required.');
    if (!resultData.matchId) errors.push('Match ID is required.');
    if (!resultData.participantId) errors.push('Participant ID is required.');
    if (resultData.placement === undefined || resultData.placement < 1) errors.push('Valid placement is required.');
    if (resultData.kills === undefined || resultData.kills < 0) errors.push('Kills must be a non-negative number.');
    if (resultData.assists === undefined || resultData.assists < 0) errors.push('Assists must be a non-negative number.');
    if (resultData.damage === undefined || resultData.damage < 0) errors.push('Damage must be a non-negative number.');

    return {
      valid: errors.length === 0,
      errors
    };
  }

  publishResult(resultId: string): boolean {
    const results = localResultRepository.getAll();
    const index = results.findIndex((r: MatchResult) => r.id === resultId);
    if (index === -1) return false;

    results[index].status = 'PUBLISHED';
    results[index].publishedAt = new Date().toISOString();
    localResultRepository.saveAll(results);

    // Recalculate standings for the tournament
    this.recalculateStandings(results[index].tournamentId);

    // Send notifications to roster players
    if (results[index].registrationId) {
      const reg = localRegistrationRepository.getById(results[index].registrationId || '');
      if (reg) {
        reg.membersRegistered.forEach((member: any) => {
          notificationService.sendNotification(
            member.playerId,
            'RESULT_PUBLISHED',
            'Match Results Published!',
            `The match results for round "${results[index].roundId || 'Finals'}" of your tournament are now live. Check the leaderboard!`
          );
        });
      }
    }

    return true;
  }

  correctResult(resultId: string, updates: Partial<MatchResult>, reason: string, correctedBy: string): boolean {
    const results = localResultRepository.getAll();
    const index = results.findIndex((r: MatchResult) => r.id === resultId);
    if (index === -1) return false;

    const oldResult = results[index];
    const prevValues = {
      placement: oldResult.placement || 0,
      kills: oldResult.kills || 0,
      placementPoints: oldResult.placementPoints || 0,
      killPoints: oldResult.killPoints || 0,
      totalPoints: oldResult.totalPoints || 0
    };

    // Calculate new scoring values
    const tour = localTournamentRepository.getById(oldResult.tournamentId);
    const system = tour?.scoringSystem || DEFAULT_SCORING;
    const placement = updates.placement !== undefined ? updates.placement : oldResult.placement || 0;
    const kills = updates.kills !== undefined ? updates.kills : oldResult.kills || 0;
    const bonus = updates.bonusPoints !== undefined ? updates.bonusPoints : oldResult.bonusPoints || 0;
    const penalty = updates.penaltyPoints !== undefined ? updates.penaltyPoints : oldResult.penaltyPoints || 0;

    const calc = this.calculateTotalMatchPoints(placement, kills, system, bonus, penalty);

    const updatedResult: MatchResult = {
      ...oldResult,
      ...updates,
      placement,
      kills,
      placementPoints: calc.placementPoints,
      killPoints: calc.killPoints,
      totalPoints: calc.totalPoints,
      status: 'CORRECTED',
      correctedAt: new Date().toISOString()
    };

    results[index] = updatedResult;
    localResultRepository.saveAll(results);

    // Save revision record
    const revisions = browserStorage.getItem<ResultRevision[]>(STORAGE_KEYS.RESULT_REVISIONS, []);
    const revisionNumber = revisions.filter((r: ResultRevision) => r.resultId === resultId).length + 1;
    const newValues = {
      placement,
      kills,
      placementPoints: calc.placementPoints,
      killPoints: calc.killPoints,
      totalPoints: calc.totalPoints
    };

    const revRecord: ResultRevision = {
      id: `rev-${Date.now()}`,
      resultId,
      previousValues: prevValues,
      newValues,
      reason,
      correctedAt: new Date().toISOString(),
      correctedBy,
      revisionNumber
    };
    revisions.push(revRecord);
    browserStorage.setItem(STORAGE_KEYS.RESULT_REVISIONS, revisions);

    // Recalculate standings
    this.recalculateStandings(oldResult.tournamentId);
    return true;
  }

  disputeResult(resultId: string, playerId: string, reason: string, description: string): ResultDispute | null {
    const results = localResultRepository.getAll();
    const result = results.find((r: MatchResult) => r.id === resultId);
    if (!result) return null;

    // Mark result status as disputed
    const index = results.findIndex((r: MatchResult) => r.id === resultId);
    results[index].status = 'DISPUTED';
    localResultRepository.saveAll(results);

    const dispute: ResultDispute = {
      id: `disp-${Date.now()}`,
      resultId,
      tournamentId: result.tournamentId,
      matchId: result.matchId || '',
      registrationId: result.registrationId || '',
      submittedBy: playerId,
      reason,
      description,
      status: 'OPEN',
      submittedAt: new Date().toISOString(),
      isDemo: true
    };

    localDisputeRepository.save(dispute);
    return dispute;
  }

  finalizeResult(resultId: string): boolean {
    const results = localResultRepository.getAll();
    const index = results.findIndex((r: MatchResult) => r.id === resultId);
    if (index === -1) return false;

    results[index].status = 'FINAL';
    localResultRepository.saveAll(results);

    // Recalculate standings
    this.recalculateStandings(results[index].tournamentId);
    return true;
  }

  // --- STANDINGS RECALCULATION & TIE BREAKERS ---

  recalculateStandings(tournamentId: string): TournamentStanding[] {
    const results = localResultRepository.getAll().filter(
      (r: MatchResult) => r.tournamentId === tournamentId && 
             ['PUBLISHED', 'CORRECTED', 'DISPUTED', 'FINAL'].includes(r.status || '')
    );
    const tournament = localTournamentRepository.getById(tournamentId);
    if (!tournament) return [];

    const standingsMap = new Map<string, TournamentStanding>();

    // Step 1: Sum up match results per participant
    results.forEach((res: MatchResult) => {
      const pId = res.participantId || '';
      if (!pId) return;

      const existing = standingsMap.get(pId);
      const wins = res.placement === 1 ? 1 : 0;
      const podiumFinishes = (res.placement && res.placement <= 3) ? 1 : 0;

      if (existing) {
        existing.matchesPlayed += 1;
        existing.totalKills += res.kills || 0;
        existing.totalPlacementPoints += res.placementPoints || 0;
        existing.totalKillPoints += res.killPoints || 0;
        existing.totalBonusPoints += res.bonusPoints || 0;
        existing.totalPenaltyPoints += res.penaltyPoints || 0;
        existing.totalPoints += res.totalPoints || 0;
        if (res.placement && res.placement < existing.bestPlacement) {
          existing.bestPlacement = res.placement;
        }
        existing.wins += wins;
        existing.podiumFinishes += podiumFinishes;
        existing.lastMatchPlacement = res.placement;
      } else {
        standingsMap.set(pId, {
          tournamentId,
          participantId: pId,
          teamId: res.teamId,
          rank: 0,
          rankChange: 0,
          matchesPlayed: 1,
          totalKills: res.kills || 0,
          totalPlacementPoints: res.placementPoints || 0,
          totalKillPoints: res.killPoints || 0,
          totalBonusPoints: res.bonusPoints || 0,
          totalPenaltyPoints: res.penaltyPoints || 0,
          totalPoints: res.totalPoints || 0,
          averagePlacement: res.placement || 0,
          bestPlacement: res.placement || 99,
          wins,
          podiumFinishes,
          lastMatchPlacement: res.placement,
          qualificationStatus: 'PENDING',
          updatedAt: new Date().toISOString(),
          isDemo: true
        });
      }
    });

    const standings = Array.from(standingsMap.values());

    // Calculate average placements
    standings.forEach((s: TournamentStanding) => {
      // Find all placements
      const pResults = results.filter((r: MatchResult) => r.participantId === s.participantId);
      const placementsSum = pResults.reduce((acc: number, r: MatchResult) => acc + (r.placement || 0), 0);
      s.averagePlacement = parseFloat((placementsSum / s.matchesPlayed).toFixed(2));
    });

    // Step 2: Sort standings with deterministic tie-breaker rules
    // Tie breaker hierarchy:
    // 1. Total points (descending)
    // 2. Total placement points (descending)
    // 3. Total kills (descending)
    // 4. Best single-match placement (ascending, i.e., 1st is better than 2nd)
    // 5. Last match placement (ascending)
    // 6. Alphabetical fallback
    standings.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.totalPlacementPoints !== a.totalPlacementPoints) {
        return b.totalPlacementPoints - a.totalPlacementPoints;
      }
      if (b.totalKills !== a.totalKills) {
        return b.totalKills - a.totalKills;
      }
      if (a.bestPlacement !== b.bestPlacement) {
        return a.bestPlacement - b.bestPlacement; // lower placement is better (1st > 2nd)
      }
      if (a.lastMatchPlacement !== b.lastMatchPlacement && a.lastMatchPlacement && b.lastMatchPlacement) {
        return a.lastMatchPlacement - b.lastMatchPlacement;
      }
      return a.participantId.localeCompare(b.participantId); // alphabetical fallback
    });

    // Step 3: Apply ranks and calculate rank changes compared to previous ranks
    const previousStandings = localStandingRepository.getByTournamentId(tournamentId);
    
    standings.forEach((s: TournamentStanding, idx: number) => {
      s.rank = idx + 1;
      const prev = previousStandings.find((ps: TournamentStanding) => ps.participantId === s.participantId);
      if (prev) {
        s.previousRank = prev.rank;
        s.rankChange = prev.rank - s.rank; // positive means climbed, negative dropped
      } else {
        s.previousRank = s.rank;
        s.rankChange = 0;
      }

      // Assign qualification statuses based on tournament settings
      // Example default cutoff: Top 3 are Winners/Podium, Top 8 Advancing, rest pending or eliminated
      if (s.rank === 1) s.qualificationStatus = 'WINNER';
      else if (s.rank === 2) s.qualificationStatus = 'RUNNER_UP';
      else if (s.rank === 3) s.qualificationStatus = 'THIRD_PLACE';
      else if (s.rank <= 8) s.qualificationStatus = 'ADVANCING';
      else if (s.rank <= 12) s.qualificationStatus = 'ON_BUBBLE';
      else s.qualificationStatus = 'ELIMINATED';
    });

    localStandingRepository.saveAll(standings);
    return standings;
  }

  // --- STATS INTEGRATIONS & TEAM CONTRIBUTION ---

  calculateTeamContribution(resultId: string): any[] {
    const results = localResultRepository.getAll();
    const res = results.find((r: MatchResult) => r.id === resultId);
    if (!res || !res.teamId) return [];

    const team = localTeamRepository.getAll().find((t: Team) => t.id === res.teamId);
    if (!team) return [];

    // Distribute kills and contribution metric mock-style per roster member
    const membersCount = team.members.length;
    const totalKills = res.kills || 0;
    
    return team.members.map((member: any, idx: number) => {
      // Mock share distribution
      const share = idx === 0 ? 0.4 : idx === 1 ? 0.3 : idx === 2 ? 0.2 : 0.1;
      const memberKills = Math.round(totalKills * share);
      const damage = Math.round((res.damage || 0) * share);
      const survivalTime = Math.round((res.survivalTime || 0) * (0.8 + Math.random() * 0.4));
      
      return {
        playerId: member.playerId,
        inGameName: member.inGameName,
        kills: memberKills,
        assists: idx === 1 ? 2 : 1,
        damage,
        survivalTime,
        revives: idx === 2 ? 2 : 0,
        contributionPercentage: Math.round(share * 100)
      };
    });
  }

  // --- PENALTIES & BONUSES MANIPULATIONS ---

  issuePenalty(resultId: string, type: PenaltyType, points: number, reason: string, issuedBy: string): ResultPenalty {
    const penalty: ResultPenalty = {
      id: `pen-${Date.now()}`,
      resultId,
      type,
      points,
      reason,
      issuedAt: new Date().toISOString(),
      issuedBy,
      appealable: true,
      status: 'APPLIED',
      isDemo: true
    };

    localPenaltyRepository.save(penalty);

    // Apply directly to the match result record
    const results = localResultRepository.getAll();
    const index = results.findIndex((r) => r.id === resultId);
    if (index > -1) {
      results[index].penaltyPoints = (results[index].penaltyPoints || 0) + points;
      // Recalculate total points
      const system = DEFAULT_SCORING;
      const calc = this.calculateTotalMatchPoints(
        results[index].placement || 0,
        results[index].kills || 0,
        system,
        results[index].bonusPoints || 0,
        results[index].penaltyPoints || 0
      );
      results[index].totalPoints = calc.totalPoints;
      localResultRepository.saveAll(results);
      this.recalculateStandings(results[index].tournamentId);
    }

    return penalty;
  }

  reversePenalty(penaltyId: string): boolean {
    const penalties = localPenaltyRepository.getAll();
    const index = penalties.findIndex((p) => p.id === penaltyId);
    if (index === -1) return false;

    penalties[index].status = 'REVERSED';
    localPenaltyRepository.saveAll(penalties);

    // Deduct from the match result record
    const results = localResultRepository.getAll();
    const resIndex = results.findIndex((r) => r.id === penalties[index].resultId);
    if (resIndex > -1) {
      results[resIndex].penaltyPoints = Math.max(0, (results[resIndex].penaltyPoints || 0) - penalties[index].points);
      const system = DEFAULT_SCORING;
      const calc = this.calculateTotalMatchPoints(
        results[resIndex].placement || 0,
        results[resIndex].kills || 0,
        system,
        results[resIndex].bonusPoints || 0,
        results[resIndex].penaltyPoints || 0
      );
      results[resIndex].totalPoints = calc.totalPoints;
      localResultRepository.saveAll(results);
      this.recalculateStandings(results[resIndex].tournamentId);
    }

    return true;
  }

  // --- SEEDING & DEV UTILITIES ---

  seedResultData(): void {
    const results: MatchResult[] = [
      // Tournament 5 (Completed Squad) Round 1
      {
        id: 'res-tour-5-r1-soul',
        matchId: 'match-tour-5-r1',
        tournamentId: 'tour-5',
        roundId: 'Round 1',
        registrationId: 'reg-soul-tour-5',
        participantId: 'team-soul',
        teamId: 'team-soul',
        participantName: 'Team SouL',
        teamName: 'Team SouL',
        placement: 1,
        kills: 18,
        assists: 10,
        damage: 3400,
        survivalTime: 1200,
        placementPoints: 15,
        killPoints: 18,
        assistPoints: 0,
        bonusPoints: 0,
        penaltyPoints: 0,
        totalPoints: 33,
        status: 'FINAL',
        submittedAt: new Date(Date.now() - 172800000).toISOString(),
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        isDemo: true
      },
      {
        id: 'res-tour-5-r1-godl',
        matchId: 'match-tour-5-r1',
        tournamentId: 'tour-5',
        roundId: 'Round 1',
        registrationId: 'reg-godl-tour-5',
        participantId: 'team-godl',
        teamId: 'team-godl',
        participantName: 'GodLike Esports',
        teamName: 'GodLike Esports',
        placement: 2,
        kills: 15,
        assists: 8,
        damage: 2900,
        survivalTime: 1150,
        placementPoints: 12,
        killPoints: 15,
        assistPoints: 0,
        bonusPoints: 0,
        penaltyPoints: 0,
        totalPoints: 27,
        status: 'FINAL',
        submittedAt: new Date(Date.now() - 172800000).toISOString(),
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        isDemo: true
      },
      {
        id: 'res-tour-5-r1-user',
        matchId: 'match-tour-5-r1',
        tournamentId: 'tour-5',
        roundId: 'Round 1',
        registrationId: 'reg-user-tour-5',
        participantId: 'team-user',
        teamId: 'team-user',
        participantName: 'Apex Hunters',
        teamName: 'Apex Hunters',
        placement: 3,
        kills: 8,
        assists: 4,
        damage: 1800,
        survivalTime: 1000,
        placementPoints: 10,
        killPoints: 8,
        assistPoints: 0,
        bonusPoints: 0,
        penaltyPoints: 0,
        totalPoints: 18,
        status: 'FINAL',
        submittedAt: new Date(Date.now() - 172800000).toISOString(),
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        isDemo: true
      },
      // Tournament 5 Round 2 (User team disputes/gets corrected)
      {
        id: 'res-tour-5-r2-soul',
        matchId: 'match-tour-5-r2',
        tournamentId: 'tour-5',
        roundId: 'Round 2',
        registrationId: 'reg-soul-tour-5',
        participantId: 'team-soul',
        teamId: 'team-soul',
        participantName: 'Team SouL',
        teamName: 'Team SouL',
        placement: 3,
        kills: 6,
        assists: 3,
        damage: 1400,
        survivalTime: 950,
        placementPoints: 10,
        killPoints: 6,
        assistPoints: 0,
        bonusPoints: 0,
        penaltyPoints: 0,
        totalPoints: 16,
        status: 'PUBLISHED',
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        isDemo: true
      },
      {
        id: 'res-tour-5-r2-godl',
        matchId: 'match-tour-5-r2',
        tournamentId: 'tour-5',
        roundId: 'Round 2',
        registrationId: 'reg-godl-tour-5',
        participantId: 'team-godl',
        teamId: 'team-godl',
        participantName: 'GodLike Esports',
        teamName: 'GodLike Esports',
        placement: 1,
        kills: 12,
        assists: 6,
        damage: 2600,
        survivalTime: 1220,
        placementPoints: 15,
        killPoints: 12,
        assistPoints: 0,
        bonusPoints: 0,
        penaltyPoints: 0,
        totalPoints: 27,
        status: 'PUBLISHED',
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        isDemo: true
      },
      {
        id: 'res-tour-5-r2-user',
        matchId: 'match-tour-5-r2',
        tournamentId: 'tour-5',
        roundId: 'Round 2',
        registrationId: 'reg-user-tour-5',
        participantId: 'team-user',
        teamId: 'team-user',
        participantName: 'Apex Hunters',
        teamName: 'Apex Hunters',
        placement: 2,
        kills: 10,
        assists: 5,
        damage: 2100,
        survivalTime: 1100,
        placementPoints: 12,
        killPoints: 10,
        assistPoints: 0,
        bonusPoints: 0,
        penaltyPoints: 1, // late check-in penalty
        totalPoints: 21,
        status: 'CORRECTED',
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        correctedAt: new Date(Date.now() - 7200000).toISOString(),
        isDemo: true
      }
    ];

    localResultRepository.saveAll(results);

    // Seed Penalties
    const penalties: ResultPenalty[] = [
      {
        id: 'pen-1',
        resultId: 'res-tour-5-r2-user',
        type: 'LATE_CHECK_IN',
        points: 1,
        reason: 'Late roster confirmation checkout',
        issuedAt: new Date(Date.now() - 80000000).toISOString(),
        issuedBy: 'System Referee',
        appealable: true,
        status: 'APPLIED',
        isDemo: true
      }
    ];
    localPenaltyRepository.saveAll(penalties);

    // Seed MVPs
    const mvps: MVPRecord[] = [
      {
        id: 'mvp-1',
        tournamentId: 'tour-5',
        matchId: 'match-tour-5-r1',
        participantId: 'user-player-1', // Mortal represented by user player
        category: 'Match MVP',
        score: 46,
        reason: 'Secured 18 kills and drove Team SouL to winner circle.',
        statsSnapshot: { kills: 18, assists: 10, damage: 3400 },
        awardedAt: new Date(Date.now() - 172800000).toISOString(),
        isDemo: true
      }
    ];
    localMVPRepository.saveAll(mvps);

    // Seed disputes
    const disputes: ResultDispute[] = [
      {
        id: 'disp-tour-5',
        resultId: 'res-tour-5-r2-user',
        tournamentId: 'tour-5',
        matchId: 'match-tour-5-r2',
        registrationId: 'reg-user-tour-5',
        submittedBy: 'user-player-1',
        reason: 'Score Incorrect',
        description: 'Our squad placement points were not aggregated with the wins bonus rule configuration.',
        status: 'RESOLVED',
        submittedAt: new Date(Date.now() - 80000000).toISOString(),
        resolvedAt: new Date(Date.now() - 7200000).toISOString(),
        resolution: 'Appeal reviewed. Late check-in penalty adjusted. Total points recalculated.',
        isDemo: true
      }
    ];
    localDisputeRepository.saveAll(disputes);

    // Recalculate standings for tournament 5
    this.recalculateStandings('tour-5');
  }

  resetResultData(): void {
    browserStorage.setItem(STORAGE_KEYS.RESULTS, []);
    browserStorage.setItem(STORAGE_KEYS.TOURNAMENT_STANDINGS, []);
    browserStorage.setItem(STORAGE_KEYS.RESULT_PENALTIES, []);
    browserStorage.setItem(STORAGE_KEYS.RESULT_BONUSES, []);
    browserStorage.setItem(STORAGE_KEYS.MVP_RECORDS, []);
    browserStorage.setItem(STORAGE_KEYS.RESULT_DISPUTES, []);
    browserStorage.setItem(STORAGE_KEYS.RESULT_REVISIONS, []);
  }
}

export const resultService = new ResultService();
export default resultService;
