/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { pollService } from './services/pollService';
import { Poll, User } from './types/poll';
import { Navbar } from './components/Navbar';
import { PollCard } from './components/PollCard';
import { PollResultsModal } from './components/PollResultsModal';
import { CreatePollModal } from './components/CreatePollModal';
import { Search, Filter, BarChart3, Award, CheckCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(pollService.getCurrentUser());
  const [users] = useState<User[]>(pollService.getUsers());
  const [polls, setPolls] = useState<Poll[]>(pollService.getPolls());
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'closed' | 'ranked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [resultsModalPollId, setResultsModalPollId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSwitchUser = (userId: string) => {
    pollService.setCurrentUser(userId);
    setCurrentUser(pollService.getCurrentUser());
    setPolls(pollService.getPolls());
    showToast(`Switched active user to ${pollService.getCurrentUser().name}`);
  };

  const handleVote = (pollId: string, rankings: { optionId: string; rank: number }[]) => {
    try {
      pollService.submitVote(pollId, rankings);
      setPolls(pollService.getPolls());
      showToast('Ballot submitted successfully!');
    } catch (err: any) {
      showToast(err.message || 'Error submitting vote');
    }
  };

  const handleAddCustomOption = (pollId: string, text: string) => {
    try {
      pollService.addCustomOption(pollId, text);
      setPolls(pollService.getPolls());
      showToast('Custom option added successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to add custom option');
    }
  };

  const handleCreatePoll = (data: {
    title: string;
    description?: string;
    isRanked: boolean;
    isAnonymous: boolean;
    allowCustomOptions: boolean;
    maxOptionsLimit: number;
    category: string;
    options: string[];
  }) => {
    try {
      pollService.createPoll(data);
      setPolls(pollService.getPolls());
      setIsCreateModalOpen(false);
      showToast('New poll created successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to create poll');
    }
  };

  const handleToggleStatus = (pollId: string) => {
    pollService.togglePollStatus(pollId);
    setPolls(pollService.getPolls());
    showToast('Poll status updated.');
  };

  const handleDeletePoll = (pollId: string) => {
    if (confirm('Are you sure you want to delete this poll?')) {
      pollService.deletePoll(pollId);
      setPolls(pollService.getPolls());
      showToast('Poll deleted.');
    }
  };

  // Filter polls
  const filteredPolls = polls.filter(poll => {
    const matchesSearch = poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (poll.description && poll.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (activeTab === 'active') return poll.status === 'active';
    if (activeTab === 'closed') return poll.status === 'closed';
    if (activeTab === 'ranked') return poll.isRanked;
    return true;
  });

  const activeResultsPoll = resultsModalPollId ? pollService.getPollById(resultsModalPollId) : null;
  const activeResultsData = resultsModalPollId ? pollService.getPollResults(resultsModalPollId) : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      
      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search polls by title or keyword..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-neutral-400 font-medium whitespace-nowrap">Filter:</span>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              All ({polls.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'active' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Active ({polls.filter(p => p.status === 'active').length})
            </button>
            <button
              onClick={() => setActiveTab('ranked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'ranked' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Ranked IRV ({polls.filter(p => p.isRanked).length})
            </button>
          </div>
        </div>

        {/* Polls Grid */}
        {filteredPolls.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <BarChart3 className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No polls found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              No polls match your search or filter criteria. Create a new poll to start collecting votes.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
            >
              Create Poll
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                options={pollService.getOptionsForPoll(poll.id)}
                votes={pollService.getVotesForPoll(poll.id)}
                currentUser={currentUser}
                onVote={handleVote}
                onAddCustomOption={handleAddCustomOption}
                onOpenResults={(id) => setResultsModalPollId(id)}
                onDeletePoll={handleDeletePoll}
              />
            ))}
          </div>
        )}

      </main>

      {/* Create Poll Modal */}
      {isCreateModalOpen && (
        <CreatePollModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePoll}
        />
      )}

      {/* Results Modal */}
      {resultsModalPollId && activeResultsPoll && activeResultsData && (
        <PollResultsModal
          poll={activeResultsPoll}
          results={activeResultsData}
          currentUser={currentUser}
          onClose={() => setResultsModalPollId(null)}
          onToggleStatus={handleToggleStatus}
          onDeleteOption={(optId) => {
            pollService.deleteOption(optId);
            setPolls(pollService.getPolls());
            showToast('Option deleted.');
          }}
        />
      )}

    </div>
  );
}
