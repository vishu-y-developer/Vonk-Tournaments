/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Registration,
  Tournament,
  Player,
  Team,
  RegistrationEligibility,
  RegistrationValidationIssue,
  RegistrationStatus,
  RegistrationRosterMember,
  TournamentSlot,
  TournamentSlotStatus,
  WaitlistEntry,
  RefundCalculation,
  RefundPolicy,
  PaymentStatus,
  PaymentMethodType
} from '@/types';
import { localRegistrationRepository } from '@/repositories/local/local-registration-repository';
import { localTournamentRepository } from '@/repositories/local/local-tournament-repository';
import { localTournamentSlotRepository } from '@/repositories/local/local-tournament-slot-repository';
import { walletService } from './wallet-service';
import { notificationService } from './notification-service';
import { browserStorage } from '@/lib/storage/browser-storage';

export class RegistrationService {
  // --- IN-MEMORY OR LOCAL STORAGE HELPERS ---
  
  // Activities logs list
  getActivities(registrationId?: string): any[] {
    if (typeof window === 'undefined') return [];
    const activities = browserStorage.getItem<any[]>('vonk:v1:registration-activities', []);
    if (registrationId) {
      return activities.filter((a) => a.registrationId === registrationId);
    }
    return activities;
  }

  logActivity(registrationId: string, type: string, description: string): void {
    if (typeof window === 'undefined') return;
    const activities = browserStorage.getItem<any[]>('vonk:v1:registration-activities', []);
    activities.push({
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      registrationId,
      type,
      description,
      timestamp: new Date().toISOString()
    });
    browserStorage.setItem('vonk:v1:registration-activities', activities);
  }

  // Waitlist store helper
  getWaitlist(tournamentId?: string): WaitlistEntry[] {
    if (typeof window === 'undefined') return [];
    const list = browserStorage.getItem<WaitlistEntry[]>('vonk:v1:waitlist', []);
    if (tournamentId) {
      return list.filter((w) => w.tournamentId === tournamentId);
    }
    return list;
  }

  saveWaitlist(list: WaitlistEntry[]): void {
    if (typeof window === 'undefined') return;
    browserStorage.setItem('vonk:v1:waitlist', list);
  }

  // --- SLOT BOOKING ENGINE ---

  // Generate initial slots for a tournament if not exist yet
  generateSlots(tournament: Tournament): TournamentSlot[] {
    const existing = localTournamentSlotRepository.getByTournamentId(tournament.id);
    if (existing.length > 0) return existing;

    const maxSlots = tournament.maximumSlots || tournament.maxParticipants || 20;
    const slots: TournamentSlot[] = [];

    // Seed some occupied slots to make it look populated and alive!
    // We will occupy about 30% of slots with fake teams
    const seedNames = ['Apex Hunters', 'Hydra Esports', 'Soul Clan', 'GodLike Legends', 'Viper Squad', 'GXR Esports', 'Team IND', 'Element Esports'];
    const fakeTeamCount = Math.floor(maxSlots * 0.3);

    for (let i = 1; i <= maxSlots; i++) {
      const isFakeOccupied = i <= fakeTeamCount && i < seedNames.length;
      slots.push({
        id: `slot-${tournament.id}-${i}`,
        tournamentId: tournament.id,
        slotNumber: i,
        status: isFakeOccupied ? 'OCCUPIED' : 'AVAILABLE',
        participantName: isFakeOccupied ? seedNames[i - 1] : undefined,
        teamName: isFakeOccupied ? seedNames[i - 1] : undefined,
        confirmedAt: isFakeOccupied ? new Date(Date.now() - 3600000 * i).toISOString() : undefined
      });
    }

    localTournamentSlotRepository.saveAll(slots);
    return slots;
  }

  getAvailableSlots(tournamentId: string): TournamentSlot[] {
    const slots = localTournamentSlotRepository.getByTournamentId(tournamentId);
    return slots.filter((s) => s.status === 'AVAILABLE');
  }

  reserveSlot(tournamentId: string, slotNumber: number, participantId: string, participantName: string): boolean {
    const slots = localTournamentSlotRepository.getByTournamentId(tournamentId);
    const slot = slots.find((s) => s.slotNumber === slotNumber);
    if (!slot || slot.status !== 'AVAILABLE') return false;

    slot.status = 'RESERVED';
    slot.participantId = participantId;
    slot.participantName = participantName;
    slot.reservedAt = new Date().toISOString();
    localTournamentSlotRepository.save(slot);
    return true;
  }

  confirmSlot(tournamentId: string, slotNumber: number, registrationId: string, teamId?: string, teamName?: string): boolean {
    const slots = localTournamentSlotRepository.getByTournamentId(tournamentId);
    const slot = slots.find((s) => s.slotNumber === slotNumber);
    if (!slot || (slot.status !== 'RESERVED' && slot.status !== 'AVAILABLE')) return false;

    slot.status = 'OCCUPIED';
    slot.registrationId = registrationId;
    slot.teamId = teamId;
    slot.teamName = teamName;
    slot.confirmedAt = new Date().toISOString();
    localTournamentSlotRepository.save(slot);
    return true;
  }

  releaseSlot(tournamentId: string, slotNumber: number): void {
    const slots = localTournamentSlotRepository.getByTournamentId(tournamentId);
    const slot = slots.find((s) => s.slotNumber === slotNumber);
    if (!slot) return;

    slot.status = 'AVAILABLE';
    slot.registrationId = undefined;
    slot.participantId = undefined;
    slot.participantName = undefined;
    slot.teamId = undefined;
    slot.teamName = undefined;
    slot.reservedAt = undefined;
    slot.confirmedAt = undefined;
    localTournamentSlotRepository.save(slot);
  }

  autoAssignSlot(tournamentId: string, registrationId: string, participantId: string, participantName: string, teamId?: string, teamName?: string): number | null {
    const slots = localTournamentSlotRepository.getByTournamentId(tournamentId);
    const available = slots.find((s) => s.status === 'AVAILABLE');
    if (!available) return null;

    available.status = 'OCCUPIED';
    available.registrationId = registrationId;
    available.participantId = participantId;
    available.participantName = participantName;
    available.teamId = teamId;
    available.teamName = teamName;
    available.confirmedAt = new Date().toISOString();
    localTournamentSlotRepository.save(available);
    return available.slotNumber;
  }

  // --- ELIGIBILITY CHECKS ---

  validateRegistrationEligibility(
    tournament: Tournament,
    player: Player,
    team?: Team | null,
    selectedRosterIds?: string[]
  ): RegistrationEligibility {
    const issues: RegistrationValidationIssue[] = [];
    const now = new Date();

    // Ensure slot schema is seeded for this tournament
    this.generateSlots(tournament);

    // 1. Check if tournament registration is open
    const statusVal = tournament.status;
    if (statusVal !== 'Registration Open' && statusVal !== 'Filling Fast') {
      issues.push({
        code: 'TOURNAMENT_NOT_OPEN',
        title: 'Registration Closed',
        message: 'Registrations are currently closed for this tournament layout.',
        severity: 'CRITICAL',
        blocking: true,
        suggestedAction: 'Browse Other Tournaments'
      });
    }

    // 2. Check registration dates
    const regStart = tournament.registrationOpenAt ? new Date(tournament.registrationOpenAt) : new Date(tournament.registrationStart);
    const regEnd = tournament.registrationCloseAt ? new Date(tournament.registrationCloseAt) : new Date(tournament.registrationEnd);

    if (now < regStart) {
      issues.push({
        code: 'REGISTRATION_NOT_STARTED',
        title: 'Registration Not Started',
        message: `Registration begins on ${regStart.toLocaleDateString()} at ${regStart.toLocaleTimeString()}.`,
        severity: 'CRITICAL',
        blocking: true,
        suggestedAction: 'Add to Watchlist'
      });
    }
    if (now > regEnd) {
      issues.push({
        code: 'DEADLINE_PASSED',
        title: 'Deadline Expired',
        message: 'The official slot registration window for this tournament has passed.',
        severity: 'CRITICAL',
        blocking: true,
        suggestedAction: 'View Match Center'
      });
    }

    // 3. Check level requirement
    // Tier priority logic: Beginner=1, Intermediate=2, Advanced=3, Pro=4, Invitational=5, Championship=6
    const tierMap: Record<string, number> = {
      'Beginner': 1,
      'Intermediate': 2,
      'Advanced': 3,
      'Pro': 4,
      'Invitational': 5,
      'Championship': 6
    };
    const playerTier = tierMap[player.level] || 1;
    const tournamentTier = tierMap[tournament.level] || 1;
    if (playerTier < tournamentTier) {
      issues.push({
        code: 'LEVEL_BELOW_MIN',
        title: 'Skill Tier Requirement Mismatch',
        message: `This tournament requires level tier "${tournament.level}" or higher. Your level tier is "${player.level}".`,
        severity: 'CRITICAL',
        blocking: true,
        suggestedAction: 'Train in Career Arena'
      });
    }

    // Account numeric level check (if defined)
    const minLevelReq = tournament.levelRequirement || 0;
    // Map player stats to get level, let's check mock statistics
    const mockStatLevel = (player.stats as any)?.level || 15; // default fallback
    if (mockStatLevel < minLevelReq) {
      issues.push({
        code: 'ACCOUNT_LEVEL_LOW',
        title: 'Account Level Requirement Mismatch',
        message: `This tournament requires account level ${minLevelReq} or higher. Your character level is ${mockStatLevel}.`,
        severity: 'CRITICAL',
        blocking: true,
        suggestedAction: 'Level Up Profile'
      });
    }

    // 4. Check if player has banned status
    const settingsRaw = localStorage.getItem('vonk:v1:settings');
    const settings = settingsRaw ? JSON.parse(settingsRaw) : null;
    if (settings?.devModeOptions?.forcePlayerBan) {
      issues.push({
        code: 'PLAYER_BANNED',
        title: 'Account Restricted',
        message: 'Your player profile is restricted or suspended due to safety flags.',
        severity: 'CRITICAL',
        blocking: true,
        suggestedAction: 'Contact Dispute Support'
      });
    }

    // 5. Check duplicate registrations
    const allRegs = this.getByTournamentId(tournament.id);
    const alreadyRegistered = allRegs.some((r) =>
      r.status !== 'CANCELLED' && r.status !== 'REFUNDED' &&
      r.membersRegistered.some((m) => m.playerId === player.id)
    );
    if (alreadyRegistered) {
      issues.push({
        code: 'ALREADY_REGISTERED',
        title: 'Already Registered',
        message: 'You have already registered and secured a slot for this tournament.',
        severity: 'CRITICAL',
        blocking: true,
        suggestedAction: 'View My Registrations'
      });
    }

    // 6. Format validations (Solo vs Team)
    const isTeamTournament = tournament.teamSize > 1;
    if (isTeamTournament) {
      if (!team) {
        issues.push({
          code: 'TEAM_REQUIRED',
          title: 'Squad Required',
          message: `This tournament requires a registered squad team format (${tournament.registrationFormat || 'Squad'}).`,
          severity: 'CRITICAL',
          blocking: true,
          suggestedAction: 'Create or Join Team'
        });
      } else {
        // Roster size checking
        const minPlayers = tournament.minimumPlayers || tournament.teamSize;
        const maxPlayers = tournament.maximumPlayers || (tournament.teamSize + (tournament.substituteLimit || 0));

        // Roster members selection size
        const rosterCount = selectedRosterIds ? selectedRosterIds.length : team.members.length;
        if (rosterCount < minPlayers) {
          issues.push({
            code: 'ROSTER_UNDERSIZED',
            title: 'Incomplete Team Roster',
            message: `You selected ${rosterCount} players. This tournament format requires at least ${minPlayers} members.`,
            severity: 'CRITICAL',
            blocking: true,
            suggestedAction: 'Manage Team Roster'
          });
        }
        if (rosterCount > maxPlayers) {
          issues.push({
            code: 'ROSTER_OVERSIZED',
            title: 'Roster Over Limits',
            message: `Roster has too many active participants. Max allowed is ${maxPlayers} members.`,
            severity: 'CRITICAL',
            blocking: true,
            suggestedAction: 'Manage Team Roster'
          });
        }

        // Validate captain permissions
        const isCaptainOnly = tournament.captainOnlyRegistration ?? true;
        const isCaptain = team.captainId === player.id;
        if (isCaptainOnly && !isCaptain) {
          issues.push({
            code: 'CAPTAIN_ONLY',
            title: 'Captain Permission Required',
            message: 'Only the designated Squad Captain can initiate registrations.',
            severity: 'CRITICAL',
            blocking: true,
            suggestedAction: 'Notify Team Captain'
          });
        }

        // Validate roster profiles character IDs
        const rosterToCheck = selectedRosterIds
          ? team.members.filter((m) => selectedRosterIds.includes(m.playerId))
          : team.members;
        
        const invalidProfiles = rosterToCheck.filter((m) => !m.characterId || m.characterId.trim() === '');
        if (invalidProfiles.length > 0) {
          issues.push({
            code: 'INCOMPLETE_ROSTER_PROFILES',
            title: 'Missing Character IDs',
            message: `Roster members (${invalidProfiles.map((p) => p.inGameName).join(', ')}) are missing verified BGMI Character IDs.`,
            severity: 'CRITICAL',
            blocking: true,
            suggestedAction: 'Edit Team Roster Settings'
          });
        }
      }
    } else {
      // Solo ID validation
      if (!player.characterId || player.characterId.trim() === '') {
        issues.push({
          code: 'CHARACTER_ID_MISSING',
          title: 'Missing BGMI Character ID',
          message: 'Your profile settings lack a verified BGMI Character ID.',
          severity: 'CRITICAL',
          blocking: true,
          suggestedAction: 'Complete Gamer Profile'
        });
      }
    }

    // 7. Check mock wallet balance
    const currentBalance = walletService.getBalance();
    if (currentBalance < tournament.entryFee) {
      issues.push({
        code: 'INSUFFICIENT_BALANCE',
        title: 'Insufficient Demo Wallet Balance',
        message: `Entry fee is ₹${tournament.entryFee}, but your available balance is ₹${currentBalance}.`,
        severity: 'CRITICAL',
        blocking: true,
        suggestedAction: 'Add Demo Balance'
      });
    }

    // 8. Check Region (if defined)
    const reqRegion = tournament.region || 'India';
    if (player.country && player.country !== 'India' && reqRegion === 'India') {
      issues.push({
        code: 'REGION_MISMATCH',
        title: 'Server Region Mismatch',
        message: `This tournament is locked to ${reqRegion} server regions.`,
        severity: 'WARNING',
        blocking: false,
        suggestedAction: 'Confirm High Ping Play'
      });
    }

    // 9. Full Check and Waitlist condition
    const slotsCount = this.getAvailableSlots(tournament.id).length;
    if (slotsCount === 0 && !alreadyRegistered) {
      const waitlistEnabled = tournament.waitlistEnabled ?? true;
      if (waitlistEnabled) {
        issues.push({
          code: 'TOURNAMENT_FULL_WAITLIST',
          title: 'Slots Fully Occupied',
          message: 'All confirmed slots are booked, but you can join the queue.',
          severity: 'WARNING',
          blocking: false,
          suggestedAction: 'Register to Waitlist'
        });
      } else {
        issues.push({
          code: 'TOURNAMENT_FULL',
          title: 'Tournament Fully Booked',
          message: 'All slots are fully occupied, and waitlisting is closed.',
          severity: 'CRITICAL',
          blocking: true,
          suggestedAction: 'Browse Other Tournaments'
        });
      }
    }

    const allowed = !issues.some((issue) => issue.blocking);

    return {
      allowed,
      issues,
      checkedAt: new Date().toISOString()
    };
  }

  // --- REGISTRATION EXECUTION ENGINE (ATOMIC SIMULATOR) ---

  submitRegistration(params: {
    tournament: Tournament;
    player: Player;
    team?: Team | null;
    selectedRosterIds?: string[];
    selectedSlotNumber?: number;
    consent: boolean;
  }): { success: boolean; error?: string; registration?: Registration } {
    
    // Double check eligibility validation
    const validation = this.validateRegistrationEligibility(
      params.tournament,
      params.player,
      params.team,
      params.selectedRosterIds
    );

    if (!validation.allowed) {
      return { success: false, error: validation.issues[0]?.message || 'Registration check failed.' };
    }

    if (!params.consent) {
      return { success: false, error: 'You must review and consent to all tournament rules.' };
    }

    const allSlots = localTournamentSlotRepository.getByTournamentId(params.tournament.id);
    const availableSlots = allSlots.filter((s) => s.status === 'AVAILABLE');
    const isWaitlistMode = availableSlots.length === 0;

    // Generate unique operation ID
    const operationId = `VONK-OP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const regId = `VONK-REG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    let assignedSlot: number | undefined;

    // Reserve slot block (if not waitlist)
    if (!isWaitlistMode) {
      if (params.selectedSlotNumber) {
        // Manual slot validation
        const manualSuccess = this.reserveSlot(
          params.tournament.id,
          params.selectedSlotNumber,
          params.team?.id || params.player.id,
          params.team?.name || params.player.username
        );
        if (!manualSuccess) {
          return { success: false, error: `Slot #${params.selectedSlotNumber} is no longer available. Try another.` };
        }
        assignedSlot = params.selectedSlotNumber;
      } else {
        // Auto assignment
        const autoSlotNum = this.autoAssignSlot(
          params.tournament.id,
          regId,
          params.team?.id || params.player.id,
          params.team?.name || params.player.username,
          params.team?.id,
          params.team?.name
        );
        if (autoSlotNum === null) {
          return { success: false, error: 'Failed to auto-assign a slot. Tournament is fully occupied.' };
        }
        assignedSlot = autoSlotNum;
      }
    }

    // Debit payment block
    const entryFee = params.tournament.entryFee;
    let paymentSuccess = true;

    if (entryFee > 0) {
      paymentSuccess = walletService.withdrawEntryFee(
        entryFee,
        `Demo Entry Fee: ${params.tournament.title} (Reg ID: ${regId})`
      );
    }

    // Rollback check
    if (!paymentSuccess) {
      // Payment failed - Roll back slot reservations
      if (assignedSlot) {
        this.releaseSlot(params.tournament.id, assignedSlot);
      }
      return { success: false, error: 'Simulated balance debit failed. Please check your demo wallet.' };
    }

    // Confirm slot reservation (if not waitlist)
    if (assignedSlot && !isWaitlistMode) {
      this.confirmSlot(
        params.tournament.id,
        assignedSlot,
        regId,
        params.team?.id,
        params.team?.name
      );
    }

    // Generate roster mapping
    const membersRegistered: RegistrationRosterMember[] = [];
    if (params.tournament.teamSize > 1 && params.team) {
      const selected = params.selectedRosterIds
        ? params.team.members.filter((m) => params.selectedRosterIds!.includes(m.playerId))
        : params.team.members;
      
      selected.forEach((m) => {
        membersRegistered.push({
          playerId: m.playerId,
          inGameName: m.inGameName,
          characterId: m.characterId,
          role: m.role || 'Member'
        });
      });
    } else {
      membersRegistered.push({
        playerId: params.player.id,
        inGameName: params.player.inGameName,
        characterId: params.player.characterId,
        role: 'Captain'
      });
    }

    // Save registration
    const registration: Registration = {
      id: regId,
      tournamentId: params.tournament.id,
      tournamentTitle: params.tournament.title,
      playerId: params.player.id,
      teamId: params.tournament.teamSize > 1 ? params.team?.id : undefined,
      teamName: params.tournament.teamSize > 1 ? params.team?.name : undefined,
      membersRegistered,
      slotNumber: assignedSlot,
      entryFeePaid: entryFee,
      paymentStatus: entryFee > 0 ? 'SUCCESS' : 'SIMULATED',
      paymentMethod: 'Simulated Wallet',
      registeredAt: new Date().toISOString(),
      status: isWaitlistMode ? 'WAITLISTED' : 'CONFIRMED',
      operationId
    };

    localRegistrationRepository.save(registration);

    // Save to waitlist if waitlisted
    if (isWaitlistMode) {
      const waitlist = this.getWaitlist();
      const currentTournamentWaitlist = waitlist.filter((w) => w.tournamentId === params.tournament.id);
      const position = currentTournamentWaitlist.length + 1;
      
      waitlist.push({
        id: `wl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tournamentId: params.tournament.id,
        playerId: params.player.id,
        teamId: params.team?.id,
        position,
        joinedAt: new Date().toISOString(),
        status: 'WAITING'
      });
      this.saveWaitlist(waitlist);
    }

    // Log Activity
    this.logActivity(regId, 'CREATED', `Registration created for "${params.tournament.title}".`);
    if (entryFee > 0) {
      this.logActivity(regId, 'PAID', `Simulated payment of ₹${entryFee} processed.`);
    }
    if (assignedSlot && !isWaitlistMode) {
      this.logActivity(regId, 'SLOT_ASSIGNED', `Assigned Slot #${assignedSlot} successfully.`);
    } else if (isWaitlistMode) {
      this.logActivity(regId, 'WAITLISTED', 'Tournament occupied. Placed in waitlist queue.');
    }

    // Update participants count on the tournament
    if (!isWaitlistMode) {
      const newCount = params.tournament.registeredParticipants + 1;
      let newStatus = params.tournament.status;
      if (newCount >= params.tournament.maxParticipants) {
        newStatus = 'Registration Closed';
      } else if (newCount >= params.tournament.maxParticipants * 0.8) {
        newStatus = 'Filling Fast';
      }
      
      localTournamentRepository.save({
        ...params.tournament,
        registeredParticipants: newCount,
        status: newStatus
      });
    }

    // Send notifications to all registered players
    membersRegistered.forEach((m) => {
      notificationService.sendNotification(
        m.playerId,
        'REGISTRATION_CONFIRMED',
        'Slot Secured Successfully!',
        isWaitlistMode
          ? `You have joined the waitlist queue for "${params.tournament.title}".`
          : `Roster slot secured for "${params.tournament.title}". Assigned slot number: Slot #${assignedSlot}.`
      );
    });

    return { success: true, registration };
  }

  // --- CANCELLATION & REFUNDS SYSTEM ---

  calculateRefund(registration: Registration, tournament: Tournament): RefundCalculation {
    const originalFee = registration.entryFeePaid;
    const policy = tournament.refundPolicy || 'FULL_REFUND';
    const now = new Date();

    if (originalFee === 0) {
      return { originalFee: 0, refundAmount: 0, refundPercentage: 0, cancellationFee: 0, eligible: false };
    }

    if (policy === 'NO_REFUND') {
      return { originalFee, refundAmount: 0, refundPercentage: 0, cancellationFee: originalFee, eligible: false };
    }

    const cancelDeadline = tournament.cancellationDeadline ? new Date(tournament.cancellationDeadline) : new Date(tournament.matchStart);

    if (policy === 'REFUND_BEFORE_DEADLINE' && now > cancelDeadline) {
      return { originalFee, refundAmount: 0, refundPercentage: 0, cancellationFee: originalFee, eligible: false };
    }

    const refundPercent = tournament.refundPercentage !== undefined ? tournament.refundPercentage : 100;
    const cancelFee = tournament.cancellationFee !== undefined ? tournament.cancellationFee : 0;

    const refundAmount = Math.max(0, Math.floor((originalFee * refundPercent) / 100) - cancelFee);

    return {
      originalFee,
      refundAmount,
      refundPercentage: refundPercent,
      cancellationFee: cancelFee,
      eligible: refundAmount > 0
    };
  }

  cancelRegistration(registrationId: string, reason: string): { success: boolean; error?: string } {
    const reg = localRegistrationRepository.getById(registrationId);
    if (!reg) return { success: false, error: 'Registration record not found.' };

    const wasWaitlisted = reg.status === 'WAITLISTED';

    if (reg.status === 'CANCELLED' || reg.status === 'REFUNDED') {
      return { success: false, error: 'This registration has already been cancelled.' };
    }

    const tournament = localTournamentRepository.getById(reg.tournamentId);
    if (!tournament) return { success: false, error: 'Tournament record not found.' };

    // Release slot (if allocated)
    if (reg.slotNumber) {
      this.releaseSlot(reg.tournamentId, reg.slotNumber);
    }

    // Process simulated refund
    const refundCalc = this.calculateRefund(reg, tournament);
    let refundIssued = false;

    if (refundCalc.eligible && refundCalc.refundAmount > 0) {
      const res = walletService.creditRefund(
        refundCalc.refundAmount,
        `Demo Refund: Cancelled "${tournament.title}" (Reg ID: ${reg.id})`
      );
      refundIssued = res.success;
    }

    // Update status
    reg.status = refundCalc.eligible ? 'REFUNDED' : 'CANCELLED';
    reg.paymentStatus = refundCalc.eligible ? 'REFUNDED' : 'CANCELLED';
    reg.refundAmount = refundCalc.refundAmount;
    reg.cancelledAt = new Date().toISOString();
    reg.cancellationReason = reason;

    localRegistrationRepository.save(reg);

    // Update activity timeline
    this.logActivity(reg.id, 'CANCELLED', `Registration cancelled. Reason: ${reason}`);
    if (refundIssued) {
      this.logActivity(reg.id, 'REFUNDED', `Simulated refund of ₹${refundCalc.refundAmount} credited.`);
    }

    // Update tournament participants count
    if (!wasWaitlisted) {
      const newCount = Math.max(0, tournament.registeredParticipants - 1);
      let newStatus = tournament.status;
      if (newCount < tournament.maxParticipants) {
        newStatus = 'Registration Open';
      }
      localTournamentRepository.save({
        ...tournament,
        registeredParticipants: newCount,
        status: newStatus
      });
    }

    // Remove from waitlist if present
    if (wasWaitlisted) {
      let waitlist = this.getWaitlist();
      waitlist = waitlist.filter((w) => w.playerId !== reg.playerId || w.tournamentId !== reg.tournamentId);
      this.saveWaitlist(waitlist);
    }

    // Send notifications to all registered roster players
    reg.membersRegistered.forEach((m) => {
      notificationService.sendNotification(
        m.playerId,
        'REFUND_CREDITED',
        'Registration Cancelled',
        refundCalc.eligible
          ? `Your registration for "${tournament.title}" has been cancelled. A demo refund of ₹${refundCalc.refundAmount} was credited.`
          : `Your registration for "${tournament.title}" has been cancelled. No refund was eligible.`
      );
    });

    return { success: true };
  }

  // --- DEMO / DEV CONTROLS TRIGGERS ---

  promoteWaitlistEntry(tournamentId: string): { success: boolean; error?: string; registration?: Registration } {
    const waitlist = this.getWaitlist(tournamentId);
    const waiting = waitlist.find((w) => w.status === 'WAITING');
    if (!waiting) return { success: false, error: 'No waiting participants found in waitlist.' };

    const tournament = localTournamentRepository.getById(tournamentId);
    if (!tournament) return { success: false, error: 'Tournament not found.' };

    const regs = localRegistrationRepository.getByTournamentId(tournamentId);
    const reg = regs.find((r) => r.playerId === waiting.playerId && r.status === 'WAITLISTED');
    if (!reg) return { success: false, error: 'Waitlist registration draft not found.' };

    // Assign slot
    const autoSlotNum = this.autoAssignSlot(
      tournamentId,
      reg.id,
      waiting.teamId || waiting.playerId,
      reg.teamName || waiting.playerId
    );
    if (autoSlotNum === null) {
      return { success: false, error: 'No vacant slots available. Clear some slots first.' };
    }

    // Promote
    reg.status = 'CONFIRMED';
    reg.slotNumber = autoSlotNum;
    localRegistrationRepository.save(reg);

    // Update waitlist entry
    const allWaitlist = this.getWaitlist();
    const idx = allWaitlist.findIndex((w) => w.id === waiting.id);
    if (idx > -1) {
      allWaitlist[idx].status = 'PROMOTED';
      this.saveWaitlist(allWaitlist);
    }

    // Update count
    const newCount = tournament.registeredParticipants + 1;
    localTournamentRepository.save({
      ...tournament,
      registeredParticipants: newCount
    });

    this.logActivity(reg.id, 'SLOT_ASSIGNED', `Promoted from Waitlist. Assigned Slot #${autoSlotNum}.`);

    // Notify
    reg.membersRegistered.forEach((m) => {
      notificationService.sendNotification(
        m.playerId,
        'REGISTRATION_CONFIRMED',
        'Promoted to Confirmed Slot!',
        `Your waitlist registration for "${tournament.title}" has been promoted to a confirmed slot (Slot #${autoSlotNum}).`
      );
    });

    return { success: true, registration: reg };
  }

  fillTournamentSlots(tournamentId: string): void {
    const tournament = localTournamentRepository.getById(tournamentId);
    if (!tournament) return;

    this.generateSlots(tournament);
    const slots = localTournamentSlotRepository.getByTournamentId(tournamentId);
    
    slots.forEach((s) => {
      if (s.status === 'AVAILABLE') {
        s.status = 'OCCUPIED';
        s.participantName = 'Simulated Opponent';
        s.teamName = 'Simulated Opponent';
        s.confirmedAt = new Date().toISOString();
        localTournamentSlotRepository.save(s);
      }
    });

    tournament.registeredParticipants = tournament.maxParticipants;
    tournament.status = 'Registration Closed';
    localTournamentRepository.save(tournament);
  }

  clearTournamentSlots(tournamentId: string): void {
    const tournament = localTournamentRepository.getById(tournamentId);
    if (!tournament) return;

    localTournamentSlotRepository.reset(tournamentId);
    this.generateSlots(tournament);

    tournament.registeredParticipants = 0;
    tournament.status = 'Registration Open';
    localTournamentRepository.save(tournament);
  }

  // --- REPOSITORY LAYER ALIAS ACCESSORS ---

  getAll(): Registration[] {
    return localRegistrationRepository.getAll();
  }

  getByTournamentId(tournamentId: string): Registration[] {
    return localRegistrationRepository.getByTournamentId(tournamentId);
  }

  getByPlayerId(playerId: string): Registration[] {
    return localRegistrationRepository.getByPlayerId(playerId);
  }

  getById(id: string): Registration | null {
    return localRegistrationRepository.getById(id);
  }

  processCancellationRefunds(tournamentId: string): void {
    const list = this.getAll().filter((r) => r.tournamentId === tournamentId && r.status !== 'CANCELLED' && r.status !== 'REFUNDED');
    list.forEach((reg) => {
      this.cancelRegistration(reg.id, 'Tournament Cancelled');
    });
  }
}

export const registrationService = new RegistrationService();
export default registrationService;
