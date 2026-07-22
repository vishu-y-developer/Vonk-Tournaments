import { useAdmin } from '@/providers/AdminProvider';

export const useAdminDashboard = () => {
  const { analytics, auditLogs, reports, tournaments, players, teams, organizers } = useAdmin();

  return {
    analytics,
    recentAuditLogs: auditLogs.slice(0, 10),
    openReports: reports.filter((r) => r.status === 'OPEN' || r.status === 'REVIEWING'),
    activeTournaments: tournaments.filter((t) => t.status === 'LIVE' || t.status === 'REGISTRATION_OPEN'),
    counts: {
      players: players.length,
      teams: teams.length,
      organizers: organizers.length,
      tournaments: tournaments.length
    }
  };
};

export default useAdminDashboard;
