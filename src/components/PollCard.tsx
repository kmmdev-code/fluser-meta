/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Poll, PollOption, PollVote, User } from '../types/poll';
import { Award, Clock, ShieldAlert, Plus, CheckCircle, BarChart2, Trash2 } from 'lucide-react';

interface PollCardProps {
  poll: Poll;
  options: PollOption[];
  votes: PollVote[];
  currentUser: User;
  onVote: (pollId: string, rankings: { optionId: string; rank: number }[]) => void;
  onAddCustomOption: (pollId: string, text: string) => void;
  onOpenResults: (pollId: string) => void;
  onDeletePoll: (pollId: string) => void;
}

export const PollCard: React.FC<PollCardProps> = ({
  poll,
  options,
  votes,
  currentUser,
  onVote,
  onAddCustomOption,
  onOpenResults,
  onDeletePoll,
}) => {
  const userVotes = votes.filter(v => v.userId === currentUser.id);
  const initialRanks = poll.isRanked
    ? userVotes.sort((a, b) => a.rank - b.rank).map(v => v.optionId)
    : userVotes.length > 0 ? [userVotes[0].optionId] : [];

  const [selectedRanks, setSelectedRanks] = useState<string[]>(initialRanks);
  const [customOptionText, setCustomOptionText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state if votes or poll change
  React.useEffect(() => {
    const freshUserVotes = votes.filter(v => v.userId === currentUser.id);
    if (poll.isRanked) {
      setSelectedRanks(freshUserVotes.sort((a, b) => a.rank - b.rank).map(v => v.optionId));
    } else {
      setSelectedRanks(freshUserVotes.length > 0 ? [freshUserVotes[0].optionId] : []);
    }
  }, [votes, currentUser.id, poll.isRanked]);

  const handleOptionClick = (optionId: string) => {
    if (poll.status === 'closed') return;

    if (!poll.isRanked) {
      setSelectedRanks([optionId]);
      return;
    }

    if (selectedRanks.includes(optionId)) {
      setSelectedRanks(selectedRanks.filter((id) => id !== optionId));
    } else {
      if (selectedRanks.length >= options.length) return;
      setSelectedRanks([...selectedRanks, optionId]);
    }
  };

  const handleSubmit = () => {
    if (selectedRanks.length === 0) {
      setErrorMsg('Please select at least one option before submitting.');
      return;
    }
    setErrorMsg('');
    const payload = selectedRanks.map((optionId, index) => ({
      optionId,
      rank: index + 1,
    }));
    onVote(poll.id, payload);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customOptionText.trim()) return;
    try {
      onAddCustomOption(poll.id, customOptionText);
      setCustomOptionText('');
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add custom option');
    }
  };

  const totalVotersCount = new Set(votes.map(v => v.userId)).size;
  const isCreatorOrAdmin = currentUser.role === 'INSTANCE_ADMIN' || poll.creatorId === currentUser.id;

  return (
    <div className="border border-neutral-800 rounded-xl bg-neutral-900 text-white p-6 shadow-xl flex flex-col justify-between transition hover:border-neutral-700">
      <div>
        {/* Header Metadata */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
              {poll.category}
            </span>
            {poll.isRanked && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                <Award className="w-3 h-3" /> Ranked Choice (IRV)
              </span>
            )}
            {poll.isAnonymous && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                Anonymous
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
              poll.status === 'active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-neutral-800 text-neutral-400'
            }`}>
              {poll.status === 'active' ? 'Active' : 'Closed'}
            </span>
            {isCreatorOrAdmin && (
              <button
                onClick={() => onDeletePoll(poll.id)}
                className="text-neutral-500 hover:text-red-400 p-1 transition"
                title="Delete Poll"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-1">{poll.title}</h3>
        {poll.description && (
          <p className="text-sm text-neutral-400 mb-4">{poll.description}</p>
        )}

        {/* Options List */}
        <div className="space-y-2 mb-4">
          {options.map((opt) => {
            const rankIdx = selectedRanks.indexOf(opt.id);
            const isSelected = rankIdx !== -1;

            return (
              <div
                key={opt.id}
                onClick={() => handleOptionClick(opt.id)}
                className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/60 shadow-md shadow-blue-500/10'
                    : 'border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800 hover:border-neutral-700'
                } ${poll.status === 'closed' ? 'cursor-default opacity-80' : ''}`}
              >
                <span className="text-sm text-neutral-200">{opt.textContent}</span>
                {isSelected && poll.isRanked && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow">
                    {rankIdx + 1}
                    {['st', 'nd', 'rd'][rankIdx] || 'th'}
                  </span>
                )}
                {isSelected && !poll.isRanked && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* Custom Option Creator */}
        {poll.allowCustomOptions && poll.status === 'active' && (
          <form onSubmit={handleAddCustom} className="flex gap-2 mb-4">
            <input
              type="text"
              value={customOptionText}
              onChange={(e) => setCustomOptionText(e.target.value)}
              placeholder="Suggest a custom option..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>
        )}

        {errorMsg && (
          <p className="text-xs text-red-400 mb-3 font-medium flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> {errorMsg}
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{totalVotersCount} {totalVotersCount === 1 ? 'voter' : 'voters'}</span>
          {poll.expiresAt && (
            <>
              <span>·</span>
              <span>Expires {new Date(poll.expiresAt).toLocaleDateString()}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenResults(poll.id)}
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            <BarChart2 className="w-3.5 h-3.5" /> Results
          </button>

          {poll.status === 'active' && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-blue-600/20"
            >
              {userVotes.length > 0 ? 'Update Vote' : 'Submit Vote'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
