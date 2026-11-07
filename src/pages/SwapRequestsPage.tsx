import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SwapRequest, User } from '../types';
import {
  Inbox,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  Repeat,
  User as UserIcon,
  ArrowRight
} from 'lucide-react';

interface SwapRequestsPageProps {
  onNavigateToMessages: (conversationId?: string) => void;
  onViewUserProfile: (userId: string) => void;
}

export const SwapRequestsPage: React.FC<SwapRequestsPageProps> = ({
  onNavigateToMessages,
  onViewUserProfile
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'accepted'>('received');
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.getSwapRequests(activeTab);
      setRequests(res.requests);
    } catch (err: any) {
      console.error('Failed to load swap requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const handleAccept = async (requestId: string) => {
    try {
      const res = await api.acceptSwapRequest(requestId);
      setActionMessage({ text: res.message, type: 'success' });
      loadRequests();
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Failed to accept request.', type: 'error' });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const res = await api.rejectSwapRequest(requestId);
      setActionMessage({ text: res.message, type: 'success' });
      loadRequests();
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Failed to decline request.', type: 'error' });
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      const res = await api.cancelSwapRequest(requestId);
      setActionMessage({ text: res.message, type: 'success' });
      loadRequests();
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Failed to cancel request.', type: 'error' });
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Skill Swap Requests</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review incoming exchange proposals, monitor your sent requests, and view active learning partners.
        </p>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-medium animate-in fade-in duration-150 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="underline text-[11px] font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* 3 Main Tabs (Feature Three) */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-sm">
        <button
          onClick={() => { setActiveTab('received'); setActionMessage(null); }}
          className={`flex-1 py-3 px-4 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'received'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Received Requests</span>
        </button>

        <button
          onClick={() => { setActiveTab('sent'); setActionMessage(null); }}
          className={`flex-1 py-3 px-4 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'sent'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Sent Requests</span>
        </button>

        <button
          onClick={() => { setActiveTab('accepted'); setActionMessage(null); }}
          className={`flex-1 py-3 px-4 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'accepted'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Accepted Partnerships</span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 bg-white rounded-2xl border border-slate-200 animate-pulse p-6"></div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Repeat className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {activeTab === 'received' && 'No incoming swap requests right now'}
            {activeTab === 'sent' && 'You have not sent any pending swap requests'}
            {activeTab === 'accepted' && 'No accepted exchange partnerships yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'received' && 'When other members discover your skills, their exchange proposals will appear here.'}
            {activeTab === 'sent' && 'Explore the Browse Skills page to find partners and send your first request!'}
            {activeTab === 'accepted' && 'When you accept an incoming request or a partner accepts yours, you will see your active partnerships here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const isSender = req.senderId === user.id;
            const partnerName = isSender ? req.receiverName : req.senderName;
            const partnerAvatar = isSender ? req.receiverAvatar : req.senderAvatar;
            const partnerLocation = isSender ? req.receiverLocation : req.senderLocation;
            const partnerId = isSender ? req.receiverId : req.senderId;

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: User & Skills Info */}
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={partnerAvatar}
                    alt={partnerName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{partnerName}</h3>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">{partnerLocation}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'Accepted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : req.status === 'Rejected'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    {/* Skill Exchange Summary */}
                    <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-wrap items-center gap-2">
                      <span>
                        Offered to Teach: <strong className="text-blue-700">{req.offeredSkill}</strong>
                      </span>
                      <span className="text-slate-300">|</span>
                      <span>
                        Requested to Learn: <strong className="text-slate-900">{req.requestedSkill}</strong>
                      </span>
                    </div>

                    {/* Message */}
                    <p className="text-xs text-slate-600 italic leading-relaxed pt-1">
                      "{req.message}"
                    </p>

                    <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3" />
                      <span>Proposed {new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Functional Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  {/* TAB 1: RECEIVED ACTIONS */}
                  {activeTab === 'received' && req.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Request</span>
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </>
                  )}

                  {/* TAB 2: SENT ACTIONS */}
                  {activeTab === 'sent' && req.status === 'Pending' && (
                    <button
                      onClick={() => handleCancel(req.id)}
                      className="px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                    >
                      Cancel Request
                    </button>
                  )}

                  {/* TAB 3: ACCEPTED ACTIONS */}
                  {activeTab === 'accepted' && (
                    <>
                      <button
                        onClick={() => onViewUserProfile(partnerId)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Profile</span>
                      </button>
                      <button
                        onClick={() => onNavigateToMessages()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition-colors flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Start Chat & Video</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
