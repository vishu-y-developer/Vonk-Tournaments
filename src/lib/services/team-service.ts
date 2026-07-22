import {
  Team,
  TeamMember,
  Player,
  TeamInvitation,
  TeamJoinRequest,
  TeamActivity,
  TeamType,
  TeamRole,
  TeamReadinessStatus,
  TournamentMode,
  PlayerLevel,
  TeamStats
} from '@/types';
import { localTeamRepository } from '@/repositories/local/local-team-repository';
import { localInvitationRepository } from '@/repositories/local/local-invitation-repository';
import { localJoinRequestRepository } from '@/repositories/local/local-join-request-repository';

export class TeamService {
  getAll(): Team[] {
    return localTeamRepository.getAll();
  }

  getById(id: string): Team | null {
    return localTeamRepository.getById(id);
  }

  getByCode(code: string): Team | null {
    return localTeamRepository.getByCode(code);
  }

  getByPlayerId(playerId: string): Team | null {
    return localTeamRepository.getByPlayerId(playerId);
  }

  // --- TEAM CREATION ---
  createTeam(params: {
    name: string;
    shortName: string;
    type: TeamType;
    bio: string;
    preferredMode: TournamentMode;
    preferredMap: string;
    skillLevel: string;
    region: string;
    language: string;
    logoUrl?: string;
    bannerUrl?: string;
    colorTheme?: string;
    tag?: string;
    motto?: string;
    captain: Player;
  }): Team | null {
    // Check if player is already in a team
    const existing = this.getByPlayerId(params.captain.id);
    if (existing) {
      return null;
    }

    const code = this.generateTeamCode();
    const newTeam: Team = {
      id: `team-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: params.name,
      shortName: params.shortName,
      type: params.type,
      bio: params.bio,
      preferredMode: params.preferredMode,
      preferredMap: params.preferredMap,
      skillLevel: params.skillLevel,
      region: params.region,
      language: params.language,
      logoUrl: params.logoUrl || '',
      bannerUrl: params.bannerUrl || '',
      colorTheme: params.colorTheme || '#10b981',
      tag: params.tag || params.shortName.toUpperCase(),
      motto: params.motto || '',
      code,
      captainId: params.captain.id,
      members: [
        {
          playerId: params.captain.id,
          inGameName: params.captain.inGameName,
          characterId: params.captain.characterId,
          role: 'Captain',
          joinedAt: new Date().toISOString(),
        },
      ],
      stats: {
        matches: 0,
        wins: 0,
        kills: 0,
        podiums: 0,
        kdRatio: 0,
        avgPlacement: 0,
        prizeWon: 0,
        streak: 0,
      },
      privacySettings: {
        publicTeam: true,
        showStats: true,
        allowJoinRequests: true,
        inviteOnly: false,
        showHistory: true,
        showCharacterIds: true,
        showOnlineStatus: true,
      },
      readinessStatus: 'Incomplete',
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'MemberJoined',
          description: `${params.captain.inGameName} created the team as Captain.`,
          timestamp: new Date().toISOString(),
        },
      ],
      achievements: [
        {
          id: `ach-t-${Date.now()}`,
          title: 'First Squad Created',
          description: 'Successfully registered a squad on VONK.',
          unlockedDate: new Date().toISOString(),
          progress: 100,
          badge: '🎮',
        },
      ],
      tournamentHistory: [],
    };

    newTeam.readinessStatus = this.calculateReadiness(newTeam);
    localTeamRepository.save(newTeam);
    return newTeam;
  }

  // --- JOIN BY CODE DIRECTLY (IF REC-AUTO-APPROVAL) ---
  joinTeamByCode(code: string, player: Player): { success: boolean; error?: string; team?: Team } {
    const existing = this.getByPlayerId(player.id);
    if (existing) {
      return { success: false, error: 'You are already in a team. Leave your team first.' };
    }

    const team = this.getByCode(code);
    if (!team) {
      return { success: false, error: 'Invalid team code. No such team found.' };
    }

    if (team.readinessStatus === 'Locked') {
      return { success: false, error: 'Roster is currently locked by the captain.' };
    }

    const limit = this.getRosterMaxLimit(team.type);
    if (team.members.length >= limit) {
      return { success: false, error: 'Team roster is full for this team type.' };
    }

    const newMember: TeamMember = {
      playerId: player.id,
      inGameName: player.inGameName,
      characterId: player.characterId,
      role: 'Member',
      joinedAt: new Date().toISOString(),
    };

    team.members.push(newMember);
    team.activities.push({
      id: `act-${Date.now()}`,
      type: 'MemberJoined',
      description: `${player.inGameName} joined the team using invitation code.`,
      timestamp: new Date().toISOString(),
    });

    team.readinessStatus = this.calculateReadiness(team);
    localTeamRepository.save(team);

    return { success: true, team };
  }

  // --- LEAVE TEAM ---
  leaveTeam(playerId: string): { success: boolean; message: string } {
    const team = this.getByPlayerId(playerId);
    if (!team) {
      return { success: false, message: 'You are not in a team.' };
    }

    if (team.readinessStatus === 'Locked') {
      return { success: false, message: 'Roster is locked. You cannot leave at this time.' };
    }

    const memberIndex = team.members.findIndex((m) => m.playerId === playerId);
    if (memberIndex === -1) {
      return { success: false, message: 'Not found in team roster.' };
    }

    const leavingMember = team.members[memberIndex];
    const isCaptain = team.captainId === playerId;
    team.members.splice(memberIndex, 1);

    // If no members are left, delete the team
    if (team.members.length === 0) {
      const all = localTeamRepository.getAll().filter((t) => t.id !== team.id);
      localTeamRepository.saveAll(all);
      return { success: true, message: 'Left the team. The team has been disbanded.' };
    }

    if (isCaptain) {
      // Transfer captaincy to Co-Captain first, else first remaining member
      const coCap = team.members.find((m) => m.role === 'Co-Captain');
      const nextCap = coCap || team.members[0];
      nextCap.role = 'Captain';
      team.captainId = nextCap.playerId;
      team.activities.push({
        id: `act-${Date.now()}`,
        type: 'CaptaincyTransferred',
        description: `Captaincy transferred to ${nextCap.inGameName} after previous Captain left.`,
        timestamp: new Date().toISOString(),
      });
    }

    team.activities.push({
      id: `act-${Date.now()}`,
      type: 'MemberLeft',
      description: `${leavingMember.inGameName} left the team.`,
      timestamp: new Date().toISOString(),
    });

    team.readinessStatus = this.calculateReadiness(team);
    localTeamRepository.save(team);
    return { success: true, message: 'Successfully left the team.' };
  }

  // --- KICK MEMBER ---
  kickMember(captainId: string, playerIdToKick: string): { success: boolean; error?: string } {
    const team = this.getByPlayerId(captainId);
    if (!team) return { success: false, error: 'Team not found.' };

    const actor = team.members.find((m) => m.playerId === captainId);
    if (!actor || (actor.role !== 'Captain' && actor.role !== 'Co-Captain')) {
      return { success: false, error: 'Insufficient permissions. Captain or Co-Captain role required.' };
    }

    const target = team.members.find((m) => m.playerId === playerIdToKick);
    if (!target) return { success: false, error: 'Member not found in team.' };

    // Prevent kicking captain, co-captain kicking co-captain, or self kicking
    if (target.role === 'Captain') {
      return { success: false, error: 'Cannot remove the Captain.' };
    }
    if (actor.role === 'Co-Captain' && target.role === 'Co-Captain') {
      return { success: false, error: 'Co-Captains cannot remove other Co-Captains.' };
    }
    if (captainId === playerIdToKick) {
      return { success: false, error: 'You cannot kick yourself.' };
    }

    if (team.readinessStatus === 'Locked') {
      return { success: false, error: 'Roster is currently locked.' };
    }

    const index = team.members.findIndex((m) => m.playerId === playerIdToKick);
    team.members.splice(index, 1);
    team.activities.push({
      id: `act-${Date.now()}`,
      type: 'MemberLeft',
      description: `${target.inGameName} was removed from the team by ${actor.inGameName}.`,
      timestamp: new Date().toISOString(),
    });

    team.readinessStatus = this.calculateReadiness(team);
    localTeamRepository.save(team);

    return { success: true };
  }

  // --- TRANSFER CAPTAINCY ---
  transferCaptaincy(captainId: string, newCaptainId: string): { success: boolean; error?: string } {
    const team = this.getByPlayerId(captainId);
    if (!team || team.captainId !== captainId) {
      return { success: false, error: 'Only the Captain can transfer captaincy.' };
    }

    const currentCap = team.members.find((m) => m.playerId === captainId);
    const newCap = team.members.find((m) => m.playerId === newCaptainId);

    if (!newCap) {
      return { success: false, error: 'Target member not found in roster.' };
    }

    if (currentCap) currentCap.role = 'Member';
    newCap.role = 'Captain';
    team.captainId = newCaptainId;

    team.activities.push({
      id: `act-${Date.now()}`,
      type: 'CaptaincyTransferred',
      description: `Captaincy transferred from ${currentCap?.inGameName} to ${newCap.inGameName}.`,
      timestamp: new Date().toISOString(),
    });

    localTeamRepository.save(team);
    return { success: true };
  }

  // --- ASSIGN ROLE ---
  assignRole(captainId: string, targetPlayerId: string, role: TeamRole): { success: boolean; error?: string } {
    const team = this.getByPlayerId(captainId);
    if (!team) return { success: false, error: 'Team not found.' };

    const actor = team.members.find((m) => m.playerId === captainId);
    if (!actor || (actor.role !== 'Captain' && actor.role !== 'Co-Captain')) {
      return { success: false, error: 'Permission denied.' };
    }

    if (team.readinessStatus === 'Locked') {
      return { success: false, error: 'Roster is currently locked.' };
    }

    const target = team.members.find((m) => m.playerId === targetPlayerId);
    if (!target) return { success: false, error: 'Target player not in team.' };

    if (role === 'Captain' && actor.role !== 'Captain') {
      return { success: false, error: 'Only the Captain can transfer captaincy.' };
    }

    if (role === 'Captain') {
      return this.transferCaptaincy(captainId, targetPlayerId);
    }

    target.role = role;
    team.activities.push({
      id: `act-${Date.now()}`,
      type: 'ProfileUpdated',
      description: `${target.inGameName} role set to ${role} by ${actor.inGameName}.`,
      timestamp: new Date().toISOString(),
    });

    team.readinessStatus = this.calculateReadiness(team);
    localTeamRepository.save(team);
    return { success: true };
  }

  // --- REGENERATE TEAM CODE ---
  regenerateTeamCode(captainId: string): { success: boolean; error?: string; code?: string } {
    const team = this.getByPlayerId(captainId);
    if (!team || team.captainId !== captainId) {
      return { success: false, error: 'Only the Captain can regenerate the team code.' };
    }

    const newCode = this.generateTeamCode();
    team.code = newCode;
    team.activities.push({
      id: `act-${Date.now()}`,
      type: 'ProfileUpdated',
      description: `Team invitation code was regenerated.`,
      timestamp: new Date().toISOString(),
    });

    localTeamRepository.save(team);
    return { success: true, code: newCode };
  }

  // --- LOCK / UNLOCK ROSTER ---
  setRosterLock(captainId: string, locked: boolean): { success: boolean; error?: string } {
    const team = this.getByPlayerId(captainId);
    if (!team || team.captainId !== captainId) {
      return { success: false, error: 'Only the Captain can lock or unlock the roster.' };
    }

    team.readinessStatus = locked ? 'Locked' : this.calculateReadiness(team);
    team.activities.push({
      id: `act-${Date.now()}`,
      type: locked ? 'RosterLocked' : 'RosterUnlocked',
      description: `Roster was ${locked ? 'Locked' : 'Unlocked'} by Captain.`,
      timestamp: new Date().toISOString(),
    });

    localTeamRepository.save(team);
    return { success: true };
  }

  // --- DISBAND TEAM ---
  disbandTeam(captainId: string): { success: boolean; error?: string } {
    const team = this.getByPlayerId(captainId);
    if (!team || team.captainId !== captainId) {
      return { success: false, error: 'Only the Captain can disband the team.' };
    }

    const all = localTeamRepository.getAll().filter((t) => t.id !== team.id);
    localTeamRepository.saveAll(all);
    return { success: true };
  }

  // --- INVITATIONS SYSTEM ---
  sendInvitation(captainId: string, params: { playerId: string; playerName: string; role: TeamRole }): { success: boolean; error?: string; invitation?: TeamInvitation } {
    const team = this.getByPlayerId(captainId);
    if (!team) return { success: false, error: 'Team not found.' };

    const actor = team.members.find((m) => m.playerId === captainId);
    if (!actor || (actor.role !== 'Captain' && actor.role !== 'Co-Captain')) {
      return { success: false, error: 'Only Captain or Co-Captain can invite players.' };
    }

    const activeInvitations = localInvitationRepository.getByTeamId(team.id);
    const alreadyInvited = activeInvitations.some((inv) => inv.playerId === params.playerId && inv.status === 'Pending');
    if (alreadyInvited) {
      return { success: false, error: 'Player already has a pending invitation from this team.' };
    }

    const limit = this.getRosterMaxLimit(team.type);
    if (team.members.length >= limit) {
      return { success: false, error: ' Roster size limit reached.' };
    }

    const newInvitation: TeamInvitation = {
      id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      teamId: team.id,
      teamName: team.name,
      playerId: params.playerId,
      playerName: params.playerName,
      role: params.role,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    localInvitationRepository.save(newInvitation);
    return { success: true, invitation: newInvitation };
  }

  cancelInvitation(captainId: string, invitationId: string): { success: boolean; error?: string } {
    const invitation = localInvitationRepository.getById(invitationId);
    if (!invitation) return { success: false, error: 'Invitation not found.' };

    const team = this.getByPlayerId(captainId);
    if (!team || team.id !== invitation.teamId) {
      return { success: false, error: 'Not authorized.' };
    }

    const actor = team.members.find((m) => m.playerId === captainId);
    if (!actor || (actor.role !== 'Captain' && actor.role !== 'Co-Captain')) {
      return { success: false, error: 'Permission denied.' };
    }

    invitation.status = 'Cancelled';
    localInvitationRepository.save(invitation);
    return { success: true };
  }

  respondToInvitation(playerId: string, invitationId: string, accept: boolean): { success: boolean; error?: string; team?: Team } {
    const invitation = localInvitationRepository.getById(invitationId);
    if (!invitation || invitation.playerId !== playerId) {
      return { success: false, error: 'Invitation not found.' };
    }

    if (invitation.status !== 'Pending') {
      return { success: false, error: 'This invitation is no longer active.' };
    }

    if (!accept) {
      invitation.status = 'Rejected';
      localInvitationRepository.save(invitation);
      return { success: true };
    }

    // Accept - check if already in team
    const inTeam = this.getByPlayerId(playerId);
    if (inTeam) {
      return { success: false, error: 'You are already in a team. Leave your team first.' };
    }

    const team = this.getById(invitation.teamId);
    if (!team) {
      return { success: false, error: 'Inviting team no longer exists.' };
    }

    const limit = this.getRosterMaxLimit(team.type);
    if (team.members.length >= limit) {
      return { success: false, error: 'Team roster is full.' };
    }

    // Add player to roster
    const newMember: TeamMember = {
      playerId,
      inGameName: invitation.playerName,
      characterId: 'Character-ID-Pending', // default placeholder
      role: invitation.role,
      joinedAt: new Date().toISOString(),
    };

    team.members.push(newMember);
    team.activities.push({
      id: `act-${Date.now()}`,
      type: 'MemberJoined',
      description: `${invitation.playerName} accepted invitation and joined as ${invitation.role}.`,
      timestamp: new Date().toISOString(),
    });

    team.readinessStatus = this.calculateReadiness(team);
    localTeamRepository.save(team);

    invitation.status = 'Accepted';
    localInvitationRepository.save(invitation);

    // Cancel other pending invitations for this player
    const playerInvs = localInvitationRepository.getByPlayerId(playerId).filter((i) => i.id !== invitationId && i.status === 'Pending');
    playerInvs.forEach((i) => {
      i.status = 'Expired';
      localInvitationRepository.save(i);
    });

    return { success: true, team };
  }

  // --- JOIN REQUEST SYSTEM ---
  submitJoinRequest(player: Player, teamId: string, preferredRole: TeamRole): { success: boolean; error?: string; request?: TeamJoinRequest } {
    const existing = this.getByPlayerId(player.id);
    if (existing) {
      return { success: false, error: 'You are already in a team. Leave your team first.' };
    }

    const team = this.getById(teamId);
    if (!team) return { success: false, error: 'Team not found.' };

    const activeRequests = localJoinRequestRepository.getByTeamId(team.id);
    const alreadyRequested = activeRequests.some((req) => req.playerId === player.id && req.status === 'Pending');
    if (alreadyRequested) {
      return { success: false, error: 'You already have a pending join request for this team.' };
    }

    const newRequest: TeamJoinRequest = {
      id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      teamId,
      playerId: player.id,
      playerName: player.inGameName,
      playerLevel: player.level,
      preferredRole,
      statsPreview: {
        matchesPlayed: player.stats.matchesPlayed,
        kdRatio: player.stats.kdRatio,
        winRate: player.stats.winRate,
      },
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    localJoinRequestRepository.save(newRequest);
    return { success: true, request: newRequest };
  }

  respondToJoinRequest(captainId: string, requestId: string, approve: boolean): { success: boolean; error?: string } {
    const request = localJoinRequestRepository.getById(requestId);
    if (!request) return { success: false, error: 'Request not found.' };

    const team = this.getByPlayerId(captainId);
    if (!team || team.id !== request.teamId) {
      return { success: false, error: 'Not authorized.' };
    }

    const actor = team.members.find((m) => m.playerId === captainId);
    if (!actor || (actor.role !== 'Captain' && actor.role !== 'Co-Captain')) {
      return { success: false, error: 'Permission denied.' };
    }

    if (request.status !== 'Pending') {
      return { success: false, error: 'This request is no longer active.' };
    }

    if (!approve) {
      request.status = 'Rejected';
      localJoinRequestRepository.save(request);
      return { success: true };
    }

    // Check if team is full
    const limit = this.getRosterMaxLimit(team.type);
    if (team.members.length >= limit) {
      return { success: false, error: 'Team roster is full.' };
    }

    // Check if player joined another team already
    const playerInTeam = this.getByPlayerId(request.playerId);
    if (playerInTeam) {
      request.status = 'Cancelled';
      localJoinRequestRepository.save(request);
      return { success: false, error: 'Player already joined another team.' };
    }

    // Add to roster
    const newMember: TeamMember = {
      playerId: request.playerId,
      inGameName: request.playerName,
      characterId: 'Character-ID-Pending',
      role: request.preferredRole,
      joinedAt: new Date().toISOString(),
    };

    team.members.push(newMember);
    team.activities.push({
      id: `act-${Date.now()}`,
      type: 'MemberJoined',
      description: `${request.playerName} join request approved as ${request.preferredRole}.`,
      timestamp: new Date().toISOString(),
    });

    team.readinessStatus = this.calculateReadiness(team);
    localTeamRepository.save(team);

    request.status = 'Approved';
    localJoinRequestRepository.save(request);

    // Cancel other requests for this player
    const playerReqs = localJoinRequestRepository.getByPlayerId(request.playerId).filter((r) => r.id !== requestId && r.status === 'Pending');
    playerReqs.forEach((r) => {
      r.status = 'Cancelled';
      localJoinRequestRepository.save(r);
    });

    return { success: true };
  }

  // --- CALC READINESS UTILITY ---
  calculateReadiness(team: Team): TeamReadinessStatus {
    const size = team.members.length;
    const required = this.getRosterRequiredSize(team.type);

    if (size >= required) {
      return 'Tournament Ready';
    } else if (size === required - 1) {
      return 'Almost Ready';
    } else {
      return 'Incomplete';
    }
  }

  // --- HELPER CONFIG READERS ---
  getRosterRequiredSize(type: TeamType): number {
    switch (type) {
      case 'Duo':
        return 2;
      case 'Squad':
        return 4;
      case 'TDM 2v2':
        return 2;
      case 'TDM 4v4':
        return 4;
      case 'Clan':
        return 4;
      default:
        return 2;
    }
  }

  getRosterMaxLimit(type: TeamType): number {
    switch (type) {
      case 'Duo':
        return 2;
      case 'Squad':
        return 5; // 4 + 1 sub
      case 'TDM 2v2':
        return 2;
      case 'TDM 4v4':
        return 4;
      case 'Clan':
        return 15;
      default:
        return 6;
    }
  }

  private generateTeamCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'VONK-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Verify uniqueness
    const exists = this.getByCode(code);
    if (exists) {
      return this.generateTeamCode();
    }
    return code;
  }
}

export const teamService = new TeamService();
export default teamService;
