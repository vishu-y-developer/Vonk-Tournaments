'use client';

import React from 'react';
import { TournamentLevel, PlayerLevel } from '@/types';
import { Shield, Target, Flame, Trophy, Crown, Award, Star, Zap } from 'lucide-react';

interface LevelBadgeProps {
  level: TournamentLevel | PlayerLevel;
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, className = '' }) => {
  const getLevelConfig = (lvl: TournamentLevel | PlayerLevel) => {
    switch (lvl) {
      // Tournament Levels
      case 'Intermediate':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          icon: Target,
        };
      case 'Advanced':
        return {
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
          icon: Flame,
        };
      case 'Pro':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: Trophy,
        };
      case 'Invitational':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          icon: Crown,
        };
      case 'Championship':
        return {
          bg: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
          icon: Award,
        };

      // Player Levels / Ranks
      case 'Beginner':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: Shield,
        };
      case 'Bronze':
        return {
          bg: 'bg-amber-700/15 border-amber-700/30 text-amber-500',
          icon: Shield,
        };
      case 'Silver':
        return {
          bg: 'bg-slate-400/15 border-slate-400/30 text-slate-300',
          icon: Shield,
        };
      case 'Gold':
        return {
          bg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
          icon: Star,
        };
      case 'Platinum':
        return {
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
          icon: Star,
        };
      case 'Diamond':
        return {
          bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
          icon: Trophy,
        };
      case 'Crown':
        return {
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
          icon: Crown,
        };
      case 'Ace':
        return {
          bg: 'bg-red-500/10 border-red-500/30 text-red-400',
          icon: Award,
        };
      case 'Conqueror':
        return {
          bg: 'bg-yellow-500/20 border-yellow-500/50 text-gradient-prize font-black animate-pulse',
          icon: Zap,
        };

      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          icon: Shield,
        };
    }
  };

  const config = getLevelConfig(level);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${config.bg} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {level}
    </span>
  );
};

export default LevelBadge;
