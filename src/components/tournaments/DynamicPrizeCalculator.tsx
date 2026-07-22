'use client';

import React, { useState } from 'react';
import { Tournament } from '@/types';
import { Coins, Award } from 'lucide-react';

interface DynamicPrizeCalculatorProps {
  tournament: Tournament;
}

export const DynamicPrizeCalculator: React.FC<DynamicPrizeCalculatorProps> = ({ tournament }) => {
  const [sliderParticipants, setSliderParticipants] = useState(
    Math.max(1, tournament.registeredParticipants)
  );

  const entryFee = tournament.entryFee;
  const feePercent = tournament.platformFeePercentage;

  const calculatePool = (participants: number) => {
    const totalCollection = entryFee * participants;
    const platformFee = (totalCollection * feePercent) / 100;
    const prizePool = Math.max(0, totalCollection - platformFee);
    return {
      totalCollection,
      platformFee,
      prizePool,
    };
  };

  const currentPool = calculatePool(sliderParticipants);
  const placePercentages = tournament.prizeDistribution.placePercentages;

  return (
    <div className="w-full rounded-2xl border border-card-border bg-card-bg/60 p-5 md:p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4 border-b border-card-border pb-3">
        <Coins className="h-5 w-5 text-primary" />
        <h3 className="text-sm md:text-base font-extrabold uppercase tracking-wide">
          Dynamic Prize Pool Calculator
        </h3>
      </div>

      <p className="text-xs text-muted leading-relaxed mb-6">
        *This tournament features a **Dynamic Prize Pool**. The total prizes scale up with every registered team/player, minus a small platform management fee. Adjust the slider below to simulate the pool based on active registrations!
      </p>

      {/* Simulator Slider */}
      <div className="flex flex-col gap-2.5 mb-6">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-muted">Simulated Registrations:</span>
          <span className="text-primary font-mono">{sliderParticipants} / {tournament.maxParticipants}</span>
        </div>
        <input
          type="range"
          min="1"
          max={tournament.maxParticipants}
          value={sliderParticipants}
          onChange={(e) => setSliderParticipants(parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-[#171720] rounded-full appearance-none cursor-pointer accent-primary border border-card-border"
        />
      </div>

      {/* Calculation Formula Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6 text-center">
        <div className="p-3.5 rounded-xl border border-card-border bg-[#0a0a0f]">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Total Collected</p>
          <p className="text-sm font-mono text-foreground font-bold">
            ₹{entryFee} × {sliderParticipants}
          </p>
          <p className="text-base font-black text-foreground mt-1">
            = ₹{currentPool.totalCollection.toLocaleString()}
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-card-border bg-[#0a0a0f]">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Platform Fee ({feePercent}%)</p>
          <p className="text-sm font-mono text-foreground font-bold">
            ₹{currentPool.totalCollection} × {feePercent}%
          </p>
          <p className="text-base font-black text-danger mt-1">
            = -₹{currentPool.platformFee.toLocaleString()}
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-card-border bg-primary/5 glow-primary">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Simulated Prize Pool</p>
          <p className="text-xs font-semibold text-muted">Net Prize Payout</p>
          <p className="text-lg font-black text-primary mt-1">
            = ₹{currentPool.prizePool.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Distributions Splits */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-extrabold uppercase text-muted tracking-wider mb-1.5 flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-secondary" />
          Prize Distribution Share
        </span>
        <div className="flex flex-col gap-2 bg-[#09090e] p-3 rounded-xl border border-card-border">
          {Object.entries(placePercentages).map(([place, pct]) => {
            const shareAmount = (currentPool.prizePool * pct) / 100;
            return (
              <div key={place} className="flex justify-between items-center text-xs border-b border-card-border/40 last:border-0 pb-2 last:pb-0">
                <span className="font-semibold text-foreground/80">
                  {place === '1' ? '🥇 1st Place' : place === '2' ? '🥈 2nd Place' : place === '3' ? '🥉 3rd Place' : `${place}th Place`}
                  <span className="text-[10px] text-muted font-bold ml-1">({pct}%)</span>
                </span>
                <span className="font-mono font-bold text-gradient-prize">
                  ₹{Math.round(shareAmount).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DynamicPrizeCalculator;
