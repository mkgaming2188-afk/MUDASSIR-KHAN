export type GameMode = 'Solo' | 'Duo' | 'Squad';

export type TournamentStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';

export interface PrizeRank {
  rank: string;
  amount: number;
  label: string;
}

export interface RegisteredPlayer {
  id: string;
  userId: string;
  username: string;
  ign: string;
  gameUid: string;
  slotNumber: number;
  registeredAt: string;
  teamName?: string;
  teammates?: { ign: string; gameUid: string }[];
  isVerified?: boolean;
}

export interface LiveSpectatorPlayer {
  id: string;
  name: string;
  ign: string;
  gameUid: string;
  teamName: string;
  teamColor: string;
  status: 'alive' | 'knocked' | 'eliminated';
  health: number; // 0 - 100
  armor: number; // 0 - 100
  kills: number;
  damage: number;
  headshots: number;
  weapons: {
    primary: string;
    secondary: string;
    throwable: string;
  };
  coords: { x: number; y: number }; // 0-100% position on map
  eliminatedBy?: string;
  eliminatedAt?: string;
  survivalRank?: number;
}

export interface KillFeedItem {
  id: string;
  killer: string;
  killerTeam?: string;
  victim: string;
  victimTeam?: string;
  weapon: string;
  isHeadshot: boolean;
  timestamp: string;
}

export interface LiveMatchState {
  currentCircle: number; // 1 to 5
  circleShrinkTimer: number; // seconds
  alivePlayers: number;
  totalPlayers: number;
  aliveTeams: number;
  totalTeams: number;
  matchElapsedSeconds: number;
  killFeed: KillFeedItem[];
  players: LiveSpectatorPlayer[];
  spectatorCount: number;
  isMatchFinished: boolean;
  winnerTeam?: string;
}

export interface TournamentResult {
  rank: number;
  playerName: string;
  teamName?: string;
  ign: string;
  gameUid: string;
  kills: number;
  placement: number;
  killPoints: number;
  placementPoints: number;
  totalPoints: number;
  prizeWon: number;
}

export interface Tournament {
  id: string;
  title: string;
  game: string;
  mode: GameMode;
  map: string;
  matchTime: string; // ISO
  entryFee: number;
  prizePool: number;
  perKillBonus: number;
  prizeBreakdown: PrizeRank[];
  totalSlots: number;
  status: TournamentStatus;
  roomId: string;
  roomPassword: string;
  revealMinutesBefore: number; // e.g. 5, 10, 15
  roomRevealed: boolean;
  rules: string[];
  registeredPlayers: RegisteredPlayer[];
  results?: TournamentResult[];
  bannerUrl?: string;
  liveMatchState?: LiveMatchState;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'entry_fee' | 'prize_won' | 'reward_claimed' | 'top_up' | 'refund' | 'admin_bonus';
  amount: number; // positive for credit, negative for debit
  balanceAfter: number;
  title: string;
  description: string;
  timestamp: string;
  tournamentId?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  ign: string;
  gameUid: string;
  coins: number;
  role: 'player' | 'admin';
  avatar: string;
  tournamentsJoined: number;
  tournamentsWon: number;
  totalKills: number;
  dailyRewardClaimedAt?: string;
}
