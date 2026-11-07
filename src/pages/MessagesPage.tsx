import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Conversation, Message } from '../types';
import {
  Send,
  Video,
  Copy,
  Check,
  Search,
  MoreVertical,
  Smile,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
  PlusCircle,
  AlertTriangle
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [customMeetingUrl, setCustomMeetingUrl] = useState('');
  const [meetingProvider, setMeetingProvider] = useState<'Google Meet' | 'Zoom'>('Google Meet');

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Load conversations
  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await api.getConversations();
        setConversations(res.conversations);
        if (res.conversations.length > 0 && !activeConversationId) {
          setActiveConversationId(res.conversations[0].id);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, []);

  // Connect WebSocket for real-time messaging and typing events
  useEffect(() => {
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message' && data.conversationId === activeConversationId) {
          setMessages(prev => [...prev, data.message]);
        } else if (data.type === 'partner_typing' && data.conversationId === activeConversationId) {
          setPartnerTyping(data.isTyping);
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    return () => {
      ws.close();
    };
  }, [token, activeConversationId]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversationId) return;

    api.getMessages(activeConversationId)
      .then(res => setMessages(res.messages))
      .catch(err => console.error('Failed to load messages:', err));
  }, [activeConversationId]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  const activeConv = conversations.find(c => c.id === activeConversationId);

  const handleSendMessage = async (e?: React.FormEvent, customMeeting?: any) => {
    if (e) e.preventDefault();
    if (!activeConversationId || (!inputContent.trim() && !customMeeting)) return;

    const contentToSend = inputContent.trim() || (customMeeting ? `Here is our ${customMeeting.provider} learning session link!` : '');
    setInputContent('');

    // Emit typing stopped
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && activeConv) {
      socketRef.current.send(JSON.stringify({
        type: 'typing',
        conversationId: activeConversationId,
        partnerId: activeConv.partner.id,
        isTyping: false
      }));
    }

    try {
      const res = await api.sendMessage(activeConversationId, contentToSend, customMeeting);
      setMessages(prev => [...prev, res.message]);

      // Update conversation in sidebar
      setConversations(prev =>
        prev.map(c =>
          c.id === activeConversationId
            ? { ...c, lastMessage: { content: res.message.content, senderId: res.message.senderId, createdAt: res.message.createdAt } }
            : c
        )
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputContent(e.target.value);

    // Emit typing indicator to partner
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && activeConv) {
      socketRef.current.send(JSON.stringify({
        type: 'typing',
        conversationId: activeConversationId,
        partnerId: activeConv.partner.id,
        isTyping: true
      }));

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && activeConv) {
          socketRef.current.send(JSON.stringify({
            type: 'typing',
            conversationId: activeConversationId,
            partnerId: activeConv.partner.id,
            isTyping: false
          }));
        }
      }, 1500);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleCreateMeeting = () => {
    const randomId = Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6);
    const generatedUrl = meetingProvider === 'Google Meet'
      ? `https://meet.google.com/${randomId}`
      : `https://zoom.us/j/${Math.floor(100000000 + Math.random() * 900000000)}`;

    const meetingData = {
      provider: meetingProvider,
      url: customMeetingUrl || generatedUrl,
      title: `${meetingProvider} Session: ${activeConv?.partner.skillsBeingExchanged.partnerTeaches || 'Skill Exchange'}`
    };

    handleSendMessage(undefined, meetingData);
    setShowMeetingModal(false);
    setCustomMeetingUrl('');
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-140px)] min-h-[580px] grid grid-cols-1 md:grid-cols-12">
        {/* CONVERSATION SIDEBAR (md:col-span-4) */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-base font-bold text-slate-900">Exchange Conversations</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time messaging with accepted partners</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-4 text-xs text-slate-500 text-center">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <Video className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No active partner chats.</p>
                <p className="text-[11px] text-slate-400">Accept a swap request to unlock direct communication!</p>
              </div>
            ) : (
              conversations.map(c => {
                const isActive = c.id === activeConversationId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConversationId(c.id)}
                    className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                      isActive ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={c.partner.avatar}
                        alt={c.partner.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border border-slate-200"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{c.partner.name}</span>
                        {c.lastMessage && (
                          <span className="text-[10px] text-slate-400 tabular-nums">
                            {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-blue-700 font-medium truncate mt-0.5">
                        {c.partner.skillsBeingExchanged.partnerTeaches} ↔ {c.partner.skillsBeingExchanged.userTeaches}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-1">
                        {c.lastMessage?.content || 'Session opened'}
                      </p>
                    </div>

                    {c.unreadCount > 0 && !isActive && (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-1">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ACTIVE CHAT AREA (md:col-span-8) */}
        {activeConv ? (
          <div className="md:col-span-8 flex flex-col h-full bg-white">
            {/* Chat Top Header */}
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={activeConv.partner.avatar}
                    alt={activeConv.partner.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white"></span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {activeConv.partner.name}
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Online
                    </span>
                  </h3>
                  <div className="text-xs text-slate-500">
                    Teaching: {activeConv.partner.skillsBeingExchanged.partnerTeaches} · Location: {activeConv.partner.location}
                  </div>
                </div>
              </div>

              {/* Action: Share Meeting Link */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMeetingModal(true)}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 flex items-center gap-1.5 transition-colors"
                >
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>Schedule Meeting</span>
                </button>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
              {messages.map(msg => {
                const isMe = msg.senderId === user.id;
                const isSystem = msg.senderId === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-4">
                      <div className="inline-block max-w-lg p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 mb-1"
                      />
                    )}

                    <div className={`max-w-md space-y-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                        {/* Interactive Meeting Launcher Card */}
                        {msg.meeting && (
                          <div className={`mt-3 p-3 rounded-xl border ${
                            isMe ? 'bg-blue-700/60 border-blue-500 text-white' : 'bg-blue-50 border-blue-200 text-slate-900'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5" />
                                {msg.meeting.provider} Session
                              </span>
                              <span className="text-[10px] opacity-80">Clickable Link</span>
                            </div>
                            <div className="text-[11px] truncate opacity-90 mb-2 font-mono">
                              {msg.meeting.url}
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={msg.meeting.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                                  isMe
                                    ? 'bg-white text-blue-600 hover:bg-slate-100'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                <span>Join Room</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <button
                                onClick={() => handleCopyLink(msg.meeting!.url)}
                                className={`px-2.5 py-1 rounded text-xs font-medium border flex items-center gap-1 ${
                                  isMe ? 'border-blue-400 hover:bg-blue-600' : 'border-slate-300 hover:bg-white'
                                }`}
                              >
                                {copiedLink === msg.meeting.url ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={`text-[10px] text-slate-400 px-1 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <span>· Delivered</span>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {partnerTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                  <span>{activeConv.partner.name} is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={inputContent}
                onChange={handleInputChange}
                placeholder="Type a message or paste a Google Meet / Zoom URL..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
              <button
                type="submit"
                disabled={!inputContent.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="md:col-span-8 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
            Select a conversation on the left to start chatting.
          </div>
        )}
      </div>

      {/* Schedule Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Share Learning Session Room</h3>
              </div>
              <button onClick={() => setShowMeetingModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Provider</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMeetingProvider('Google Meet')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    meetingProvider === 'Google Meet'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Google Meet
                </button>
                <button
                  type="button"
                  onClick={() => setMeetingProvider('Zoom')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    meetingProvider === 'Zoom'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Zoom
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meeting URL (optional or auto-generate)
              </label>
              <input
                type="url"
                value={customMeetingUrl}
                onChange={(e) => setCustomMeetingUrl(e.target.value)}
                placeholder={meetingProvider === 'Google Meet' ? 'https://meet.google.com/xxx-xxxx-xxx' : 'https://zoom.us/j/123456789'}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Leave blank to automatically generate a valid {meetingProvider} room link.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMeetingModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateMeeting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Send Meeting Link to Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
