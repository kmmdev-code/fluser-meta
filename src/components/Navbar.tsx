/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from '../types/poll';
import { BarChart3, Plus, Shield, Users, Sparkles, Check } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  users: User[];
  onSwitchUser: (userId: string) => void;
  onOpenCreateModal: () => void;
  activeTab: 'all' | 'active' | 'closed' | 'ranked';
  onSelectTab: (tab: 'all' | 'active' | 'closed' | 'ranked') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users,
  onSwitchUser,
  onOpenCreateModal,
  activeTab,
  onSelectTab,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Polls</h1>
              <p className="text-xs text-neutral-400 hidden sm:block">Instant-Runoff & Team Voting</p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => onSelectTab('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'all' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Polls
            </button>
            <button
              onClick={() => onSelectTab('active')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'active' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => onSelectTab('ranked')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'ranked' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Ranked (IRV)
            </button>
            <button
              onClick={() => onSelectTab('closed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'closed' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Closed
            </button>
          </nav>
        </div>

        {/* Zone 3: Actions & Multi-Role Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-neutral-600 transition text-xs font-medium text-neutral-200"
            >
              <img src={currentUser.avatar} alt={currentUser.name} className="w-5 h-5 rounded-full object-cover" />
              <span className="hidden sm:inline">{currentUser.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                currentUser.role === 'INSTANCE_ADMIN' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                currentUser.role === 'MEMBER' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                'bg-neutral-700 text-neutral-300'
              }`}>
                {currentUser.role === 'INSTANCE_ADMIN' ? 'Admin' : currentUser.role === 'MEMBER' ? 'Member' : 'Anon'}
              </span>
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Switch Simulation Role
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u.id);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-neutral-800/70 transition ${
                      currentUser.id === u.id ? 'bg-neutral-800 text-white' : 'text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-medium text-white">{u.name}</p>
                        <p className="text-[10px] text-neutral-400 capitalize">{u.role.toLowerCase().replace('_', ' ')}</p>
                      </div>
                    </div>
                    {currentUser.id === u.id && <Check className="w-4 h-4 text-blue-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-lg shadow-blue-600/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Poll</span>
          </button>
        </div>

      </div>
    </header>
  );
};
