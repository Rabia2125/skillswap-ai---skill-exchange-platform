import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AIChatMessage } from '../types';
import {
  Sparkles,
  Send,
  Trash2,
  BookOpen,
  Compass,
  ArrowRight,
  Code,
  Users,
  Lightbulb,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  {
    title: 'Generate Learning Roadmap',
    prompt: 'I want to learn Python for backend web development. Generate a step-by-step roadmap with beginner, intermediate, and advanced milestones, exercises, and joint projects.',
    icon: BookOpen
  },
  {
    title: 'Skill Exchange Guidance',
    prompt: 'Based on my profile skills, which skills are in highest demand to offer, and what type of exchange partner should I look for?',
    icon: Compass
  },
  {
    title: 'Collaborative Project Ideas',
    prompt: 'Suggest 3 practical real-world projects that a frontend developer and a UI/UX designer can build together during a skill swap.',
    icon: Lightbulb
  },
  {
    title: 'Curated Learning Resources',
    prompt: 'Recommend free, high-quality documentation, interactive tutorials, and open-source repos to supplement my peer learning sessions.',
    icon: Code
  }
];

export const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'ai_init',
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}! I'm your **SkillSwap AI Assistant** powered by Google Gemini. 

I'm here to help you unlock the full value of peer-to-peer learning:
- 🗺️ **Personalized Learning Roadmaps** (Beginner, Intermediate & Advanced)
- 🤝 **Exchange Strategy** (Which of your skills to offer and what partners to target)
- 💡 **Hands-on Collaborative Projects** you can build together with a swap partner
- 📚 **Curated Learning Resources** & practice syllabi

How can I help you accelerate your skill growth today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (promptText?: string) => {
    const textToSend = promptText || inputPrompt.trim();
    if (!textToSend || loading) return;

    const userMsg: AIChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      // Build history for multi-turn context
      const history = messages
        .filter(m => m.id !== 'ai_init')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await api.askAI(textToSend, history);

      const aiMsg: AIChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: AIChatMessage = {
        id: `ai_err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${err.message || 'I encountered an issue processing your request. Please check your network or try asking again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `ai_init_${Date.now()}`,
        role: 'assistant',
        content: `Chat history cleared. What would you like to explore or plan next, ${user?.name}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <Sparkles className="w-6 h-6 text-sky-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">SkillSwap AI Assistant</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-sky-300 border border-blue-400/30">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Personalized roadmap generation, partner matching strategy, and curated syllabi
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SUGGESTED_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1 group-hover:text-blue-500">
                <span>Ask prompt</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Chat Conversation Viewport */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/40">
          {messages.map(m => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                    <Sparkles className="w-4 h-4 text-sky-200" />
                  </div>
                )}

                <div className={`max-w-2xl space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none prose-sm max-w-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {m.content}
                    </div>
                  </div>
                  <div className={`text-[10px] text-slate-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {m.timestamp}
                  </div>
                </div>

                {isUser && user && (
                  <img
                    src={user.profile.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-1"
                  />
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-500">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-200" />
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-600 italic flex items-center gap-2">
                <span>SkillSwap AI is thinking and formulating recommendations...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask anything about skills, roadmaps, project ideas, or swap matching..."
            disabled={loading}
            className="flex-1 px-4 py-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-blue-500/20 transition-colors flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
