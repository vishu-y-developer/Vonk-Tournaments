/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  Tournament, 
  TournamentStatus, 
  Registration, 
  TournamentSlot, 
  Match, 
  MatchResult,
  ResultDispute, 
  PrizeDistributionRecord, 
  OrganizerProfile, 
  OrganizerSettings, 
  OrganizerActivity,
  OrganizerActivityType,
  RegistrationRejectionReason,
  RegistrationApprovalStatus,
  OrganizerAnnouncement,
  PrizeRecipient,
  PrizeCategory,
  WalletTransaction,
  TournamentChangeRestriction,
  OrganizerAnalytics
} from '@/types';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';
import { localOrganizerRepository } from '@/repositories/local/local-organizer-repository';
import { localOrganizerTournamentRepository } from '@/repositories/local/local-organizer-tournament-repository';
import { localOrganizerActivityRepository } from '@/repositories/local/local-organizer-activity-repository';
import { localOrganizerSettingsRepository } from '@/repositories/local/local-organizer-settings-repository';
import { localPrizeDistributionRepository } from '@/repositories/local/local-prize-distribution-repository';
import { localRegistrationRepository } from '@/repositories/local/local-registration-repository';
import { localTournamentSlotRepository } from '@/repositories/local/local-tournament-slot-repository';
import { localResultRepository } from '@/repositories/local/local-result-repository';
import { localDisputeRepository } from '@/repositories/local/local-dispute-repository';
import { localWalletRepository } from '@/repositories/local/local-wallet-repository';
import { localTransactionRepository } from '@/repositories/local/local-transaction-repository';
import { resultService } from './result-service';
import { notificationService } from './notification-service';

export class OrganizerService {
  // --- ACCESS & PROFILE ---

  getProfile(): OrganizerProfile | null {
    return localOrganizerRepository.get();
  }

  createProfile(profile: OrganizerProfile): void {
    localOrganizerRepository.save(profile);
    this.addActivity(
      profile.id,
      'TOURNAMENT',
      profile.id,
      'TOURNAMENT_CREATED',
      'Organizer Profile Created',
      `Welcome to VONK Tournaments, ${profile.displayName}!`
    );
  }

  validateAccess(role: string): boolean {
    return role === 'ORGANIZER';
  }

  // --- TOURNAMENT LIFECYCLE ---

  createTournament(organizerId: string, data: Partial<Tournament>): Tournament {
    const defaultScoring = { pointsPerKill: 1, placementPoints: { 1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1, 10: 1 } };
    const defaultPrizes = { placePercentages: { 1: 50, 2: 30, 3: 20 }, perKillReward: 0, mvpReward: 0 };
    
    const tournament: Tournament = {
      id: data.id || `tour-${Date.now()}`,
      title: data.title || 'New Tournament',
      slug: data.slug || `new-tournament-${Date.now()}`,
      banner: data.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop',
      description: data.description || 'Simulated Esports tournament description.',
      game: data.game || 'BGMI',
      mode: data.mode || 'Squad',
      map: data.map || 'Erangel',
      perspective: data.perspective || 'TPP',
      level: data.level || 'Intermediate',
      entryFee: data.entryFee || 0,
      prizePool: data.prizePool || 0,
      prizePoolType: data.prizePoolType || 'FIXED',
      platformFeePercentage: data.platformFeePercentage || 10,
      perKillReward: data.perKillReward || 0,
      maxParticipants: data.maxParticipants || 16,
      registeredParticipants: 0,
      teamSize: data.teamSize || 4,
      substituteLimit: data.substituteLimit || 2,
      registrationStart: data.registrationStart || new Date().toISOString(),
      registrationEnd: data.registrationEnd || new Date(Date.now() + 86400000 * 3).toISOString(),
      matchStart: data.matchStart || new Date(Date.now() + 86400000 * 4).toISOString(),
      roomReleaseTime: data.roomReleaseTime || new Date(Date.now() + 86400000 * 4 - 900000).toISOString(),
      status: (data.status as any) || 'DRAFT',
      visibility: data.visibility || 'Public',
      organizer: organizerId,
      rules: data.rules || [
        'Hacks or emulators are prohibited.',
        'Credentials will release 15m before lobby opens.'
      ],
      scoringSystem: data.scoringSystem || defaultScoring,
      prizeDistribution: data.prizeDistribution || defaultPrizes,
      tags: data.tags || ['BGMI', 'Squad', 'Demo'],
      featured: data.featured || false,
      minimumPlayers: data.minimumPlayers || 4,
      maximumPlayers: data.maximumPlayers || 6,
      captainOnlyRegistration: data.captainOnlyRegistration !== undefined ? data.captainOnlyRegistration : true,
      manualSlotSelection: data.manualSlotSelection !== undefined ? data.manualSlotSelection : true,
      maximumSlots: data.maximumSlots || 16,
      waitlistEnabled: data.waitlistEnabled !== undefined ? data.waitlistEnabled : true,
      refundPolicy: data.refundPolicy || 'REFUND_BEFORE_DEADLINE',
      cancellationDeadline: data.cancellationDeadline || new Date(Date.now() + 86400000 * 2).toISOString(),
      refundPercentage: data.refundPercentage || 100,
      cancellationFee: data.cancellationFee || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localOrganizerTournamentRepository.save(tournament);
    
    // Auto-create Slots
    const slots: TournamentSlot[] = [];
    const maxSlots = tournament.maximumSlots || 16;
    for (let i = 1; i <= maxSlots; i++) {
      slots.push({
        id: `slot-${tournament.id}-${i}`,
        tournamentId: tournament.id,
        slotNumber: i,
        status: 'AVAILABLE'
      });
    }
    localTournamentSlotRepository.saveAll(slots);

    this.addActivity(
      organizerId,
      'TOURNAMENT',
      tournament.id,
      'TOURNAMENT_CREATED',
      'Tournament Created',
      `"${tournament.title}" has been created as draft.`
    );

    return tournament;
  }

  updateTournament(organizerId: string, tournamentId: string, updates: Partial<Tournament>): Tournament | null {
    const list = localOrganizerTournamentRepository.getAll();
    const idx = list.findIndex((t) => t.id === tournamentId);
    if (idx === -1) return null;

    const original = list[idx];
    
    // Status lock checks
    const restrict = this.getChangeRestrictions(original.status);
    if (restrict.locked && updates.status === undefined) {
      throw new Error(`Fields cannot be updated: ${restrict.reason}`);
    }

    const updated: Tournament = {
      ...original,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localOrganizerTournamentRepository.save(updated);

    this.addActivity(
      organizerId,
      'TOURNAMENT',
      tournamentId,
      'TOURNAMENT_EDITED',
      'Tournament Updated',
      `Updates applied to "${updated.title}".`
    );

    return updated;
  }

  duplicateTournament(organizerId: string, tournamentId: string): Tournament | null {
    const original = localOrganizerTournamentRepository.getAll().find((t) => t.id === tournamentId);
    if (!original) return null;

    const data: Partial<Tournament> = {
      ...original,
      id: `tour-${Date.now()}`,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now()}`,
      status: 'DRAFT' as any,
      registeredParticipants: 0,
      roomDetails: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.createTournament(organizerId, data);
  }

  validateTournamentTransition(from: TournamentStatus, to: TournamentStatus): boolean {
    const transitions: Record<string, string[]> = {
      'DRAFT': ['SCHEDULED', 'REGISTRATION_OPEN', 'CANCELLED'],
      'Draft': ['SCHEDULED', 'REGISTRATION_OPEN', 'CANCELLED'],
      'SCHEDULED': ['REGISTRATION_OPEN', 'CANCELLED', 'POSTPONED'],
      'Upcoming': ['Registration Open', 'Cancelled', 'Postponed', 'REGISTRATION_OPEN'],
      'REGISTRATION_OPEN': ['REGISTRATION_CLOSED', 'LIVE', 'CANCELLED', 'POSTPONED'],
      'Registration Open': ['Registration Closed', 'Live', 'Cancelled', 'Postponed', 'REGISTRATION_CLOSED'],
      'REGISTRATION_CLOSED': ['LIVE', 'CANCELLED', 'POSTPONED'],
      'Registration Closed': ['Live', 'Cancelled', 'Postponed', 'LIVE'],
      'LIVE': ['COMPLETED', 'CANCELLED', 'POSTPONED'],
      'Live': ['Completed', 'Cancelled', 'Postponed', 'COMPLETED'],
      'POSTPONED': ['REGISTRATION_OPEN', 'SCHEDULED', 'LIVE', 'CANCELLED'],
      'Postponed': ['Registration Open', 'Live', 'Cancelled'],
      'COMPLETED': ['ARCHIVED'],
      'Completed': ['ARCHIVED'],
      'CANCELLED': ['ARCHIVED'],
      'Cancelled': ['ARCHIVED']
    };

    const allowed = transitions[from] || [];
    return allowed.includes(to);
  }

  changeTournamentStatus(organizerId: string, tournamentId: string, nextStatus: TournamentStatus): boolean {
    const list = localOrganizerTournamentRepository.getAll();
    const idx = list.findIndex((t) => t.id === tournamentId);
    if (idx === -1) return false;

    const currentStatus = list[idx].status;
    if (!this.validateTournamentTransition(currentStatus, nextStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${nextStatus}.`);
    }

    list[idx].status = nextStatus;
    list[idx].updatedAt = new Date().toISOString();
    localOrganizerTournamentRepository.saveAll(list);

    let activityAction: OrganizerActivityType = 'TOURNAMENT_EDITED';
    if (nextStatus === 'REGISTRATION_OPEN' || nextStatus === 'Registration Open') {
      activityAction = 'TOURNAMENT_PUBLISHED';
    } else if (nextStatus === 'CANCELLED' || nextStatus === 'Cancelled') {
      activityAction = 'TOURNAMENT_CANCELLED';
    } else if (nextStatus === 'POSTPONED') {
      activityAction = 'TOURNAMENT_POSTPONED';
    }

    this.addActivity(
      organizerId,
      'TOURNAMENT',
      tournamentId,
      activityAction,
      `Tournament Status Changed`,
      `"${list[idx].title}" status set to ${nextStatus}.`
    );

    return true;
  }

  getChangeRestrictions(status: TournamentStatus): TournamentChangeRestriction {
    const lockedStatuses = ['LIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED', 'Live', 'Completed', 'Cancelled'];
    if (lockedStatuses.includes(status)) {
      return { locked: true, reason: `Tournament matches are in progress or finished (Status: ${status}).` };
    }
    return { locked: false, reason: '' };
  }

  // --- REGISTRATION APPROVAL ---

  approveRegistration(organizerId: string, registrationId: string): boolean {
    const reg = localRegistrationRepository.getById(registrationId);
    if (!reg) return false;

    reg.status = 'CONFIRMED';
    reg.paymentStatus = 'SUCCESS';
    localRegistrationRepository.save(reg);

    // Update Tournament slots count
    const tour = localOrganizerTournamentRepository.getAll().find((t) => t.id === reg.tournamentId);
    if (tour) {
      tour.registeredParticipants += 1;
      localOrganizerTournamentRepository.save(tour);
    }

    // Assign dynamic slot number automatically if not assigned
    if (!reg.slotNumber) {
      const slot = localTournamentSlotRepository.getByTournamentId(reg.tournamentId).find((s) => s.status === 'AVAILABLE');
      if (slot) {
        slot.status = 'OCCUPIED';
        slot.registrationId = reg.id;
        slot.participantId = reg.teamId || reg.playerId;
        slot.participantName = reg.teamName || reg.playerId;
        slot.teamId = reg.teamId;
        slot.teamName = reg.teamName;
        slot.confirmedAt = new Date().toISOString();
        localTournamentSlotRepository.save(slot);

        reg.slotNumber = slot.slotNumber;
        localRegistrationRepository.save(reg);
      }
    }

    // Send notifications to players
    reg.membersRegistered.forEach((m) => {
      notificationService.sendNotification(
        m.playerId,
        'REGISTRATION_CONFIRMED',
        'Registration Confirmed!',
        `Your slot in tournament "${tour?.title || 'VONK Esports'}" is approved. Roster: Slot #${reg.slotNumber || 'Auto'}`
      );
    });

    this.addActivity(
      organizerId,
      'REGISTRATION',
      registrationId,
      'REGISTRATION_APPROVED',
      'Registration Approved',
      `Registration for team "${reg.teamName || reg.playerId}" was approved.`
    );

    return true;
  }

  rejectRegistration(organizerId: string, registrationId: string, reason: RegistrationRejectionReason, notes?: string): boolean {
    const reg = localRegistrationRepository.getById(registrationId);
    if (!reg) return false;

    reg.status = 'REJECTED';
    reg.paymentStatus = 'FAILED';
    reg.cancellationReason = `${reason}: ${notes || ''}`;
    reg.cancelledAt = new Date().toISOString();
    localRegistrationRepository.save(reg);

    // Refund entry fee using simulated balance credit
    if (reg.entryFeePaid > 0) {
      const wallet = localWalletRepository.getWallet(reg.playerId);
      if (wallet) {
        const balBefore = wallet.balance;
        wallet.balance += reg.entryFeePaid;
        wallet.totalRefunds += reg.entryFeePaid;
        localWalletRepository.saveWallet(wallet);

        const refundTx: WalletTransaction = {
          id: `tx-ref-${Date.now()}`,
          playerId: reg.playerId,
          type: 'REFUND',
          direction: 'CREDIT',
          amount: reg.entryFeePaid,
          title: 'Registration Refunded',
          description: `Simulated refund for registration rejection: ${reg.tournamentTitle || 'VONK Tournament'}`,
          status: 'SUCCESS',
          balanceBefore: balBefore,
          balanceAfter: wallet.balance,
          tournamentId: reg.tournamentId,
          tournamentName: reg.tournamentTitle,
          referenceId: reg.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDemo: true
        };
        localTransactionRepository.save(refundTx);
      }
    }

    // Notify Captain
    notificationService.sendNotification(
      reg.playerId,
      'REGISTRATION_REJECTED',
      'Registration Rejected',
      `Registration was rejected due to: ${reason}. Entry fee refunded.`
    );

    this.addActivity(
      organizerId,
      'REGISTRATION',
      registrationId,
      'REGISTRATION_REJECTED',
      'Registration Rejected',
      `Registration for "${reg.teamName || reg.playerId}" rejected. Reason: ${reason}`
    );

    return true;
  }

  // --- SLOT MANAGEMENT ---

  assignSlot(organizerId: string, tournamentId: string, slotNumber: number, registrationId: string): boolean {
    const slots = localTournamentSlotRepository.getByTournamentId(tournamentId);
    const slot = slots.find((s) => s.slotNumber === slotNumber);
    const reg = localRegistrationRepository.getById(registrationId);
    
    if (!slot || !reg) return false;

    // Check if slot is occupied or locked
    if (slot.status === 'OCCUPIED' && slot.registrationId !== registrationId) {
      throw new Error(`Slot #${slotNumber} is already occupied.`);
    }

    // Clean previous slot occupied by this registration
    const prev = slots.find((s) => s.registrationId === registrationId);
    if (prev) {
      prev.status = 'AVAILABLE';
      prev.registrationId = undefined;
      prev.participantId = undefined;
      prev.participantName = undefined;
      prev.teamId = undefined;
      prev.teamName = undefined;
      localTournamentSlotRepository.save(prev);
    }

    slot.status = 'OCCUPIED';
    slot.registrationId = reg.id;
    slot.participantId = reg.teamId || reg.playerId;
    slot.participantName = reg.teamName || reg.playerId;
    slot.teamId = reg.teamId;
    slot.teamName = reg.teamName;
    slot.confirmedAt = new Date().toISOString();
    localTournamentSlotRepository.save(slot);

    reg.slotNumber = slotNumber;
    localRegistrationRepository.save(reg);

    this.addActivity(
      organizerId,
      'TOURNAMENT',
      tournamentId,
      'SLOT_ASSIGNED',
      'Slot Assigned',
      `Registration "${reg.teamName || reg.playerId}" assigned to Slot #${slotNumber}.`
    );

    return true;
  }

  swapSlots(organizerId: string, tournamentId: string, slotA: number, slotB: number): boolean {
    const slots = localTournamentSlotRepository.getByTournamentId(tournamentId);
    const sA = slots.find((s) => s.slotNumber === slotA);
    const sB = slots.find((s) => s.slotNumber === slotB);

    if (!sA || !sB) return false;

    const temp = { ...sA };

    sA.status = sB.status;
    sA.registrationId = sB.registrationId;
    sA.participantId = sB.participantId;
    sA.participantName = sB.participantName;
    sA.teamId = sB.teamId;
    sA.teamName = sB.teamName;

    sB.status = temp.status;
    sB.registrationId = temp.registrationId;
    sB.participantId = temp.participantId;
    sB.participantName = temp.participantName;
    sB.teamId = temp.teamId;
    sB.teamName = temp.teamName;

    localTournamentSlotRepository.save(sA);
    localTournamentSlotRepository.save(sB);

    // Update registration links
    if (sA.registrationId) {
      const regA = localRegistrationRepository.getById(sA.registrationId);
      if (regA) {
        regA.slotNumber = slotA;
        localRegistrationRepository.save(regA);
      }
    }
    if (sB.registrationId) {
      const regB = localRegistrationRepository.getById(sB.registrationId);
      if (regB) {
        regB.slotNumber = slotB;
        localRegistrationRepository.save(regB);
      }
    }

    return true;
  }

  // --- MATCH SCHEDULING ---

  createMatch(organizerId: string, tournamentId: string, data: Partial<Match>): Match {
    const match: Match = {
      id: data.id || `match-${Date.now()}`,
      tournamentId,
      status: data.status || 'UPCOMING',
      roomIdReleased: data.roomIdReleased || false,
      startTime: data.startTime || new Date(Date.now() + 3600000).toISOString()
    };

    // Save mock match in list
    const list = browserStorage.getItem<Match[]>('vonk:v1:matches', []);
    list.push(match);
    browserStorage.setItem('vonk:v1:matches', list);

    this.addActivity(
      organizerId,
      'MATCH',
      match.id,
      'MATCH_CREATED',
      'Match Scheduled',
      `Match scheduled to start at ${new Date(match.startTime).toLocaleTimeString()}.`
    );

    return match;
  }

  releaseCredentials(organizerId: string, matchId: string, roomId: string, password: string): boolean {
    const matches = browserStorage.getItem<Match[]>('vonk:v1:matches', []);
    const idx = matches.findIndex((m) => m.id === matchId);
    if (idx === -1) return false;

    matches[idx].roomIdReleased = true;
    browserStorage.setItem('vonk:v1:matches', matches);

    // Find and update credentials on the main tournament object
    const tourList = localOrganizerTournamentRepository.getAll();
    const tourIdx = tourList.findIndex((t) => t.id === matches[idx].tournamentId);
    if (tourIdx > -1) {
      tourList[tourIdx].roomDetails = { roomId, roomPassword: password };
      tourList[tourIdx].status = 'Room Released';
      localOrganizerTournamentRepository.save(tourList[tourIdx]);
    }

    // Send notifications to all registered teams in the tournament
    const registrations = localRegistrationRepository.getByTournamentId(matches[idx].tournamentId);
    registrations.forEach((reg) => {
      if (reg.status === 'CONFIRMED' || reg.status === 'APPROVED') {
        reg.membersRegistered.forEach((member) => {
          notificationService.sendNotification(
            member.playerId,
            'ROOM_RELEASED',
            'Match Room Released!',
            `Credentials: ID ${roomId} | PW ${password}. Access the lobby now.`
          );
        });
      }
    });

    // Save an announcement
    this.publishAnnouncement(organizerId, {
      tournamentId: matches[idx].tournamentId,
      matchId,
      title: 'Match Room Credentials Released!',
      content: `Lobby is now open. Room ID: ${roomId} | Password: ${password}. Match starts in 15 minutes.`,
      type: 'ROOM_UPDATE',
      targetAudience: 'REGISTERED'
    });

    this.addActivity(
      organizerId,
      'MATCH',
      matchId,
      'CREDENTIALS_RELEASED',
      'Credentials Released',
      `Lobby credentials for Match ID ${roomId} have been published.`
    );

    return true;
  }

  // --- ANNOUNCEMENTS ---

  publishAnnouncement(organizerId: string, data: Partial<OrganizerAnnouncement>): OrganizerAnnouncement {
    const ann: OrganizerAnnouncement = {
      id: `ann-${Date.now()}`,
      tournamentId: data.tournamentId || '',
      matchId: data.matchId,
      roundId: data.roundId,
      title: data.title || 'Official Update',
      content: data.content || '',
      type: data.type || 'GENERAL',
      targetAudience: data.targetAudience || 'ALL',
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isDemo: true
    };

    const list = browserStorage.getItem<OrganizerAnnouncement[]>(STORAGE_KEYS.ORGANIZER_ANNOUNCEMENTS, []);
    list.push(ann);
    browserStorage.setItem(STORAGE_KEYS.ORGANIZER_ANNOUNCEMENTS, list);

    // Notify registered players
    if (data.tournamentId) {
      const regs = localRegistrationRepository.getByTournamentId(data.tournamentId);
      regs.forEach((r) => {
        if (r.status === 'CONFIRMED' || r.status === 'APPROVED') {
          r.membersRegistered.forEach((m) => {
            notificationService.sendNotification(
              m.playerId,
              'DISPUTE_UPDATED', // standard type
              ann.title,
              ann.content
            );
          });
        }
      });
    }

    this.addActivity(
      organizerId,
      'ANNOUNCEMENT',
      ann.id,
      'ANNOUNCEMENT_PUBLISHED',
      'Announcement Published',
      `Announcement "${ann.title}" is live.`
    );

    return ann;
  }

  // --- RESULTS AND LEADERBOARD ---

  validateResultPublication(resultId: string): { valid: boolean; errors: string[]; warnings: string[] } {
    const res = localResultRepository.getAll().find((r: MatchResult) => r.id === resultId);
    if (!res) return { valid: false, errors: ['Match result record not found.'], warnings: [] };

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!res.placement || res.placement <= 0) {
      errors.push('Placement ranking must be positive.');
    }
    if (res.kills === undefined || res.kills < 0) {
      errors.push('Kills count cannot be negative.');
    }
    if (!res.participantName) {
      warnings.push('Participant details are incomplete.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  publishMatchResult(organizerId: string, resultId: string): boolean {
    const val = this.validateResultPublication(resultId);
    if (!val.valid) {
      throw new Error(`Cannot publish: ${val.errors.join(', ')}`);
    }

    const res = resultService.publishResult(resultId);
    if (res) {
      const resultObj = localResultRepository.getAll().find((r: MatchResult) => r.id === resultId);
      this.addActivity(
        organizerId,
        'RESULT',
        resultId,
        'RESULT_PUBLISHED',
        'Match Result Published',
        `Match results for round "${resultObj?.roundId || 'Finals'}" were published.`
      );
    }
    return res;
  }

  correctMatchResult(organizerId: string, resultId: string, updates: Partial<MatchResult>, reason: string): boolean {
    const res = resultService.correctResult(resultId, updates, reason, 'Organizer Referee');
    if (res) {
      this.addActivity(
        organizerId,
        'RESULT',
        resultId,
        'RESULT_CORRECTED',
        'Match Result Corrected',
        `Score values revised: ${reason}`
      );
    }
    return res;
  }

  // --- DISPUTES ---

  resolveDispute(organizerId: string, disputeId: string, resolution: 'ACCEPTED' | 'REJECTED', notes: string): boolean {
    const list = localDisputeRepository.getAll();
    const idx = list.findIndex((d) => d.id === disputeId);
    if (idx === -1) return false;

    const dispute = list[idx];
    dispute.status = 'RESOLVED';
    dispute.resolvedAt = new Date().toISOString();
    dispute.resolution = `${resolution}: ${notes}`;
    localDisputeRepository.saveAll(list);

    // Update match results status if necessary
    const resList = localResultRepository.getAll();
    const resIdx = resList.findIndex((r) => r.id === dispute.resultId);
    if (resIdx > -1) {
      resList[resIdx].status = resolution === 'ACCEPTED' ? 'CORRECTED' : 'FINAL';
      localResultRepository.saveAll(resList);
    }

    // Notify Submitter
    notificationService.sendNotification(
      dispute.submittedBy,
      'DISPUTE_UPDATED',
      'Dispute Appeal Resolved',
      `Your dispute regarding match scorecard was ${resolution.toLowerCase()}. Notes: ${notes}`
    );

    this.addActivity(
      organizerId,
      'DISPUTE',
      disputeId,
      'DISPUTE_RESOLVED',
      'Dispute Resolved',
      `Appeal dispute resolve case set to ${resolution}: ${notes}`
    );

    return true;
  }

  // --- PRIZE ADMINISTRATION ---

  calculatePrizeDistribution(tournamentId: string): PrizeDistributionRecord {
    const tour = localOrganizerTournamentRepository.getAll().find((t) => t.id === tournamentId);
    if (!tour) throw new Error('Tournament not found.');

    const standings = resultService.recalculateStandings(tournamentId);
    const results = localResultRepository.getAll().filter((r) => r.tournamentId === tournamentId);

    const pool = tour.prizePool || 0;
    const recipients: PrizeRecipient[] = [];

    // Calculate place distributions (Top 3)
    const place1 = standings.find((s) => s.rank === 1);
    const place2 = standings.find((s) => s.rank === 2);
    const place3 = standings.find((s) => s.rank === 3);

    if (place1) {
      recipients.push({
        participantId: place1.participantId,
        participantName: place1.participantId === 'team-soul' ? 'Team SouL' : place1.participantId === 'team-godl' ? 'GodLike Esports' : 'Apex Hunters',
        rank: 1,
        prizeAmount: Math.round(pool * 0.5),
        killsCount: place1.totalKills,
        killPointsAmount: place1.totalKills * (tour.perKillReward || 0),
        totalPoints: place1.totalPoints,
        eligibleCategory: 'Winner Prize'
      });
    }
    if (place2) {
      recipients.push({
        participantId: place2.participantId,
        participantName: place2.participantId === 'team-soul' ? 'Team SouL' : place2.participantId === 'team-godl' ? 'GodLike Esports' : 'Apex Hunters',
        rank: 2,
        prizeAmount: Math.round(pool * 0.3),
        killsCount: place2.totalKills,
        killPointsAmount: place2.totalKills * (tour.perKillReward || 0),
        totalPoints: place2.totalPoints,
        eligibleCategory: 'Runner-up Prize'
      });
    }
    if (place3) {
      recipients.push({
        participantId: place3.participantId,
        participantName: place3.participantId === 'team-soul' ? 'Team SouL' : place3.participantId === 'team-godl' ? 'GodLike Esports' : 'Apex Hunters',
        rank: 3,
        prizeAmount: Math.round(pool * 0.2),
        killsCount: place3.totalKills,
        killPointsAmount: place3.totalKills * (tour.perKillReward || 0),
        totalPoints: place3.totalPoints,
        eligibleCategory: 'Third Place Prize'
      });
    }

    const totalAlloc = recipients.reduce((sum, r) => sum + r.prizeAmount + r.killPointsAmount, 0);

    const record: PrizeDistributionRecord = {
      id: `pdist-${tournamentId}`,
      tournamentId,
      prizePool: pool,
      recipients,
      status: 'CALCULATED',
      allocatedAmount: totalAlloc,
      unallocatedAmount: Math.max(0, pool - totalAlloc),
      isDemo: true
    };

    localPrizeDistributionRepository.save(record);
    return record;
  }

  approvePrizeDistribution(organizerId: string, tournamentId: string): boolean {
    const record = localPrizeDistributionRepository.getByTournament(tournamentId);
    if (!record) return false;

    record.status = 'APPROVED';
    record.approvedBy = organizerId;
    record.approvedAt = new Date().toISOString();
    localPrizeDistributionRepository.save(record);

    this.addActivity(
      organizerId,
      'PRIZE',
      record.id,
      'PRIZE_APPROVED',
      'Prize Distribution Approved',
      `Prize ledger approved for tournament payouts.`
    );

    return true;
  }

  creditDemoPrizes(organizerId: string, tournamentId: string): boolean {
    const record = localPrizeDistributionRepository.getByTournament(tournamentId);
    if (!record || record.status !== 'APPROVED') {
      throw new Error('Prize distribution ledger is not approved.');
    }

    const tour = localOrganizerTournamentRepository.getAll().find((t) => t.id === tournamentId);
    if (!tour) return false;

    // Credit each recipient's simulated wallet
    record.recipients.forEach((rec) => {
      const reg = localRegistrationRepository.getByTournamentId(tournamentId).find((r) => r.teamId === rec.participantId || r.playerId === rec.participantId);
      if (!reg) return;

      const totalWin = rec.prizeAmount + rec.killPointsAmount;
      const wallet = localWalletRepository.getWallet(reg.playerId);
      if (wallet) {
        const balBefore = wallet.balance;
        wallet.balance += totalWin;
        wallet.totalPrizesWon += totalWin;
        localWalletRepository.saveWallet(wallet);

        const tx: WalletTransaction = {
          id: `tx-prize-${Date.now()}-${rec.participantId}`,
          playerId: reg.playerId,
          type: 'PRIZE_WINNING',
          direction: 'CREDIT',
          amount: totalWin,
          title: `${rec.eligibleCategory} Won`,
          description: `Simulated prize payout for ranking #${rec.rank} in ${tour.title}`,
          status: 'SUCCESS',
          balanceBefore: balBefore,
          balanceAfter: wallet.balance,
          tournamentId,
          tournamentName: tour.title,
          referenceId: record.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDemo: true
        };
        localTransactionRepository.save(tx);

        notificationService.sendNotification(
          reg.playerId,
          'PRIZE_CREDITED',
          'Prize Credits Deposited!',
          `You received a prize payout of ₹${totalWin} for rank #${rec.rank} in "${tour.title}".`
        );
      }
    });

    record.status = 'CREDITED';
    record.creditedAt = new Date().toISOString();
    localPrizeDistributionRepository.save(record);

    this.addActivity(
      organizerId,
      'PRIZE',
      record.id,
      'DEMO_PRIZE_CREDITED',
      'Demo Prizes Credited',
      `Simulated funds credited to winners rosters wallets.`
    );

    return true;
  }

  // --- ANALYTICS ---

  calculateAnalytics(organizerId: string): OrganizerAnalytics {
    const tours = localOrganizerTournamentRepository.getByOrganizer(organizerId);
    const regs = localRegistrationRepository.getAll();

    const totalTournaments = tours.length;
    let registrationsCount = 0;
    let approvedCount = 0;
    let feesCollected = 0;

    tours.forEach((t) => {
      const tRegs = regs.filter((r) => r.tournamentId === t.id);
      registrationsCount += tRegs.length;
      approvedCount += tRegs.filter((r) => r.status === 'CONFIRMED' || r.status === 'APPROVED').length;
      feesCollected += tRegs.filter((r) => r.status === 'CONFIRMED' || r.status === 'APPROVED').reduce((sum, r) => sum + r.entryFeePaid, 0);
    });

    const conversion = registrationsCount > 0 ? Math.round((approvedCount / registrationsCount) * 100) : 100;
    const avgFee = totalTournaments > 0 ? Math.round(feesCollected / totalTournaments) : 0;

    return {
      totalTournaments,
      registrationsOverTime: [
        { date: 'Jul 15', count: 12 },
        { date: 'Jul 16', count: 18 },
        { date: 'Jul 17', count: 25 },
        { date: 'Jul 18', count: approvedCount }
      ],
      registrationConversion: conversion,
      slotUtilization: 85,
      cancellationRate: 5,
      refundTotals: Math.round(feesCollected * 0.1),
      averageEntryFee: avgFee,
      demoPrizeAllocation: tours.reduce((sum, t) => sum + (t.prizePool || 0), 0),
      matchCompletionRate: 98,
      resultPublicationRate: 100,
      averageKillsPerMatch: 34,
      popularFormats: [
        { format: 'Squad', count: tours.filter((t) => t.mode === 'Squad').length },
        { format: 'TDM 4v4', count: tours.filter((t) => t.mode === 'TDM 4v4').length }
      ],
      playerVsTeamMix: [
        { type: 'Solo', count: tours.filter((t) => t.mode === 'Solo').length },
        { type: 'Team', count: tours.filter((t) => t.mode !== 'Solo').length }
      ]
    };
  }

  // --- SEEDING & RESET SERVICES ---

  addActivity(
    organizerId: string, 
    entityType: OrganizerActivity['entityType'],
    entityId: string,
    action: OrganizerActivityType,
    title: string,
    description: string
  ): void {
    const act: OrganizerActivity = {
      id: `act-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      organizerId,
      entityType,
      entityId,
      action,
      title,
      description,
      createdAt: new Date().toISOString(),
      isDemo: true
    };
    localOrganizerActivityRepository.save(act);
  }

  seedData(organizerId = 'org-1'): void {
    const profile: OrganizerProfile = {
      id: organizerId,
      name: 'VONK Esports Inc.',
      organizationName: 'VONK Gaming Network',
      displayName: 'VONK Esports Organizer',
      logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop',
      bio: 'Official Host for seasonal tournament programs and premier clan league divisions.',
      region: 'India',
      languages: ['English', 'Hindi'],
      contactEmail: 'organizer@vonk.gg',
      establishedYear: 2024,
      tournamentsHosted: 8,
      isVerified: true
    };
    localOrganizerRepository.save(profile);

    const settings: OrganizerSettings = {
      organizerId,
      defaultFormat: 'Squad',
      defaultScoringTemplate: 'BGMI Official 2024',
      defaultRefundPolicy: 'REFUND_BEFORE_DEADLINE',
      defaultTimezone: 'Asia/Kolkata',
      defaultAnnouncementPrefs: { email: true, push: true },
      demoControlsVisible: true,
      tableViewPreference: 'table',
      requireConfirmations: true
    };
    localOrganizerSettingsRepository.save(settings);

    // Seed tournaments connected to this organizer
    const tours = localOrganizerTournamentRepository.getAll();
    const exitsOrg = tours.some((t) => t.organizer === organizerId);
    if (!exitsOrg) {
      // Seed a completed tournament
      this.createTournament(organizerId, {
        id: 'tour-5', // connects to results tour-5
        title: 'VONK BGMI Roster Clash - Invitational',
        slug: 'vonk-bgmi-roster-clash',
        entryFee: 10,
        prizePool: 1500,
        status: 'Completed' as any,
        game: 'BGMI',
        mode: 'Squad',
        maxParticipants: 16
      });
      // Seed a live draft
      this.createTournament(organizerId, {
        id: 'tour-draft-1',
        title: 'BGMI Underdog League Season 1',
        slug: 'bgmi-underdog-league-s1',
        entryFee: 0,
        prizePool: 500,
        status: 'DRAFT',
        game: 'BGMI',
        mode: 'Squad'
      });
      // Seed a live registration-open tournament
      this.createTournament(organizerId, {
        id: 'tour-open-1',
        title: 'Ultimate 4v4 TDM Masters Duel',
        slug: 'ultimate-tdm-masters-duel',
        entryFee: 150,
        prizePool: 8000,
        status: 'REGISTRATION_OPEN',
        game: 'BGMI',
        mode: 'TDM 4v4',
        maxParticipants: 8
      });
    }

    // Seed historical activities
    this.addActivity(organizerId, 'TOURNAMENT', 'tour-5', 'TOURNAMENT_PUBLISHED', 'Invitational Published', 'VONK BGMI Roster Clash is now open for registration.');
    this.addActivity(organizerId, 'MATCH', 'match-tour-5-r1', 'MATCH_CREATED', 'Round 1 Scheduled', 'Match Scheduled.');
  }

  resetData(): void {
    localOrganizerRepository.clear();
    localOrganizerActivityRepository.clear();
    localOrganizerSettingsRepository.clear();
    localPrizeDistributionRepository.clear();
  }
}

export const organizerService = new OrganizerService();
export default organizerService;
