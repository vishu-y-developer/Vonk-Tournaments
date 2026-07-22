import { TeamInvitation } from '@/types';

export interface InvitationRepository {
  getAll(): TeamInvitation[];
  getById(id: string): TeamInvitation | null;
  getByTeamId(teamId: string): TeamInvitation[];
  getByPlayerId(playerId: string): TeamInvitation[];
  save(invitation: TeamInvitation): void;
  saveAll(invitations: TeamInvitation[]): void;
}
