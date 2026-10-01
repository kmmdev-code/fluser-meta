export type UserRole = 'INSTANCE_ADMIN' | 'MEMBER' | 'ANONYMOUS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface PollOption {
  id: string;
  pollId: string;
  creatorId: string;
  textContent: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface Poll {
  id: string;
  messageId: string;
  creatorId: string;
  title: string;
  description?: string;
  isRanked: boolean;
  isAnonymous: boolean;
  allowCustomOptions: boolean;
  maxOptionsLimit: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'closed';
  category: string;
}

export interface PollVote {
  id: string;
  pollId: string;
  userId: string;
  optionId: string;
  rank: number;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userAvatar?: string;
}

export interface VoteInput {
  userId: string;
  optionId: string;
  rank: number;
}

export interface RoundResult {
  round: number;
  voteCounts: Record<string, number>;
  eliminatedOptionId?: string;
  winnerOptionId?: string;
  isTie?: boolean;
}

export interface PollResults {
  voteCounts?: Record<string, number>;
  votersByOption?: Record<string, Array<{ id: string; name?: string; avatar?: string }>>;
  rounds?: RoundResult[];
  options: PollOption[];
}
