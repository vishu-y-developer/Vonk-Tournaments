export type TournamentMode =
  | 'Solo'
  | 'Duo'
  | 'Squad'
  | 'TDM 1v1'
  | 'TDM 2v2'
  | 'TDM 4v4'
  | 'Clan Battle'
  | 'Custom Room'
  | 'Sniper Only'
  | 'Pistol Only'
  | 'Melee Only'
  | 'College Tournament'
  | 'Invitational'
  | 'Practice Scrim'
  | 'Championship';

export type TournamentLevel =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Pro'
  | 'Invitational'
  | 'Championship';

export type PlayerLevel =
  | 'Beginner'
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Crown'
  | 'Ace'
  | 'Conqueror';

export type TournamentStatus =
  | 'Draft'
  | 'Upcoming'
  | 'Registration Open'
  | 'Filling Fast'
  | 'Registration Closed'
  | 'Room Released'
  | 'Live'
  | 'Result Pending'
  | 'Completed'
  | 'Cancelled'
  | 'Refunded'
  | 'DRAFT'
  | 'SCHEDULED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'LIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'POSTPONED'
  | 'ARCHIVED';

export type TournamentVisibility = 'Public' | 'Private' | 'Invite Only';

export type PrizePoolType = 'FIXED' | 'DYNAMIC';

export interface PrizeDistribution {
  placePercentages: { [place: number]: number };
  perKillReward?: number;
  mvpReward?: number;
  mostKillsReward?: number;
  bestSquadReward?: number;
  participationReward?: number;
}

export interface ScoringSystem {
  pointsPerKill: number;
  placementPoints: { [placement: number]: number };
  bonusPoints?: number;
  penaltyPoints?: number;
}

export interface Tournament {
  id: string;
  title: string;
  slug: string;
  banner: string;
  description: string;
  game: string;
  mode: TournamentMode;
  map: string;
  perspective: 'TPP' | 'FPP';
  level: TournamentLevel;
  entryFee: number;
  prizePool: number;
  prizePoolType: PrizePoolType;
  platformFeePercentage: number;
  perKillReward: number;
  maxParticipants: number;
  registeredParticipants: number;
  teamSize: number;
  substituteLimit: number;
  registrationStart: string;
  registrationEnd: string;
  matchStart: string;
  roomReleaseTime: string;
  status: TournamentStatus;
  visibility: TournamentVisibility;
  organizer: string;
  rules: string[];
  scoringSystem: ScoringSystem;
  prizeDistribution: PrizeDistribution;
  tags: string[];
  featured: boolean;
  roomDetails?: {
    roomId: string;
    roomPassword?: string;
  };
  registrationFormat?: RegistrationFormat;
  minimumPlayers?: number;
  maximumPlayers?: number;
  captainOnlyRegistration?: boolean;
  manualSlotSelection?: boolean;
  maximumSlots?: number;
  registrationOpenAt?: string;
  registrationCloseAt?: string;
  matchDate?: string;
  region?: string;
  skillRequirement?: string;
  levelRequirement?: number;
  refundPolicy?: RefundPolicy;
  cancellationDeadline?: string;
  refundPercentage?: number;
  cancellationFee?: number;
  waitlistEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'Guest' | 'Player' | 'Organizer' | 'Admin';

// --- PHASE 3: PLAYER TYPES ---

export interface SocialLinks {
  instagram?: string;
  youtube?: string;
  discord?: string;
  x?: string;
  facebook?: string;
  website?: string;
}

export interface ProfileSettings {
  notifications: {
    tournamentUpdates: boolean;
    registrationConfirmed: boolean;
    prizeReceived: boolean;
    refund: boolean;
    organizerAnnouncement: boolean;
    systemUpdate: boolean;
  };
  privacy: {
    showStats: boolean;
    showMatchHistory: boolean;
    showSocialLinks: boolean;
  };
  themePreference: 'dark' | 'light' | 'amoled';
}

export interface PlayerRank {
  currentRank: PlayerLevel;
  previousRank: PlayerLevel;
  highestRank: PlayerLevel;
  rankChange: 'UP' | 'DOWN' | 'STABLE';
  leaderboardPosition: number;
}

export interface PlayerStatistics {
  matchesPlayed: number;
  wins: number;
  top3Finishes: number;
  top10Finishes: number;
  totalKills: number;
  totalDamage: number;
  kdRatio: number;
  avgPlacement: number;
  winRate: number;
  headshots: number;
  mvpAwards: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
  totalPrizeWon: number;
  favoriteMode: TournamentMode;
  favoriteMap: string;
}

export interface Achievement {
  id: string;
  badge: string; // Emoji
  title: string;
  description: string;
  unlockedDate?: string;
  progress: number; // percentage (0-100)
}

export type BadgeType =
  | 'Verified'
  | 'Organizer'
  | 'Champion'
  | 'Elite'
  | 'Top Killer'
  | 'MVP'
  | 'Season Winner'
  | 'Beta User'
  | 'Premium'
  | 'Founder';

export interface MatchHistory {
  id: string;
  tournamentId: string;
  tournamentName: string;
  tournamentSlug: string;
  date: string;
  mode: TournamentMode;
  map: string;
  kills: number;
  placement: number;
  points: number;
  prizeWon: number;
  status: 'Win' | 'Loss' | 'Disqualified';
}

export interface Player {
  id: string;
  username: string;
  inGameName: string;
  characterId: string;
  level: PlayerLevel; // current player level (Progressive XP)
  walletBalance: number; // simulated cash
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  country: string;
  state: string;
  preferredLanguage: string;
  dateJoined: string;
  onlineStatus: 'Online' | 'Offline' | 'In Match';
  rank: PlayerRank;
  stats: PlayerStatistics;
  achievements: Achievement[];
  badges: BadgeType[];
  socialLinks: SocialLinks;
  settings: ProfileSettings;
}

// --- PREVIOUS ROOT INTERFACES RE-ADAPTED ---

export type TeamType = 'Duo' | 'Squad' | 'TDM 2v2' | 'TDM 4v4' | 'Clan' | 'Temporary';
export type TeamReadinessStatus = 'Incomplete' | 'Almost Ready' | 'Tournament Ready' | 'Locked';

export type TeamRole =
  | 'Captain'
  | 'Co-Captain'
  | 'Assaulter'
  | 'Sniper'
  | 'Support'
  | 'IGL'
  | 'Entry Fragger'
  | 'Scout'
  | 'Substitute'
  | 'Member';

export interface TeamMember {
  playerId: string;
  inGameName: string;
  characterId: string;
  role: TeamRole;
  joinedAt: string;
}

export interface TeamPrivacySettings {
  publicTeam: boolean;
  showStats: boolean;
  allowJoinRequests: boolean;
  inviteOnly: boolean;
  showHistory: boolean;
  showCharacterIds: boolean;
  showOnlineStatus: boolean;
}

export interface TeamActivity {
  id: string;
  type: 'MemberJoined' | 'MemberLeft' | 'CaptaincyTransferred' | 'ProfileUpdated' | 'RosterLocked' | 'RosterUnlocked';
  description: string;
  timestamp: string;
}

export interface TeamStats {
  matches: number;
  wins: number;
  kills: number;
  podiums?: number;
  kdRatio?: number;
  avgPlacement?: number;
  prizeWon?: number;
  streak?: number;
}

export interface TeamAchievement {
  id: string;
  title: string;
  description: string;
  unlockedDate?: string;
  progress: number;
  badge: string;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  playerId: string;
  playerName: string;
  role: TeamRole;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Expired';
  createdAt: string;
}

export interface TeamJoinRequest {
  id: string;
  teamId: string;
  playerId: string;
  playerName: string;
  playerLevel: PlayerLevel;
  preferredRole: TeamRole;
  statsPreview: {
    matchesPlayed: number;
    kdRatio: number;
    winRate: number;
  };
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  type: TeamType;
  bio: string;
  preferredMode: TournamentMode;
  preferredMap: string;
  skillLevel: string;
  region: string;
  language: string;
  logoUrl: string;
  bannerUrl: string;
  colorTheme: string;
  tag: string;
  motto: string;
  code: string;
  captainId: string;
  members: TeamMember[];
  stats: TeamStats;
  privacySettings: TeamPrivacySettings;
  readinessStatus: TeamReadinessStatus;
  activities: TeamActivity[];
  achievements: TeamAchievement[];
  tournamentHistory: {
    tournamentId: string;
    tournamentTitle: string;
    placement?: number;
    points?: number;
    winnings?: number;
    date: string;
  }[];
}

export type PaymentStatus =
  | 'PENDING'
  | 'SIMULATED'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export type PaymentMethodType = 'Simulated Wallet' | 'Promo Code' | 'Bonus Credit';

export interface Registration {
  id: string;
  tournamentId: string;
  tournamentTitle?: string;
  playerId: string;
  teamId?: string;
  teamName?: string;
  membersRegistered: {
    playerId: string;
    inGameName: string;
    characterId: string;
    role?: string;
  }[];
  slotNumber?: number;
  entryFeePaid: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethodType;
  registeredAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'DRAFT' | 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED' | 'COMPLETED' | 'DISQUALIFIED';
  operationId?: string;
  refundAmount?: number;
  cancelledAt?: string;
  cancellationReason?: string;
}

export type WalletTransactionType =
  | 'DEMO_CREDIT'
  | 'ENTRY_FEE'
  | 'PRIZE_WINNING'
  | 'REFUND'
  | 'BONUS'
  | 'PROMOTIONAL_CREDIT'
  | 'PENALTY'
  | 'ADJUSTMENT';

export type WalletTransactionDirection = 'CREDIT' | 'DEBIT';

export type WalletTransactionStatus =
  | 'PENDING'
  | 'SIMULATED'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface WalletTransaction {
  id: string;
  playerId: string;
  type: WalletTransactionType;
  direction: WalletTransactionDirection;
  amount: number;
  title: string;
  description: string;
  status: WalletTransactionStatus;
  balanceBefore: number;
  balanceAfter: number;
  tournamentId?: string;
  tournamentName?: string;
  referenceId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
  isDemo: boolean;
}

export interface Wallet {
  playerId: string;
  balance: number;
  totalAdded: number;
  totalFeesPaid: number;
  totalPrizesWon: number;
  totalRefunds: number;
  totalBonuses: number;
  updatedAt: string;
}

export interface WalletSummary {
  creditsThisMonth: number;
  debitsThisMonth: number;
  netChange: number;
  mostFrequentType: WalletTransactionType | 'None';
  recentTransactions: WalletTransaction[];
}

export interface WalletFilter {
  type: 'ALL' | WalletTransactionType;
  direction: 'ALL' | WalletTransactionDirection;
  status: 'ALL' | WalletTransactionStatus;
  dateRange: 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'ALL_TIME' | 'CUSTOM';
  customStartDate?: string;
  customEndDate?: string;
  amountRange: 'ALL' | '0_100' | '101_500' | '501_1000' | '1001_5000' | '5000_PLUS';
  searchQuery: string;
  sortBy: 'NEWEST' | 'OLDEST' | 'HIGHEST_AMOUNT' | 'LOWEST_AMOUNT';
}

export type BonusStatus = 'AVAILABLE' | 'CLAIMED' | 'EXPIRED';

export interface DemoBonus {
  id: string;
  name: string;
  description: string;
  amount: number;
  status: BonusStatus;
  code: string;
  expiryDate?: string;
  claimedAt?: string;
}

export type PrizeCategory =
  | 'Winner Prize'
  | 'Runner-up Prize'
  | 'Third Place Prize'
  | 'Per-Kill Reward'
  | 'MVP Reward'
  | 'Most Kills Reward'
  | 'Participation Reward'
  | 'Organizer Bonus';

export interface PrizeCredit {
  id: string;
  tournamentId: string;
  tournamentName: string;
  tournamentBannerPlaceholder?: string;
  placement?: number;
  amount: number;
  category: PrizeCategory;
  createdAt: string;
  status: WalletTransactionStatus;
}

export type RefundReason =
  | 'Tournament Cancelled'
  | 'Registration Rejected'
  | 'Duplicate Registration'
  | 'Organizer Cancellation'
  | 'Technical Issue'
  | 'Admin Adjustment';

export interface RefundTransaction {
  id: string;
  tournamentId: string;
  tournamentName: string;
  originalEntryFee: number;
  amount: number;
  reason: RefundReason;
  status: WalletTransactionStatus;
  requestedAt: string;
  processedAt?: string;
  referenceId: string;
}

export interface BalanceValidationResult {
  sufficient: boolean;
  shortage: number;
  message: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  roomIdReleased: boolean;
  startTime: string;
}

export interface TeamMatchResult {
  teamId?: string;
  teamName: string;
  placement: number;
  kills: number;
  placementPoints: number;
  killPoints: number;
  bonusPoints: number;
  penaltyPoints: number;
  totalPoints: number;
  mvpPlayerId?: string;
  mvpPlayerName?: string;
}

export interface MatchResult {
  id: string;
  tournamentId: string;
  results?: TeamMatchResult[];
  publishedAt: string;
  payoutStatus?: 'PENDING' | 'COMPLETED';
  
  // Phase 8 properties
  matchId?: string;
  roundId?: string;
  registrationId?: string;
  participantId?: string;
  teamId?: string;
  participantName?: string;
  teamName?: string;
  placement?: number;
  kills?: number;
  assists?: number;
  damage?: number;
  survivalTime?: number;
  placementPoints?: number;
  killPoints?: number;
  assistPoints?: number;
  bonusPoints?: number;
  penaltyPoints?: number;
  totalPoints?: number;
  status?: ResultStatus;
  notes?: string;
  submittedAt?: string;
  reviewedAt?: string;
  correctedAt?: string;
  isDemo?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  matchesPlayed: number;
  placementPoints: number;
  killPoints: number;
  bonusPoints: number;
  penaltyPoints: number;
  totalPoints: number;
  winnings: number;
  rankMovement: 'UP' | 'DOWN' | 'STABLE';
}

export type DisputeStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Evidence Required'
  | 'Resolved'
  | 'Rejected';

export interface Dispute {
  id: string;
  playerId: string;
  playerName: string;
  tournamentId: string;
  tournamentTitle: string;
  type: 'Score Incorrect' | 'Hacking/Cheating' | 'Teaming' | 'Rule Violation' | 'Other';
  description: string;
  screenshotUrl: string;
  status: DisputeStatus;
  organizerResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  playerId: string;
  type:
    | 'REGISTRATION_CONFIRMED'
    | 'REGISTRATION_REJECTED'
    | 'MATCH_STARTING'
    | 'ROOM_RELEASED'
    | 'RESULT_PUBLISHED'
    | 'PRIZE_CREDITED'
    | 'REFUND_CREDITED'
    | 'TEAM_INVITE'
    | 'TOURNAMENT_CANCELLED'
    | 'DISPUTE_UPDATED';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Organizer {
  id: string;
  name: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  tournamentsCount: number;
  joinedAt: string;
}

export interface AdminAnalytics {
  totalMockUsers: number;
  totalTournaments: number;
  totalRegistrations: number;
  mockRevenue: number;
  mockPrizePayouts: number;
  activeDisputes: number;
  bannedPlayersCount: number;
}

// --- PHASE 6: REGISTRATION & SLOT BOOKING TYPES ---

export type RegistrationStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'CONFIRMED'
  | 'WAITLISTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'COMPLETED'
  | 'DISQUALIFIED';

export type RegistrationFormat =
  | 'Solo'
  | 'Duo'
  | 'Squad'
  | 'Squad with Substitute'
  | 'TDM 2v2'
  | 'TDM 4v4';

export interface RegistrationParticipant {
  playerId: string;
  inGameName: string;
  characterId: string;
  role?: string;
  level?: number;
}

export interface RegistrationRosterMember {
  playerId: string;
  inGameName: string;
  characterId: string;
  role: string;
}

export interface RegistrationValidationIssue {
  code: string;
  title: string;
  message: string;
  severity: 'WARNING' | 'CRITICAL';
  blocking: boolean;
  suggestedAction: string;
}

export interface RegistrationEligibility {
  allowed: boolean;
  issues: RegistrationValidationIssue[];
  checkedAt: string;
}

export interface RegistrationConsent {
  rulesReviewed: boolean;
  infoCorrect: boolean;
  isDemoUnderstood: boolean;
  refundPolicyAccepted: boolean;
}

export type TournamentSlotStatus =
  | 'AVAILABLE'
  | 'SELECTED'
  | 'RESERVED'
  | 'OCCUPIED'
  | 'UNAVAILABLE';

export interface TournamentSlot {
  id: string;
  tournamentId: string;
  slotNumber: number;
  status: TournamentSlotStatus;
  registrationId?: string;
  participantId?: string; // playerId or teamId
  participantName?: string;
  teamId?: string;
  teamName?: string;
  reservedAt?: string;
  confirmedAt?: string;
}

export interface RegistrationOperation {
  operationId: string;
  tournamentId: string;
  playerId: string;
  teamId?: string;
  slotNumber?: number;
  entryFee: number;
  status: 'PENDING' | 'COMPLETED' | 'ROLLED_BACK';
  createdAt: string;
}

export interface RegistrationActivity {
  id: string;
  registrationId: string;
  type: 'CREATED' | 'PAID' | 'SLOT_ASSIGNED' | 'WAITLISTED' | 'CANCELLED' | 'REFUNDED' | 'COMPLETED';
  description: string;
  timestamp: string;
}

export interface CancellationRequest {
  registrationId: string;
  reason: string;
  customReason?: string;
  requestedAt: string;
}

export type RefundPolicy =
  | 'FULL_REFUND'
  | 'PARTIAL_REFUND'
  | 'NO_REFUND'
  | 'REFUND_BEFORE_DEADLINE'
  | 'ORGANIZER_CANCELLATION_ONLY';

export interface RefundCalculation {
  originalFee: number;
  refundAmount: number;
  refundPercentage: number;
  cancellationFee: number;
  eligible: boolean;
}

export interface WaitlistEntry {
  id: string;
  tournamentId: string;
  playerId: string;
  teamId?: string;
  position: number;
  joinedAt: string;
  status: 'WAITING' | 'PROMOTED' | 'CANCELLED';
}

export interface RegistrationSummary {
  totalCount: number;
  confirmedCount: number;
  waitlistedCount: number;
  cancelledCount: number;
  totalFeesPaid: number;
}

export type TournamentRegistration = Registration;

// --- PHASE 8: RESULTS, SCORING & LEADERBOARDS TYPES ---

export type ResultStatus = 
  | 'NOT_STARTED' 
  | 'RESULT_PENDING' 
  | 'DRAFT' 
  | 'UNDER_REVIEW' 
  | 'PUBLISHED' 
  | 'CORRECTED' 
  | 'DISPUTED' 
  | 'FINAL' 
  | 'CANCELLED';

export interface ScoringConfiguration {
  id: string;
  name: string;
  description: string;
  mode: TournamentMode;
  placementPoints: { [placement: number]: number };
  pointsPerKill: number;
  assistPoints?: number;
  winBonus?: number;
  penaltyRules?: string;
  tieBreakerRules?: string[];
  maximumRounds: number;
  dropLowestRound: boolean;
  isDemo: boolean;
}

export interface PlacementPointRule {
  placement: number;
  points: number;
}

export type TieBreakerRule = 
  | 'TOTAL_POINTS' 
  | 'PLACEMENT_POINTS' 
  | 'KILLS' 
  | 'BEST_SINGLE_PLACEMENT' 
  | 'MOST_RECENT_PLACEMENT' 
  | 'HEAD_TO_HEAD' 
  | 'ALPHABETICAL';

export interface TournamentStanding {
  tournamentId: string;
  participantId: string;
  teamId?: string;
  rank: number;
  previousRank?: number;
  rankChange: number;
  matchesPlayed: number;
  totalKills: number;
  totalPlacementPoints: number;
  totalKillPoints: number;
  totalBonusPoints: number;
  totalPenaltyPoints: number;
  totalPoints: number;
  averagePlacement: number;
  bestPlacement: number;
  wins: number;
  podiumFinishes: number;
  lastMatchPlacement?: number;
  qualificationStatus: QualificationStatus;
  updatedAt: string;
  isDemo: boolean;
}

export type QualificationStatus = 
  | 'QUALIFIED' 
  | 'ELIMINATED' 
  | 'ADVANCING' 
  | 'ON_BUBBLE' 
  | 'PENDING' 
  | 'WINNER' 
  | 'RUNNER_UP' 
  | 'THIRD_PLACE';

export type PenaltyType = 
  | 'LATE_CHECK_IN' 
  | 'WRONG_SLOT' 
  | 'UNREGISTERED_PLAYER' 
  | 'RULE_VIOLATION' 
  | 'UNSPORTSMANLIKE_CONDUCT' 
  | 'INVALID_IGN' 
  | 'ORGANIZER_ADJUSTMENT' 
  | 'ADMIN_ADJUSTMENT';

export type PenaltyStatus = 
  | 'APPLIED' 
  | 'UNDER_REVIEW' 
  | 'REVERSED' 
  | 'FINAL';

export interface ResultPenalty {
  id: string;
  resultId: string;
  type: PenaltyType;
  points: number;
  reason: string;
  issuedAt: string;
  issuedBy: string;
  appealable: boolean;
  status: PenaltyStatus;
  isDemo: boolean;
}

export type BonusType = 
  | 'WIN_BONUS' 
  | 'MVP_BONUS' 
  | 'MOST_KILLS_BONUS' 
  | 'OBJECTIVE_BONUS' 
  | 'CLEAN_PLAY_BONUS' 
  | 'ORGANIZER_BONUS';

export interface ResultBonus {
  id: string;
  resultId: string;
  type: BonusType;
  points: number;
  reason: string;
  issuedAt: string;
  isDemo: boolean;
}

export type MVPCategory = 
  | 'Match MVP' 
  | 'Round MVP' 
  | 'Tournament MVP' 
  | 'Top Fragger' 
  | 'Best Placement Player' 
  | 'Most Consistent Player' 
  | 'Best Support' 
  | 'Best IGL Placeholder';

export interface MVPRecord {
  id: string;
  tournamentId: string;
  matchId?: string;
  participantId: string;
  teamId?: string;
  category: MVPCategory;
  score: number;
  reason: string;
  statsSnapshot: {
    kills: number;
    assists?: number;
    damage?: number;
    survivalTime?: number;
  };
  awardedAt: string;
  isDemo: boolean;
}

export type ResultDisputeStatus = 
  | 'OPEN' 
  | 'UNDER_REVIEW' 
  | 'RESOLVED' 
  | 'REJECTED' 
  | 'WITHDRAWN';

export interface ResultDispute {
  id: string;
  resultId: string;
  tournamentId: string;
  matchId: string;
  registrationId: string;
  submittedBy: string;
  reason: string;
  description: string;
  status: ResultDisputeStatus;
  submittedAt: string;
  resolvedAt?: string;
  resolution?: string;
  isDemo: boolean;
}

export interface ResultRevision {
  id: string;
  resultId: string;
  previousValues: {
    placement: number;
    kills: number;
    placementPoints: number;
    killPoints: number;
    totalPoints: number;
  };
  newValues: {
    placement: number;
    kills: number;
    placementPoints: number;
    killPoints: number;
    totalPoints: number;
  };
  reason: string;
  correctedAt: string;
  correctedBy: string;
  revisionNumber: number;
}

export interface RoundStanding {
  roundId: string;
  roundName: string;
  standings: TournamentStanding[];
}

export interface ParticipantContribution {
  playerId: string;
  inGameName: string;
  kills: number;
  assists: number;
  damage: number;
  survivalTime: number;
  revives: number;
  contributionPercentage: number;
}

export interface PrizeEligibility {
  eligibleRank: number;
  prizeAmount: number;
  prizeCategory: PrizeCategory;
  prizeStatus: 'NOT_ELIGIBLE' | 'ELIGIBLE' | 'PENDING_REVIEW' | 'APPROVED' | 'CREDITED';
}

// --- PHASE 9: ORGANIZER DASHBOARD & TOURNAMENT MANAGEMENT TYPES ---

export type OrganizerRole = 'PLAYER' | 'ORGANIZER';

export interface OrganizerProfile {
  id: string;
  name: string;
  organizationName: string;
  displayName: string;
  logoUrl?: string;
  bio: string;
  region: string;
  languages: string[];
  contactEmail: string;
  socialLinks?: SocialLinks;
  establishedYear: number;
  tournamentsHosted: number;
  isVerified: boolean;
}

export type OrganizerPermission =
  | 'CREATE_TOURNAMENT'
  | 'EDIT_TOURNAMENT'
  | 'MANAGE_REGISTRATIONS'
  | 'SCHEDULE_MATCH'
  | 'PUBLISH_RESULTS'
  | 'VIEW_ANALYTICS'
  | 'EDIT_SETTINGS';

export interface OrganizerSummary {
  totalTournaments: number;
  draftTournaments: number;
  publishedTournaments: number;
  liveTournaments: number;
  completedTournaments: number;
  totalRegistrations: number;
  pendingApprovals: number;
  upcomingMatches: number;
  resultsPendingReview: number;
  openDisputes: number;
  demoPrizeObligations: number;
}

export interface OrganizerSettings {
  organizerId: string;
  defaultFormat: RegistrationFormat;
  defaultScoringTemplate: string;
  defaultRefundPolicy: RefundPolicy;
  defaultTimezone: string;
  defaultAnnouncementPrefs: {
    email: boolean;
    push: boolean;
  };
  demoControlsVisible: boolean;
  tableViewPreference: 'table' | 'cards';
  requireConfirmations: boolean;
}

export type OrganizerTournamentAction =
  | 'VIEW'
  | 'EDIT'
  | 'DUPLICATE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'POSTPONE'
  | 'CANCEL'
  | 'ARCHIVE';

export type TournamentStatusTransition = {
  from: TournamentStatus;
  to: TournamentStatus;
  allowed: boolean;
};

export type RegistrationApprovalStatus =
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'WAITLISTED'
  | 'CANCELLED';

export type RegistrationRejectionReason =
  | 'INCOMPLETE_PROFILE'
  | 'INVALID_TEAM_ROSTER'
  | 'DUPLICATE_REGISTRATION'
  | 'ELIGIBILITY_REQUIREMENT_NOT_MET'
  | 'INVALID_GAME_ID'
  | 'TOURNAMENT_FULL'
  | 'RULE_VIOLATION'
  | 'ORGANIZER_DECISION'
  | 'OTHER';

export interface OrganizerAnnouncement {
  id: string;
  tournamentId: string;
  matchId?: string;
  roundId?: string;
  title: string;
  content: string;
  type: 'GENERAL' | 'SCHEDULE_CHANGE' | 'CHECK_IN' | 'ROOM_UPDATE' | 'MAP_UPDATE' | 'RULE_UPDATE' | 'RESULT_UPDATE' | 'DELAY' | 'CANCELLATION' | 'URGENT';
  targetAudience: 'ALL' | 'REGISTERED' | 'WAITLISTED';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  createdAt: string;
  isDemo: boolean;
}

export type OrganizerActivityType =
  | 'TOURNAMENT_CREATED'
  | 'TOURNAMENT_EDITED'
  | 'TOURNAMENT_PUBLISHED'
  | 'TOURNAMENT_POSTPONED'
  | 'TOURNAMENT_CANCELLED'
  | 'REGISTRATION_APPROVED'
  | 'REGISTRATION_REJECTED'
  | 'SLOT_ASSIGNED'
  | 'MATCH_CREATED'
  | 'CREDENTIALS_RELEASED'
  | 'ANNOUNCEMENT_PUBLISHED'
  | 'RESULT_PUBLISHED'
  | 'RESULT_CORRECTED'
  | 'DISPUTE_RESOLVED'
  | 'PRIZE_APPROVED'
  | 'DEMO_PRIZE_CREDITED';

export interface OrganizerActivity {
  id: string;
  organizerId: string;
  tournamentId?: string;
  entityType: 'TOURNAMENT' | 'REGISTRATION' | 'MATCH' | 'RESULT' | 'DISPUTE' | 'ANNOUNCEMENT' | 'PRIZE';
  entityId: string;
  action: OrganizerActivityType;
  title: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
  isDemo: boolean;
}

export type PrizeDistributionStatus =
  | 'NOT_READY'
  | 'CALCULATED'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'CREDITED'
  | 'CANCELLED';

export interface PrizeRecipient {
  participantId: string;
  participantName: string;
  rank: number;
  prizeAmount: number;
  killsCount: number;
  killPointsAmount: number;
  totalPoints: number;
  eligibleCategory: PrizeCategory;
  creditTransactionId?: string;
}

export interface PrizeDistributionRecord {
  id: string;
  tournamentId: string;
  prizePool: number;
  recipients: PrizeRecipient[];
  status: PrizeDistributionStatus;
  allocatedAmount: number;
  unallocatedAmount: number;
  approvedBy?: string;
  approvedAt?: string;
  creditedAt?: string;
  notes?: string;
  isDemo: boolean;
}

export interface OrganizerAnalytics {
  totalTournaments: number;
  registrationsOverTime: { date: string; count: number }[];
  registrationConversion: number; // percentage
  slotUtilization: number; // percentage
  cancellationRate: number; // percentage
  refundTotals: number;
  averageEntryFee: number;
  demoPrizeAllocation: number;
  matchCompletionRate: number;
  resultPublicationRate: number;
  averageKillsPerMatch: number;
  popularFormats: { format: string; count: number }[];
  playerVsTeamMix: { type: 'Solo' | 'Team'; count: number }[];
}

export interface TournamentAnalytics {
  views: number;
  registrations: number;
  approvedRegistrations: number;
  rejectedRegistrations: number;
  waitlistSize: number;
  slotFillPercentage: number;
  teamReadinessRate: number;
  checkInCompletion: number;
  matchCompletion: number;
  resultPublication: number;
  disputeCount: number;
  cancellationCount: number;
  demoEntryFeesCollected: number;
  demoRefunds: number;
  demoPrizesCredited: number;
}

export interface ResultPublicationValidation {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

export interface TournamentChangeRestriction {
  locked: boolean;
  reason: string;
}

// --- PHASE 10: ADMIN DASHBOARD & PLATFORM MANAGEMENT TYPES ---

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface AdminProfile {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  avatarUrl?: string;
  permissions: string[];
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  entityType: 'PLAYER' | 'TEAM' | 'ORGANIZER' | 'TOURNAMENT' | 'REGISTRATION' | 'MATCH' | 'RESULT' | 'WALLET' | 'DISPUTE' | 'REPORT' | 'ANNOUNCEMENT' | 'SETTINGS';
  entityId: string;
  action: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type ReportTargetType = 'PLAYER' | 'TEAM' | 'TOURNAMENT' | 'ORGANIZER' | 'RESULT';
export type ReportReason = 'CHEATING' | 'TOXIC_BEHAVIOR' | 'WRONG_IGN' | 'TEAM_ABUSE' | 'FAKE_REGISTRATION' | 'OFFENSIVE_CONTENT' | 'OTHER';
export type ReportStatus = 'OPEN' | 'REVIEWING' | 'ACTION_TAKEN' | 'CLOSED';

export interface PlatformReport {
  id: string;
  reportedBy: string;
  reportedByName: string;
  targetType: ReportTargetType;
  targetId: string;
  targetName: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
  isDemo: boolean;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  content: string;
  target: 'EVERYONE' | 'PLAYERS' | 'ORGANIZERS';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  createdAt: string;
  isDemo: boolean;
}

export interface PlatformSettings {
  platformName: string;
  theme: string;
  defaultTournamentSettings: {
    defaultMode: TournamentMode;
    defaultMap: string;
    defaultPlatformFee: number;
  };
  demoMode: boolean;
  walletLimits: {
    maxDemoBalance: number;
    maxBonusClaim: number;
  };
  announcementDefaults: {
    autoBroadcast: boolean;
  };
}

export interface PlatformAnalyticsOverview {
  totalPlayers: number;
  totalTeams: number;
  totalOrganizers: number;
  totalTournaments: number;
  activeTournaments: number;
  totalRegistrations: number;
  totalMatches: number;
  totalResults: number;
  pendingDisputes: number;
  totalPrizePayouts: number;
  totalReports: number;
  platformActivityOverTime: { date: string; registrations: number; tournaments: number }[];
}

// --- PHASE 11: NOTIFICATIONS, SUPPORT CENTER, HELP SYSTEM & USER SETTINGS TYPES ---

export type NotificationCategory =
  | 'TOURNAMENT'
  | 'REGISTRATION'
  | 'MATCH'
  | 'RESULT'
  | 'LEADERBOARD'
  | 'TEAM'
  | 'WALLET'
  | 'PRIZE'
  | 'ANNOUNCEMENT'
  | 'SUPPORT'
  | 'SYSTEM'
  | 'SECURITY_DEMO'
  | 'ORGANIZER'
  | 'ADMIN';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED' | 'DELETED';

export interface NotificationItem {
  id: string;
  userId: string;
  role: 'PLAYER' | 'ORGANIZER' | 'ADMIN' | 'GUEST';
  type: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  actionLabel?: string;
  actionHref?: string;
  status: NotificationStatus;
  createdAt: string;
  readAt?: string;
  archivedAt?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
  eventKey?: string;
  isDemo: boolean;
}

export interface NotificationPreference {
  categories: Record<NotificationCategory, boolean>;
  delivery: {
    inApp: boolean;
    demoEmail: boolean;
    demoSms: boolean;
    demoPush: boolean;
  };
}

export interface NotificationReminderPreference {
  matchReminderHoursBefore: number;
  checkInReminderMinutesBefore: number;
  registrationClosingReminderHoursBefore: number;
  roomCredentialsReminderMinutesBefore: number;
}

export type SupportTicketCategory =
  | 'GENERAL_HELP'
  | 'TOURNAMENT_ISSUE'
  | 'REGISTRATION_ISSUE'
  | 'TEAM_ISSUE'
  | 'MATCH_ISSUE'
  | 'ROOM_CREDENTIAL_ISSUE'
  | 'RESULT_DISPUTE_HELP'
  | 'WALLET_DEMO_ISSUE'
  | 'PRIZE_DEMO_ISSUE'
  | 'ORGANIZER_ISSUE'
  | 'ADMIN_ISSUE'
  | 'TECHNICAL_ISSUE'
  | 'ACCOUNT_DATA_ISSUE'
  | 'REPORT_ABUSE'
  | 'OTHER';

export type SupportTicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_USER'
  | 'WAITING_FOR_SUPPORT'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED';

export type SupportTicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type SupportAuthorType = 'USER' | 'SUPPORT_DEMO' | 'ORGANIZER_DEMO' | 'ADMIN_DEMO' | 'SYSTEM';

export interface SupportMessage {
  id: string;
  ticketId: string;
  authorType: SupportAuthorType;
  authorName: string;
  message: string;
  createdAt: string;
  isInternal: boolean;
  isDemo: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName?: string;
  role: string;
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  description: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  messages: SupportMessage[];
  tags: string[];
  isDemo: boolean;
}

export type HelpCategory =
  | 'Getting Started'
  | 'Player Profile'
  | 'Teams'
  | 'Tournaments'
  | 'Registration'
  | 'Wallet'
  | 'Match Center'
  | 'Results'
  | 'Organizer'
  | 'Admin'
  | 'Account and Settings'
  | 'Troubleshooting';

export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: HelpCategory;
  content: string;
  relatedArticleIds: string[];
  keywords: string[];
  updatedAt: string;
  audience: 'PLAYER' | 'ORGANIZER' | 'ADMIN' | 'ALL';
  isDemo: boolean;
}

export type IssueType =
  | 'Broken Page'
  | 'Incorrect Data'
  | 'Tournament Problem'
  | 'Registration Problem'
  | 'Match Problem'
  | 'Result Problem'
  | 'Wallet Demo Problem'
  | 'Offensive Content'
  | 'Cheating Report'
  | 'Organizer Report'
  | 'Other';

export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IssueReport {
  id: string;
  userId: string;
  issueType: IssueType;
  title: string;
  description: string;
  relatedUrl?: string;
  relatedEntity?: string;
  severity: IssueSeverity;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  deviceInfo?: string;
  createdAt: string;
  isDemo: boolean;
}

export type PlatformServiceStatus = 'OPERATIONAL' | 'DEGRADED_DEMO' | 'MAINTENANCE_DEMO' | 'ISSUE_DEMO';

export interface PlatformSystemStatus {
  services: {
    name: string;
    status: PlatformServiceStatus;
    latencyMs: number;
  }[];
  updatedAt: string;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  layoutDensity: 'compact' | 'comfortable';
  reducedAnimations: boolean;
  highContrast: boolean;
  cardDensity: 'compact' | 'comfortable';
  tableDensity: 'compact' | 'comfortable';
}

export interface PrivacySettings {
  publicProfile: boolean;
  showMatchHistory: boolean;
  showTeamMembership: boolean;
  showAchievements: boolean;
  showWalletBalance: boolean;
  showTournamentHistory: boolean;
  allowTeamInvitations: boolean;
  allowJoinRequests: boolean;
}

export interface AccessibilitySettings {
  reducedMotion: boolean;
  increasedContrast: boolean;
  largerText: boolean;
  strongerFocus: boolean;
  simplifiedAnimations: boolean;
  preferCardsOverTables: boolean;
}

export interface LanguageRegionSettings {
  language: string;
  region: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currencyDisplay: string;
}

export interface GameplaySettings {
  defaultGame: string;
  preferredMode: TournamentMode;
  preferredMap: string;
  preferredPerspective: string;
  autoOpenNextMatch: boolean;
  showAdvancedStats: boolean;
}

export interface UserSettings {
  appearance: AppearanceSettings;
  notifications: NotificationPreference;
  notificationReminders: NotificationReminderPreference;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  languageRegion: LanguageRegionSettings;
  gameplay: GameplaySettings;
}

export interface DataExportPackage {
  version: string;
  exportedAt: string;
  categories: Record<string, unknown>;
  isDemoData: boolean;
}

export interface DataImportValidation {
  valid: boolean;
  version: string;
  categoriesCount: number;
  recordsCount: number;
  warnings: string[];
  errors: string[];
}

export interface StorageCategorySummary {
  category: string;
  key: string;
  itemCount: number;
  estimatedBytes: number;
}

// --- PHASE 12: GLOBAL SETTINGS, FINAL POLISH, PERFORMANCE, ACCESSIBILITY & PRODUCTION READINESS TYPES ---

export type StorageSchemaVersion = 'v1.0.0-demo';

export interface StorageMigration {
  fromVersion: string;
  toVersion: string;
  migratedAt: string;
  keyCount: number;
}

export interface StorageHealthReport {
  schemaVersion: string;
  totalKeys: number;
  totalEstimatedBytes: number;
  corruptedKeysCount: number;
  missingReferencesCount: number;
  duplicateIdsCount: number;
  lastCheckedAt: string;
  status: 'HEALTHY' | 'WARNING' | 'CORRUPTED';
}

export type DataIntegrityIssueType =
  | 'CORRUPTED_JSON'
  | 'DUPLICATE_ID'
  | 'MISSING_REFERENCE'
  | 'INVALID_SCHEMA'
  | 'ORPHANED_RECORD';

export type DataIntegritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DataIntegrityIssue {
  id: string;
  key: string;
  type: DataIntegrityIssueType;
  severity: DataIntegritySeverity;
  description: string;
  recordId?: string;
  autoFixable: boolean;
}

export interface DataIntegrityReport {
  checkedAt: string;
  totalRecordsChecked: number;
  issues: DataIntegrityIssue[];
  healthScore: number;
}

export interface DataRepairResult {
  repairedAt: string;
  fixedIssuesCount: number;
  remainingIssuesCount: number;
  logs: string[];
}

export interface BackupSnapshot {
  id: string;
  createdAt: string;
  label: string;
  data: Record<string, unknown>;
}

export type GlobalSearchCategory = 'TOURNAMENTS' | 'TEAMS' | 'PLAYERS' | 'MATCHES' | 'RESULTS' | 'HELP';

export interface GlobalSearchResult {
  id: string;
  category: GlobalSearchCategory;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  iconType: string;
}

export interface RecentSearch {
  id: string;
  query: string;
  searchedAt: string;
}

export type ReadinessCheckStatus = 'PASSED' | 'WARNING' | 'FAILED' | 'INFO';

export interface ReadinessCheck {
  id: string;
  title: string;
  category: 'TypeScript' | 'ESLint' | 'NextBuild' | 'Storage' | 'Accessibility' | 'CrossPhase';
  status: ReadinessCheckStatus;
  detail: string;
}

export interface ProjectReadinessSummary {
  checkedAt: string;
  overallStatus: 'PRODUCTION_READY_DEMO' | 'NEEDS_ATTENTION' | 'INCOMPLETE';
  checks: ReadinessCheck[];
  phaseCoverage: { phase: number; name: string; status: 'COMPLETE' }[];
}

export interface OnboardingState {
  completed: boolean;
  completedAt?: string;
  selectedRole?: string;
}

export interface AppError {
  code: string;
  message: string;
  details?: string;
  timestamp: string;
}




