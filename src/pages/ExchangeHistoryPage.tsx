import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ExchangeRecord } from '../types';
import {
  CheckCircle2,
  Clock,
  Star,
  Award,
  Repeat,
  MessageSquare,
  X
} from 'lucide-react';

export const ExchangeHistoryPage: React.FC<{ onNavigateToMessages: () => void }> = ({ onNavigateToMessages }) => {
  const { user, updateUser } = useAuth();
  const [exchanges, setExchanges] = useState<ExchangeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingExchange, setCompletingExchange] = useState<ExchangeRecord | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadExchanges = async () => {
    setLoading(true);
    try {
      const res = await api.getExchanges();
      setExchanges(res.exchanges);
    } catch (err) {
      console.error('Failed to load exchanges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExchanges();
  }, []);

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingExchange) return;

    try {
      await api.completeExchange(completingExchange.id, {
        rating,
        review: review.trim() || 'Great skill exchange partner! Recommended.'
      });
      setActionSuccess(`Exchange with ${completingExchange.partnerName} marked as completed!`);
      setCompletingExchange(null);
      loadExchanges();
      // Refresh current user stats
      const meRes = await api.getMe();
      updateUser(meRes.user);
    } catch (err: any) {
      alert(err.message || 'Failed to complete exchange.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Exchange History & Reviews</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track active and completed skill swaps, log completion milestones, and review your peer mentors.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-200"></div>)}
        </div>
      ) : exchanges.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No skill exchanges recorded yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you accept an incoming request or a partner accepts yours, your mutual exchange record is tracked here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {exchanges.map(ex => {
            const isCompleted = ex.status === 'Completed';
            return (
              <div
                key={ex.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={ex.partnerAvatar}
                    alt={ex.partnerName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{ex.partnerName}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {ex.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-wrap gap-2">
                      <span>Learned: <strong className="text-blue-700">{ex.skillReceived}</strong></span>
                      <span className="text-slate-300">·</span>
                      <span>Taught: <strong className="text-slate-900">{ex.skillTaught}</strong></span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Started: {ex.startDate}</span>
                      {ex.completionDate && <span>· Completed: {ex.completionDate}</span>}
                    </div>

                    {ex.review && (
                      <div className="text-xs text-slate-700 italic pt-1 flex items-start gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-500 mt-0.5" />
                        <span>"{ex.review}"</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={onNavigateToMessages}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Chat</span>
                  </button>

                  {!isCompleted && (
                    <button
                      onClick={() => { setCompletingExchange(ex); setReview(''); setRating(5); }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Completed</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complete Exchange Modal */}
      {completingExchange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Mark Exchange as Completed</h3>
              <button onClick={() => setCompletingExchange(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              You are completing your skill exchange with <strong>{completingExchange.partnerName}</strong>. Rate your learning experience:
            </p>

            <form onSubmit={handleCompleteSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Partner Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Review & Feedback</label>
                <textarea
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share how this exchange helped you grow your skills..."
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompletingExchange(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
