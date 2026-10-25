export type Role = 'ROLE_USER' | 'ROLE_TRAINER' | 'ROLE_ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  approved: boolean;
  xpPoints: number;
  absencesCount: number;
  currentBattlepassLevel: number;
  phone?: string | null;
  avatarUrl?: string | null;
  belt?: string | null;
  birthDate?: string | null;
  bio?: string | null;
}

export interface ProfileUpdate {
  name: string;
  phone?: string;
  bio?: string;
  birthDate?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Story {
  id: number;
  userId: number;
  userName: string;
  userAvatarUrl?: string | null;
  mediaUrl: string;
  caption?: string | null;
  createdAt: string;
  expiresAt: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT';

export interface Attendance {
  id: number;
  userId: number;
  userName: string;
  date: string;
  status: AttendanceStatus;
  markedByTrainerId: number;
}

export interface BattlePassReward {
  id: number;
  name: string;
  description: string;
  requiredLevel: number;
  /** Pragul real de XP care deblocheaza recompensa. */
  requiredXp: number;
  iconUrl: string;
  maxAbsencesAllowed: number;
}

export interface BattlePassState {
  currentLevel: number;
  xpPoints: number;
  absencesThisMonth: number;
  /** Urmatorul prag de atins, pentru bara de progres. */
  nextThresholdXp: number;
  rewards: BattlePassRewardState[];
}

export interface BattlePassRewardState extends BattlePassReward {
  unlocked: boolean;
  claimed: boolean;
  claimedAt?: string | null;
}

export interface WheelPrize {
  id: number;
  label: string;
  color: string;
  weight: number;
  /** Sansa reala, normalizata din ponderi (server-side). */
  chancePercent: number;
}

export interface WheelSpinResult {
  prizeId: number;
  prizeLabel: string;
  /** Ce s-a intamplat efectiv, in limbaj natural. */
  outcome: string;
  spunAt: string;
  /** Null cand premiul a fost "Mai da o data". */
  nextSpinAvailableAt: string | null;
  xpAwarded: number;
  absenceForgiven: boolean;
  grantsExtraSpin: boolean;
}

export interface WheelStatus {
  canSpin: boolean;
  nextSpinAvailableAt: string | null;
  prizes: WheelPrize[];
  lastPrizeLabel: string | null;
}

export interface Competition {
  id: number;
  title: string;
  location: string;
  date: string;
  description: string;
  createdByName: string;
  participants: string[];
}

export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  schedule: string;
  phone: string;
}
