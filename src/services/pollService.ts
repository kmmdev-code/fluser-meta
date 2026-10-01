/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Poll, PollOption, PollVote, User, PollResults } from '../types/poll';
import { calculateIRVResults } from '../utils/irvService';

const USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Alex Vance (Admin)',
    email: 'alex.vance@company.com',
    role: 'INSTANCE_ADMIN',
    avatar: '/src/assets/images/avatar_admin_female_1790818681851.jpg',
  },
  {
    id: 'user-member-1',
    name: 'Jordan Lee (Dev)',
    email: 'jordan.lee@company.com',
    role: 'MEMBER',
    avatar: '/src/assets/images/avatar_dev_male_1790818694293.jpg',
  },
  {
    id: 'user-member-2',
    name: 'Taylor Swift (Lead)',
    email: 'taylor.swift@company.com',
    role: 'MEMBER',
    avatar: '/src/assets/images/avatar_lead_female_1790818711859.jpg',
  },
  {
    id: 'user-anon-1',
    name: 'Anonymous Visitor',
    email: 'visitor@company.com',
    role: 'ANONYMOUS',
    avatar: '/src/assets/images/avatar_anon_user_1790818724085.jpg',
  }
];

const INITIAL_POLLS: Poll[] = [
  {
    id: 'poll-1',
    messageId: 'msg-1',
    creatorId: 'user-admin-1',
    title: 'Q3 Core Architecture Migration: Microservices vs Modular Monolith',
    description: 'Vote on our primary infrastructure refactoring direction for the Q3 release cycle.',
    isRanked: true,
    isAnonymous: false,
    allowCustomOptions: true,
    maxOptionsLimit: 5,
    expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'active',
    category: 'Architecture'
  },
  {
    id: 'poll-2',
    messageId: 'msg-2',
    creatorId: 'user-member-2',
    title: 'Next Sprint Backend Tech Stack Selection',
    description: 'Which runtime framework should we adopt for our new high-throughput event ingestion pipeline?',
    isRanked: false,
    isAnonymous: true,
    allowCustomOptions: true,
    maxOptionsLimit: 6,
    expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'active',
    category: 'Engineering'
  },
  {
    id: 'poll-3',
    messageId: 'msg-3',
    creatorId: 'user-admin-1',
    title: 'Q4 Office Attendance & Hybrid Work Policy',
    description: 'How many mandatory days in-office should we establish starting next quarter?',
    isRanked: false,
    isAnonymous: false,
    allowCustomOptions: false,
    maxOptionsLimit: 4,
    expiresAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'closed',
    category: 'Culture'
  }
];

const INITIAL_OPTIONS: PollOption[] = [
  // Poll 1 options (Ranked IRV)
  { id: 'opt-1-1', pollId: 'poll-1', creatorId: 'user-admin-1', textContent: 'Modular Monolith (DDD + Modularized Packages)', createdAt: new Date().toISOString() },
  { id: 'opt-1-2', pollId: 'poll-1', creatorId: 'user-admin-1', textContent: 'Distributed Microservices (Kubernetes + gRPC)', createdAt: new Date().toISOString() },
  { id: 'opt-1-3', pollId: 'poll-1', creatorId: 'user-admin-1', textContent: 'Serverless Functions (AWS Lambda + EventBridge)', createdAt: new Date().toISOString() },
  
  // Poll 2 options (Standard Anonymous)
  { id: 'opt-2-1', pollId: 'poll-2', creatorId: 'user-member-2', textContent: 'Node.js with TypeScript & Fastify', createdAt: new Date().toISOString() },
  { id: 'opt-2-2', pollId: 'poll-2', creatorId: 'user-member-2', textContent: 'Go (Golang) with Fiber & pgx', createdAt: new Date().toISOString() },
  { id: 'opt-2-3', pollId: 'poll-2', creatorId: 'user-member-2', textContent: 'Python with FastAPI & SQLAlchemy', createdAt: new Date().toISOString() },
  { id: 'opt-2-4', pollId: 'poll-2', creatorId: 'user-member-2', textContent: 'Rust with Axum & Tokio', createdAt: new Date().toISOString() },

  // Poll 3 options (Closed Standard)
  { id: 'opt-3-1', pollId: 'poll-3', creatorId: 'user-admin-1', textContent: 'Fully Remote (0 days mandatory)', createdAt: new Date().toISOString() },
  { id: 'opt-3-2', pollId: 'poll-3', creatorId: 'user-admin-1', textContent: 'Flexible Hybrid (2 days in-office)', createdAt: new Date().toISOString() },
  { id: 'opt-3-3', pollId: 'poll-3', creatorId: 'user-admin-1', textContent: 'Structured Core Days (3 days in-office)', createdAt: new Date().toISOString() }
];

const INITIAL_VOTES: PollVote[] = [
  // Poll 1 votes (Ranked IRV)
  { id: 'vote-1', pollId: 'poll-1', userId: 'user-member-1', optionId: 'opt-1-1', rank: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userName: 'Jordan Lee (Dev)', userAvatar: '/src/assets/images/avatar_dev_male_1790818694293.jpg' },
  { id: 'vote-2', pollId: 'poll-1', userId: 'user-member-1', optionId: 'opt-1-2', rank: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userName: 'Jordan Lee (Dev)', userAvatar: '/src/assets/images/avatar_dev_male_1790818694293.jpg' },
  { id: 'vote-3', pollId: 'poll-1', userId: 'user-member-2', optionId: 'opt-1-1', rank: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userName: 'Taylor Swift (Lead)', userAvatar: '/src/assets/images/avatar_lead_female_1790818711859.jpg' },
  { id: 'vote-4', pollId: 'poll-1', userId: 'user-member-2', optionId: 'opt-1-3', rank: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userName: 'Taylor Swift (Lead)', userAvatar: '/src/assets/images/avatar_lead_female_1790818711859.jpg' },
  { id: 'vote-5', pollId: 'poll-1', userId: 'user-admin-1', optionId: 'opt-1-2', rank: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userName: 'Alex Vance (Admin)', userAvatar: '/src/assets/images/avatar_admin_female_1790818681851.jpg' },

  // Poll 2 votes
  { id: 'vote-6', pollId: 'poll-2', userId: 'user-member-1', optionId: 'opt-2-2', rank: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userName: 'Jordan Lee (Dev)', userAvatar: '/src/assets/images/avatar_dev_male_1790818694293.jpg' },
  { id: 'vote-7', pollId: 'poll-2', userId: 'user-admin-1', optionId: 'opt-2-2', rank: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userName: 'Alex Vance (Admin)', userAvatar: '/src/assets/images/avatar_admin_female_1790818681851.jpg' },

  // Poll 3 votes
  { id: 'vote-8', pollId: 'poll-3', userId: 'user-member-1', optionId: 'opt-3-2', rank: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userName: 'Jordan Lee (Dev)', userAvatar: '/src/assets/images/avatar_dev_male_1790818694293.jpg' },
  { id: 'vote-9', pollId: 'poll-3', userId: 'user-member-2', optionId: 'opt-3-2', rank: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userName: 'Taylor Swift (Lead)', userAvatar: '/src/assets/images/avatar_lead_female_1790818711859.jpg' },
  { id: 'vote-10', pollId: 'poll-3', userId: 'user-admin-1', optionId: 'opt-3-3', rank: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userName: 'Alex Vance (Admin)', userAvatar: '/src/assets/images/avatar_admin_female_1790818681851.jpg' },
];

class PollService {
  private polls: Poll[];
  private options: PollOption[];
  private votes: PollVote[];
  private users: User[];
  private currentUserId: string;

  constructor() {
    this.users = USERS;
    this.currentUserId = USERS[0].id; // Default to admin

    const savedPolls = localStorage.getItem('polls_app_polls');
    const savedOptions = localStorage.getItem('polls_app_options');
    const savedVotes = localStorage.getItem('polls_app_votes');
    const savedUser = localStorage.getItem('polls_app_current_user');

    this.polls = savedPolls ? JSON.parse(savedPolls) : INITIAL_POLLS;
    this.options = savedOptions ? JSON.parse(savedOptions) : INITIAL_OPTIONS;
    this.votes = savedVotes ? JSON.parse(savedVotes) : INITIAL_VOTES;
    if (savedUser) {
      this.currentUserId = savedUser;
    }
  }

  private save() {
    localStorage.setItem('polls_app_polls', JSON.stringify(this.polls));
    localStorage.setItem('polls_app_options', JSON.stringify(this.options));
    localStorage.setItem('polls_app_votes', JSON.stringify(this.votes));
    localStorage.setItem('polls_app_current_user', this.currentUserId);
  }

  public getUsers(): User[] {
    return this.users;
  }

  public getCurrentUser(): User {
    return this.users.find(u => u.id === this.currentUserId) || this.users[0];
  }

  public setCurrentUser(userId: string) {
    this.currentUserId = userId;
    this.save();
  }

  public getPolls(): Poll[] {
    return [...this.polls].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getPollById(pollId: string): Poll | undefined {
    return this.polls.find(p => p.id === pollId);
  }

  public getOptionsForPoll(pollId: string): PollOption[] {
    return this.options.filter(o => o.pollId === pollId);
  }

  public getVotesForPoll(pollId: string): PollVote[] {
    return this.votes.filter(v => v.pollId === pollId);
  }

  public createPoll(data: {
    title: string;
    description?: string;
    isRanked: boolean;
    isAnonymous: boolean;
    allowCustomOptions: boolean;
    maxOptionsLimit: number;
    expiresAt?: string;
    category: string;
    options: string[];
  }): Poll {
    const currentUser = this.getCurrentUser();
    const pollId = 'poll-' + Math.random().toString(36).substring(2, 9);
    const messageId = 'msg-' + Math.random().toString(36).substring(2, 9);

    const newPoll: Poll = {
      id: pollId,
      messageId,
      creatorId: currentUser.id,
      title: data.title,
      description: data.description,
      isRanked: data.isRanked,
      isAnonymous: data.isAnonymous,
      allowCustomOptions: data.allowCustomOptions,
      maxOptionsLimit: data.maxOptionsLimit || 10,
      expiresAt: data.expiresAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      category: data.category || 'General'
    };

    this.polls.unshift(newPoll);

    // Create options
    for (const text of data.options) {
      if (text.trim()) {
        const optionId = 'opt-' + Math.random().toString(36).substring(2, 9);
        const newOption: PollOption = {
          id: optionId,
          pollId,
          creatorId: currentUser.id,
          textContent: text.trim(),
          createdAt: new Date().toISOString()
        };
        this.options.push(newOption);
      }
    }

    this.save();
    return newPoll;
  }

  public addCustomOption(pollId: string, textContent: string): PollOption {
    const poll = this.getPollById(pollId);
    if (!poll || !poll.allowCustomOptions) {
      throw new Error('Custom options are not allowed on this poll.');
    }
    const currentOpts = this.getOptionsForPoll(pollId);
    if (currentOpts.length >= poll.maxOptionsLimit) {
      throw new Error(`Maximum options limit (${poll.maxOptionsLimit}) reached.`);
    }

    const currentUser = this.getCurrentUser();
    const optionId = 'opt-' + Math.random().toString(36).substring(2, 9);
    const newOption: PollOption = {
      id: optionId,
      pollId,
      creatorId: currentUser.id,
      textContent: textContent.trim(),
      createdAt: new Date().toISOString()
    };

    this.options.push(newOption);
    this.save();
    return newOption;
  }

  public submitVote(pollId: string, rankings: { optionId: string; rank: number }[]) {
    const currentUser = this.getCurrentUser();
    const poll = this.getPollById(pollId);
    if (!poll || poll.status === 'closed') {
      throw new Error('Poll is closed or does not exist.');
    }

    // Remove existing votes by this user for this poll
    this.votes = this.votes.filter(v => !(v.pollId === pollId && v.userId === currentUser.id));

    // Add new votes
    for (const item of rankings) {
      const voteId = 'vote-' + Math.random().toString(36).substring(2, 9);
      const newVote: PollVote = {
        id: voteId,
        pollId,
        userId: currentUser.id,
        optionId: item.optionId,
        rank: item.rank,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userName: currentUser.name,
        userAvatar: currentUser.avatar
      };
      this.votes.push(newVote);
    }

    this.save();
  }

  public getPollResults(pollId: string): PollResults {
    const poll = this.getPollById(pollId);
    const options = this.getOptionsForPoll(pollId);
    const votes = this.getVotesForPoll(pollId);
    const currentUser = this.getCurrentUser();

    if (!poll) {
      return { options: [] };
    }

    const isInstanceAdmin = currentUser.role === 'INSTANCE_ADMIN';
    const sanitizeAnonymity = poll.isAnonymous && !isInstanceAdmin;

    if (poll.isRanked) {
      const irvInputs = votes.map(v => ({
        userId: v.userId,
        optionId: v.optionId,
        rank: v.rank
      }));
      const rounds = calculateIRVResults(
        options.map(o => o.id),
        irvInputs
      );

      // Also collect voters for each option (rank 1) for detail view
      const votersByOption: Record<string, Array<{ id: string; name?: string; avatar?: string }>> = {};
      for (const vote of votes) {
        if (vote.rank === 1) {
          if (!votersByOption[vote.optionId]) votersByOption[vote.optionId] = [];
          votersByOption[vote.optionId].push(
            sanitizeAnonymity ? { id: 'ANONYMOUS', name: 'Anonymous Voter', avatar: '' } : { id: vote.userId, name: vote.userName, avatar: vote.userAvatar }
          );
        }
      }

      return { rounds, options, votersByOption };
    }

    // Standard poll aggregation
    const voteCounts: Record<string, number> = {};
    options.forEach(o => voteCounts[o.id] = 0);
    const votersByOption: Record<string, Array<{ id: string; name?: string; avatar?: string }>> = {};

    for (const vote of votes) {
      if (vote.rank === 1) {
        voteCounts[vote.optionId] = (voteCounts[vote.optionId] || 0) + 1;
        if (!votersByOption[vote.optionId]) votersByOption[vote.optionId] = [];
        votersByOption[vote.optionId].push(
          sanitizeAnonymity ? { id: 'ANONYMOUS', name: 'Anonymous Voter', avatar: '' } : { id: vote.userId, name: vote.userName, avatar: vote.userAvatar }
        );
      }
    }

    return { voteCounts, votersByOption, options };
  }

  public togglePollStatus(pollId: string) {
    const poll = this.getPollById(pollId);
    if (poll) {
      poll.status = poll.status === 'active' ? 'closed' : 'active';
      poll.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  public deletePoll(pollId: string) {
    this.polls = this.polls.filter(p => p.id !== pollId);
    this.options = this.options.filter(o => o.pollId !== pollId);
    this.votes = this.votes.filter(v => v.pollId !== pollId);
    this.save();
  }

  public deleteOption(optionId: string) {
    this.options = this.options.filter(o => o.id !== optionId);
    this.votes = this.votes.filter(v => v.optionId !== optionId);
    this.save();
  }
}

export const pollService = new PollService();
