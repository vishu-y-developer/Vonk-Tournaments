import { TeamInvitation } from '@/types';
import { InvitationRepository } from '../interfaces/invitation-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalInvitationRepository implements InvitationRepository {
  getAll(): TeamInvitation[] {
    return browserStorage.getItem<TeamInvitation[]>(STORAGE_KEYS.TEAM_INVITATIONS, []);
  }

  getById(id: string): TeamInvitation | null {
    const list = this.getAll();
    return list.find((inv) => inv.id === id) || null;
  }

  getByTeamId(teamId: string): TeamInvitation[] {
    const list = this.getAll();
    return list.filter((inv) => inv.teamId === teamId);
  }

  getByPlayerId(playerId: string): TeamInvitation[] {
    const list = this.getAll();
    return list.filter((inv) => inv.playerId === playerId);
  }

  save(invitation: TeamInvitation): void {
    const list = this.getAll();
    const index = list.findIndex((inv) => inv.id === invitation.id);
    if (index > -1) {
      list[index] = invitation;
    } else {
      list.push(invitation);
    }
    browserStorage.setItem(STORAGE_KEYS.TEAM_INVITATIONS, list);
  }

  saveAll(invitations: TeamInvitation[]): void {
    browserStorage.setItem(STORAGE_KEYS.TEAM_INVITATIONS, invitations);
  }
}

export const localInvitationRepository = new LocalInvitationRepository();
export default localInvitationRepository;
