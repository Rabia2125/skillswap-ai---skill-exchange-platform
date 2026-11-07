import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SwapRequest, User, Conversation } from '../types';
import {
  Sparkles,
  ArrowRight,
  Send,
  MessageSquare,
  Repeat,
  Compass,
  CheckCircle2,
  Clock,
  User as UserIcon,
  Video,
  ExternalLink
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (view: string) => void;
  onOpenSwapModalWithUser: (user: User) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenSwapModalWithUser }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentRequests, setRecentRequests] = useState<SwapRequest[]>([]);
  const [smartMatches, setSmartMatches] = useState<any[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashRes, convRes] = await Promise.all([
          api.getDashboardStats(),
          api.getConversations()
        ]);
        setStats(dashRes.stats);
        setRecentRequests(dashRes.recentRequests);
        setSmartMatches(dashRes.smartMatches);
        setConversations(convRes.conversations.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Quick Profile Summary Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.profile.avatar}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-blue-100 shadow-sm shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name}</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Active Member
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              {user.profile.title} · {user.location}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
              <span>Member since {user.profile.joinedDate}</span>
              <span>·</span>
              <span className="text-emerald-700 font-medium">★ {user.profile.rating || 5.0} Rating</span>
              <span>·</span>
              <span className="tabular-nums">{user.profile.exchangesCompleted || 0} Exchanges Completed</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('browse')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Partners</span>
          </button>
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Ask AI Assistant</span>
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS (Tabular figures) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Skills Offered</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {stats?.skillsOffered ?? user.profile.skillsToTeach.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ready to teach</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Skills Wanted</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {stats?.skillsWanted ?? user.profile.skillsToLearn.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">In your wishlist</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Received Requests</div>
          <div className="text-2xl font-bold text-blue-600 tabular-nums mt-1">
            {stats?.receivedRequestsCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Incoming proposals</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Sent Requests</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {stats?.sentRequestsCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting reply</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Active Partnerships</div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums mt-1">
            {stats?.acceptedExchangesCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Accepted swaps</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Unread Messages</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {stats?.unreadMessagesCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">In partner chats</div>
        </div>
      </div>

      {/* 2-COLUMN SECTION: SMART MATCHES + RECENT REQUESTS & CONVERSATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Smart Skill Matching (Requirement 10.C) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Smart Skill Matches For You</h2>
              </div>
              <button
                onClick={() => onNavigate('browse')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                View all peers →
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Partners whose skills align with what you want to learn, or who want to learn what you can teach.
            </p>

            <div className="space-y-3.5">
              {smartMatches.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Update your skills in profile to see personalized smart matches!
                </div>
              ) : (
                smartMatches.map(({ user: matchUser, reason }) => (
                  <div
                    key={matchUser.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={matchUser.profile.avatar}
                        alt={matchUser.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900">{matchUser.name}</div>
                        <div className="text-xs text-slate-500">{matchUser.profile.title} · {matchUser.location}</div>
                        <div className="text-[11px] text-blue-700 font-medium mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{reason}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenSwapModalWithUser(matchUser)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/20 transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Propose Swap</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick AI Learning Prompts */}
          <div className="p-5 bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-300">AI Assistant Fast Track</span>
            </div>
            <h3 className="text-base font-bold text-white">Generate a Custom Learning Roadmap</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              Ask Gemini to outline weekly milestones, practice exercises, and collaboration topics for your skill swap.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => onNavigate('ai-assistant')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-medium transition-colors"
              >
                "Roadmap for UI/UX & React"
              </button>
              <button
                onClick={() => onNavigate('ai-assistant')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-medium transition-colors"
              >
                "What skills should I offer?"
              </button>
              <button
                onClick={() => onNavigate('ai-assistant')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-medium transition-colors"
              >
                "Suggest a joint project"
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Requests & Conversations */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Swap Requests */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Swap Requests</h2>
              <button
                onClick={() => onNavigate('requests')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Manage all →
              </button>
            </div>

            <div className="space-y-3">
              {recentRequests.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No swap requests yet. Browse skills and propose your first exchange!
                </div>
              ) : (
                recentRequests.map(r => {
                  const isIncoming = r.receiverId === user.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => onNavigate('requests')}
                      className="p-3.5 rounded-xl border border-slate-200/90 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-900">
                          {isIncoming ? r.senderName : `To: ${r.receiverName}`}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'Accepted'
                              ? 'bg-emerald-50 text-emerald-700'
                              : r.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-1">
                        Offers: <span className="font-medium text-slate-900">{r.offeredSkill}</span> · Wants: <span className="font-medium text-slate-900">{r.requestedSkill}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Partner Conversations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Active Conversations</h2>
              <button
                onClick={() => onNavigate('messages')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Open chat →
              </button>
            </div>

            <div className="space-y-3">
              {conversations.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No active conversations. Accept a swap request to start chatting!
                </div>
              ) : (
                conversations.map(c => (
                  <div
                    key={c.id}
                    onClick={() => onNavigate('messages')}
                    className="p-3.5 rounded-xl border border-slate-200/90 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={c.partner.avatar}
                        alt={c.partner.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{c.partner.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {c.lastMessage?.content || 'Session active'}
                        </div>
                      </div>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
