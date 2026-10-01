/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Poll, PollResults, User } from '../types/poll';
import { X, Award, Shield, CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft, Play, RotateCcw } from 'lucide-react';

interface PollResultsModalProps {
  poll: Poll;
  results: PollResults;
  currentUser: User;
  onClose: () => void;
  onToggleStatus: (pollId: string) => void;
  onDeleteOption: (optionId: string) => void;
}

export const PollResultsModal: React.FC<PollResultsModalProps> = ({
  poll,
  results,
  currentUser,
  onClose,
  onToggleStatus,
  onDeleteOption,
}) => {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const isAdmin = currentUser.role === 'INSTANCE_ADMIN';

  const rounds = results.rounds || [];
  const activeRound = rounds[currentRoundIndex] || rounds[0];

  const totalVotes = results.voteCounts
    ? Object.values(results.voteCounts).reduce((a, b) => a + b, 0)
    : rounds[0] ? Object.values(rounds[0].voteCounts).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                {poll.category}
              </span>
              {poll.isRanked && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Ranked Choice (IRV)
                </span>
              )}
              {poll.isAnonymous && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Anonymous
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white">{poll.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-lg bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          
          {/* Anonymity Notice */}
          {poll.isAnonymous && !isAdmin && (
            <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-900/50 text-purple-200 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0 text-purple-400" />
              <span>This poll is anonymous. Voter identities are hidden for regular team members. Instance Admins can inspect unmasked audit records.</span>
            </div>
          )}

          {/* IRV Round-by-Round Playback View */}
          {poll.isRanked && rounds.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Round-by-Round IRV Elimination Playback</h3>
                  <p className="text-xs text-neutral-400">Step through Instant-Runoff rounds to see preference transfers.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentRoundIndex(Math.max(0, currentRoundIndex - 1))}
                    disabled={currentRoundIndex === 0}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-semibold px-3 py-1 bg-neutral-800 rounded">
                    Round {activeRound?.round || 1} of {rounds.length}
                  </span>
                  <button
                    onClick={() => setCurrentRoundIndex(Math.min(rounds.length - 1, currentRoundIndex + 1))}
                    disabled={currentRoundIndex === rounds.length - 1}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Round Votes Breakdown */}
              <div className="space-y-3">
                {results.options.map((opt) => {
                  const count = activeRound?.voteCounts[opt.id] || 0;
                  const totalRoundVotes = Object.values(activeRound?.voteCounts || {}).reduce((a, b) => a + b, 0);
                  const pct = totalRoundVotes > 0 ? Math.round((count / totalRoundVotes) * 100) : 0;
                  const isWinner = activeRound?.winnerOptionId === opt.id;
                  const isEliminated = activeRound?.eliminatedOptionId === opt.id;

                  return (
                    <div key={opt.id} className={`p-4 rounded-xl border transition ${
                      isWinner ? 'bg-emerald-950/40 border-emerald-600' :
                      isEliminated ? 'bg-red-950/30 border-red-900/60 opacity-60' :
                      'bg-neutral-950 border-neutral-800'
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-white flex items-center gap-2">
                          {opt.textContent}
                          {isWinner && <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">Winner</span>}
                          {isEliminated && <span className="text-xs bg-red-800 text-white px-2 py-0.5 rounded font-bold">Eliminated (Round {activeRound.round})</span>}
                        </span>
                        <span className="text-xs font-mono font-bold text-neutral-300">
                          {count} votes ({pct}%)
                        </span>
                      </div>

                      <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isWinner ? 'bg-emerald-500' : isEliminated ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeRound?.winnerOptionId && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-200 text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold">Majority Winner Declared in Round {activeRound.round}!</p>
                    <p className="text-xs text-emerald-300">
                      {results.options.find(o => o.id === activeRound.winnerOptionId)?.textContent} secured &gt;50% of active preference votes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Standard Poll Results View */}
          {!poll.isRanked && results.voteCounts && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-400 font-medium">
                Total Ballots Cast: <span className="text-white font-bold">{totalVotes}</span>
              </div>

              <div className="space-y-3">
                {results.options.map((opt) => {
                  const count = results.voteCounts?.[opt.id] || 0;
                  const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                  const voters = results.votersByOption?.[opt.id] || [];

                  return (
                    <div key={opt.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-white">{opt.textContent}</span>
                        <span className="text-xs font-mono font-bold text-neutral-300">
                          {count} votes ({pct}%)
                        </span>
                      </div>

                      <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>

                      {/* Voters List */}
                      {voters.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800/60">
                          <span className="text-[11px] text-neutral-400 font-medium">Voters:</span>
                          {voters.map((v, i) => (
                            <div key={i} className="flex items-center gap-1.5 bg-neutral-800/80 px-2 py-1 rounded-full text-xs text-neutral-200">
                              {v.avatar && <img src={v.avatar} alt={v.name} className="w-4 h-4 rounded-full object-cover" />}
                              <span>{v.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => onToggleStatus(poll.id)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition"
              >
                {poll.status === 'active' ? 'Close Poll' : 'Reopen Poll'}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
