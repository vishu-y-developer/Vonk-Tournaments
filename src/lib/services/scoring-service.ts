import { ScoringSystem } from '@/types';
import { DEFAULT_SCORING } from '@/constants';

export class ScoringService {
  getPlacementPoints(placement: number, system: ScoringSystem): number {
    const pointsMap = system.placementPoints || DEFAULT_SCORING.placementPoints;
    return pointsMap[placement] !== undefined ? pointsMap[placement] : 0;
  }

  calculateTotalPoints(
    placement: number,
    kills: number,
    system: ScoringSystem,
    bonusPoints = 0,
    penaltyPoints = 0
  ): {
    placementPoints: number;
    killPoints: number;
    totalPoints: number;
  } {
    const pointsPerKill = system.pointsPerKill || DEFAULT_SCORING.pointsPerKill;
    const placementPoints = this.getPlacementPoints(placement, system);
    const killPoints = kills * pointsPerKill;
    const totalPoints = placementPoints + killPoints + bonusPoints - penaltyPoints;

    return {
      placementPoints,
      killPoints,
      totalPoints: Math.max(0, totalPoints), // Ensure points are non-negative
    };
  }
}

export const scoringService = new ScoringService();
export default scoringService;
