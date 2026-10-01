/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Trash2, Award, Shield, Check } from 'lucide-react';

interface CreatePollModalProps {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    isRanked: boolean;
    isAnonymous: boolean;
    allowCustomOptions: boolean;
    maxOptionsLimit: number;
    category: string;
    options: string[];
  }) => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [isRanked, setIsRanked] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [allowCustomOptions, setAllowCustomOptions] = useState(true);
  const [maxOptionsLimit, setMaxOptionsLimit] = useState(8);
  const [options, setOptions] = useState<string[]>(['', '']);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddOptionField = () => {
    if (options.length >= 10) return;
    setOptions([...options, '']);
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleRemoveOptionField = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a poll title.');
      return;
    }
    const validOptions = options.filter(o => o.trim().length > 0);
    if (validOptions.length < 2) {
      setErrorMsg('Please provide at least 2 valid options.');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      isRanked,
      isAnonymous,
      allowCustomOptions,
      maxOptionsLimit,
      category,
      options: validOptions,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <h2 className="text-lg font-bold text-white">Create New Poll</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-2 rounded-lg bg-neutral-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Poll Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Q3 Infrastructure Migration Strategy"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context for voters..."
              rows={2}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Architecture">Architecture</option>
                <option value="Culture">Culture</option>
                <option value="Product">Product</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Max Custom Options</label>
              <input
                type="number"
                value={maxOptionsLimit}
                onChange={(e) => setMaxOptionsLimit(Number(e.target.value))}
                min={3}
                max={15}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setIsRanked(!isRanked)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                isRanked ? 'bg-blue-950/60 border-blue-600' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Award className={`w-5 h-5 ${isRanked ? 'text-blue-400' : 'text-neutral-500'}`} />
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isRanked ? 'bg-blue-600 border-blue-500' : 'border-neutral-700'}`}>
                  {isRanked && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              <span className="text-xs font-bold text-white">Ranked Choice (IRV)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                isAnonymous ? 'bg-purple-950/60 border-purple-600' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Shield className={`w-5 h-5 ${isAnonymous ? 'text-purple-400' : 'text-neutral-500'}`} />
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isAnonymous ? 'bg-purple-600 border-purple-500' : 'border-neutral-700'}`}>
                  {isAnonymous && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              <span className="text-xs font-bold text-white">Anonymous Poll</span>
            </button>

            <button
              type="button"
              onClick={() => setAllowCustomOptions(!allowCustomOptions)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                allowCustomOptions ? 'bg-emerald-950/60 border-emerald-600' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Plus className={`w-5 h-5 ${allowCustomOptions ? 'text-emerald-400' : 'text-neutral-500'}`} />
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${allowCustomOptions ? 'bg-emerald-600 border-emerald-500' : 'border-neutral-700'}`}>
                  {allowCustomOptions && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              <span className="text-xs font-bold text-white">Allow Custom Options</span>
            </button>
          </div>

          {/* Options Inputs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Poll Options</label>
              <button
                type="button"
                onClick={handleAddOptionField}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Option
              </button>
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionField(idx)}
                      className="px-3 text-neutral-500 hover:text-red-400 bg-neutral-950 border border-neutral-800 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {errorMsg && <p className="text-xs text-red-400 font-medium">{errorMsg}</p>}

          <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-lg shadow-blue-600/25"
            >
              Create Poll
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
