import { Tournament } from '@/types';

export class PrizeService {
  calculateDynamicPrizePool(tournament: Tournament): {
    totalCollection: number;
    platformFee: number;
    prizePool: number;
  } {
    const totalCollection = tournament.entryFee * tournament.registeredParticipants;
    const platformFee = (totalCollection * tournament.platformFeePercentage) / 100;
    const prizePool = Math.max(0, totalCollection - platformFee);

    return {
      totalCollection,
      platformFee,
      prizePool,
    };
  }

  getEffectivePrizePool(tournament: Tournament): number {
    if (tournament.prizePoolType === 'FIXED') {
      return tournament.prizePool;
    }
    return this.calculateDynamicPrizePool(tournament).prizePool;
  }

  calculatePayoutDistribution(
    tournament: Tournament
  ): { place: number; amount: number; percentage: number }[] {
    const totalPrize = this.getEffectivePrizePool(tournament);
    const placePercentages = tournament.prizeDistribution.placePercentages;

    return Object.entries(placePercentages).map(([placeStr, percentage]) => {
      const place = parseInt(placeStr, 10);
      const amount = (totalPrize * percentage) / 100;
      return {
        place,
        amount,
        percentage,
      };
    });
  }
}

export const prizeService = new PrizeService();
export default prizeService;
