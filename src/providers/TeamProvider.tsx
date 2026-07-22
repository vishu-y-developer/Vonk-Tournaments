'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Team, TeamInvitation, TeamJoinRequest, TeamRole, TeamType, TournamentMode } from '@/types';
import { teamService } from '@/lib/services/team-service';
import { localInvitationRepository } from '@/repositories/local/local-invitation-repository';
import { localJoinRequestRepository } from '@/repositories/local/local-join-request-repository';
import { useAuth } from './AuthProvider';

interface TeamContextType {
  myTeam: Team | null;
  teams: Team[];
  invitations: TeamInvitation[];
  joinRequests: TeamJoinRequest[];
  loading: boolean;
  error: string | null;
  createTeam: (params: {
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
  }) => { success: boolean; error?: string; team?: Team };
  joinTeam: (code: string) => { success: boolean; error?: string; team?: Team };
  leaveTeam: () => { success: boolean; message: string };
  kickMember: (playerId: string) => { success: boolean; error?: string };
  transferCaptaincy: (newCaptainId: string) => { success: boolean; error?: string };
  assignRole: (targetPlayerId: string, role: TeamRole) => { success: boolean; error?: string };
  regenerateTeamCode: () => { success: boolean; error?: string; code?: string };
  setRosterLock: (locked: boolean) => { success: boolean; error?: string };
  disbandTeam: () => { success: boolean; error?: string };
  sendInvitation: (params: { playerId: string; playerName: string; role: TeamRole }) => { success: boolean; error?: string };
  cancelInvitation: (invitationId: string) => { success: boolean; error?: string };
  respondToInvitation: (invitationId: string, accept: boolean) => { success: boolean; error?: string };
  submitJoinRequest: (teamId: string, preferredRole: TeamRole) => { success: boolean; error?: string };
  respondToJoinRequest: (requestId: string, approve: boolean) => { success: boolean; error?: string };
  refreshTeams: () => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [joinRequests, setJoinRequests] = useState<TeamJoinRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoaded } = useAuth();

  const refreshTeams = useCallback(() => {
    try {
      setLoading(true);
      const allTeams = teamService.getAll();
      setTeams(allTeams);

      if (user) {
        const foundTeam = teamService.getByPlayerId(user.id);
        setMyTeam(foundTeam);

        // Fetch user invitations
        setInvitations(localInvitationRepository.getByPlayerId(user.id));

        // Fetch join requests for my team (if Captain/Co-Captain)
        if (foundTeam) {
          const actor = foundTeam.members.find((m) => m.playerId === user.id);
          if (actor && (actor.role === 'Captain' || actor.role === 'Co-Captain')) {
            setJoinRequests(localJoinRequestRepository.getByTeamId(foundTeam.id));
          } else {
            setJoinRequests([]);
          }
        } else {
          setJoinRequests([]);
        }
      } else {
        setMyTeam(null);
        setInvitations([]);
        setJoinRequests([]);
      }
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error occurred loading team data.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        refreshTeams();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, refreshTeams]);

  const createTeam = (params: {
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
  }) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const team = teamService.createTeam({ ...params, captain: user });
    if (!team) {
      return { success: false, error: 'Could not create team. Are you already in a team?' };
    }
    refreshTeams();
    return { success: true, team };
  };

  const joinTeam = (code: string) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = teamService.joinTeamByCode(code, user);
    if (res.success) {
      refreshTeams();
    }
    return res;
  };

  const leaveTeam = () => {
    if (!user) return { success: false, message: 'User profile not loaded.' };
    const res = teamService.leaveTeam(user.id);
    if (res.success) {
      refreshTeams();
    }
    return res;
  };

  const kickMember = (playerId: string) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = teamService.kickMember(user.id, playerId);
    if (res.success) {
      refreshTeams();
    }
    return res;
  };

  const transferCaptaincy = (newCaptainId: string) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = teamService.transferCaptaincy(user.id, newCaptainId);
    if (res.success) {
      refreshTeams();
    }
    return res;
  };

  const assignRole = (targetPlayerId: string, role: TeamRole) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = teamService.assignRole(user.id, targetPlayerId, role);
    if (res.success) {
      refreshTeams();
    }
    return res;
  };

  const regenerateTeamCode = () => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = teamService.regenerateTeamCode(user.id);
    if (res.success) {
      refreshTeams();
    }
    return res;
  };

  const setRosterLock = (locked: boolean) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = teamService.setRosterLock(user.id, locked);
    if (res.success) {
      refreshTeams();
    }
    return res;
  };

  const disbandTeam = () => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = teamService.disbandTeam(user.id);
    if (res.success) {
      refreshTeams();
    }
    return res;
  };

  const sendInvitation = (params: { playerId: string; playerName: string; role: TeamRole }) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = teamService.sendInvitation(user.id, params);
    if (res.success) {
      refreshTeams();
    }
    return res;
  };

  const cancelInvitation = (invitationId: string) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = teamService.cancelInvitation(user.id, invitationId);
    if (res.success) {
      refreshTeams();
    }
    return res;
  };

  const respondToInvitation = (invitationId: string, accept: boolean) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = teamService.respondToInvitation(user.id, invitationId, accept);
    if (res.success) {
      refreshTeams();
    }
    return res;
  };

  const submitJoinRequest = (teamId: string, preferredRole: TeamRole) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = teamService.submitJoinRequest(user, teamId, preferredRole);
    if (res.success) {
      refreshTeams();
    }
    return res;
  };

  const respondToJoinRequest = (requestId: string, approve: boolean) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = teamService.respondToJoinRequest(user.id, requestId, approve);
    if (res.success) {
      refreshTeams();
    }
    return res;
  };

  return (
    <TeamContext.Provider
      value={{
        myTeam,
        teams,
        invitations,
        joinRequests,
        loading,
        error,
        createTeam,
        joinTeam,
        leaveTeam,
        kickMember,
        transferCaptaincy,
        assignRole,
        regenerateTeamCode,
        setRosterLock,
        disbandTeam,
        sendInvitation,
        cancelInvitation,
        respondToInvitation,
        submitJoinRequest,
        respondToJoinRequest,
        refreshTeams,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeams = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamProvider');
  }
  return context;
};
