import { useState, useMemo } from 'react';
import { TournamentStanding } from '@/types';

export function useLeaderboardFilters(initialStandings: TournamentStanding[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [minKills, setMinKills] = useState<number | ''>('');
  const [qualificationFilter, setQualificationFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('RANK');

  const filteredStandings = useMemo(() => {
    let list = [...initialStandings];

    // Search query mapping (playerId, teamId, participantName, etc.)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) => 
          s.participantId.toLowerCase().includes(q) || 
          (s.teamId && s.teamId.toLowerCase().includes(q))
      );
    }

    // Min Kills filter
    if (minKills !== '') {
      list = list.filter((s) => s.totalKills >= minKills);
    }

    // Qualification Status filter
    if (qualificationFilter !== 'ALL') {
      list = list.filter((s) => s.qualificationStatus === qualificationFilter);
    }

    // Sorting overrides
    list.sort((a, b) => {
      if (sortBy === 'RANK') return a.rank - b.rank;
      if (sortBy === 'KILLS') return b.totalKills - a.totalKills;
      if (sortBy === 'PLACEMENT_POINTS') return b.totalPlacementPoints - a.totalPlacementPoints;
      if (sortBy === 'TOTAL_POINTS') return b.totalPoints - a.totalPoints;
      return 0;
    });

    return list;
  }, [initialStandings, searchQuery, minKills, qualificationFilter, sortBy]);

  return {
    searchQuery,
    setSearchQuery,
    minKills,
    setMinKills,
    qualificationFilter,
    setQualificationFilter,
    sortBy,
    setSortBy,
    standings: filteredStandings
  };
}
