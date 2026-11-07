import React, { useState } from 'react';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, Send, AlertCircle, CheckCircle, Repeat } from 'lucide-react';

interface SendSwapModalProps {
  targetUser: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const SendSwapModal: React.FC<SendSwapModalProps> = ({ targetUser, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [offeredSkill, setOfferedSkill] = useState('');
  const [requestedSkill, setRequestedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (targetUser && targetUser.profile.skillsToTeach.length > 0) {
      setRequestedSkill(targetUser.profile.skillsToTeach[0].name);
    }
    if (user && user.profile.skillsToTeach.length > 0) {
      setOfferedSkill(user.profile.skillsToTeach[0].name);
    }
    setMessage(`Hi ${targetUser?.name || 'there'}! I noticed your profile on SkillSwap AI and would love to exchange skills. I can guide you through what I teach, and in return I would love to learn from you!`);
    setError(null);
    setSuccessMsg(null);
  }, [targetUser, user]);

  if (!targetUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!offeredSkill.trim()) {
      setError('Please choose or enter a skill you can offer to teach.');
      return;
    }

    if (!requestedSkill.trim()) {
      setError('Please select the skill you want to learn.');
      return;
    }

    if (!message.trim()) {
      setError('Please include a brief personalized message.');
      return;
    }

    setLoading(true);
    try {
      await api.createSwapRequest({
        receiverId: targetUser.id,
        offeredSkill: offeredSkill.trim(),
        requestedSkill: requestedSkill.trim(),
        message: message.trim()
      });
      setSuccessMsg(`Skill swap proposal sent to ${targetUser.name}!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1400);
    } catch (err: any) {
      setError(err.message || 'Failed to send swap request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Propose Skill Exchange</h3>
              <p className="text-xs text-slate-500">Initiate a mutual learning collaboration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipient summary card */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <img
              src={targetUser.profile.avatar}
              alt={targetUser.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-900 truncate">{targetUser.name}</div>
              <div className="text-xs text-slate-500 truncate">{targetUser.profile.title} · {targetUser.location}</div>
              <div className="text-[11px] text-blue-700 mt-0.5 truncate">
                Offers: {targetUser.profile.skillsToTeach.map(s => s.name).join(', ') || 'Various skills'}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Skill You Want to Learn (from {targetUser.name})
              </label>
              <select
                value={requestedSkill}
                onChange={(e) => setRequestedSkill(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {targetUser.profile.skillsToTeach.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.level} · {s.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Skill You Offer to Teach in Exchange
              </label>
              {user && user.profile.skillsToTeach.length > 0 ? (
                <select
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {user.profile.skillsToTeach.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.level} · {s.category})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  placeholder="e.g. React.js, Graphic Design, Python"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Personalized Request Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Introduce yourself and outline your learning schedule or goals..."
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !!successMsg}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Submitting...' : 'Send Swap Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
