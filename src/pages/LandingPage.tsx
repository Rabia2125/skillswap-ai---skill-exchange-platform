import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SKILL_CATEGORIES } from '../data/mockDatabase';
import {
  Sparkles,
  Repeat,
  ArrowRight,
  Video,
  ShieldCheck,
  Users,
  Compass,
  CheckCircle2,
  BookOpen,
  MessageSquare
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectCategory }) => {
  const { openAuthModal } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/80 text-blue-800 rounded-full text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Zero Cost · 100% Peer-to-Peer Knowledge Sharing</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Exchange Skills. <br />
                <span className="text-blue-600">Empower Your Future.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                SkillSwap AI connects ambitious learners and creators worldwide. Share what you know, learn what you desire, and level up your career through real-time 1-on-1 peer learning sessions.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => openAuthModal('Create your profile to start swapping skills today', 'register')}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 text-sm"
                >
                  <span>Start Swapping Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('browse')}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-xl shadow-sm transition-all text-sm flex items-center gap-2"
                >
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Browse Available Skills</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-6 text-slate-600">
                <div>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums">14+</div>
                  <div className="text-xs text-slate-500 mt-0.5">Skill Categories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums">100%</div>
                  <div className="text-xs text-slate-500 mt-0.5">Free Peer Exchange</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums">Gemini AI</div>
                  <div className="text-xs text-slate-500 mt-0.5">Custom Roadmaps</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white">
                <img
                  src="/src/assets/images/hero_collaboration_1794059250844.jpg"
                  alt="SkillSwap peer collaboration"
                  className="w-full h-auto object-cover aspect-[16/10]"
                  referrerPolicy="no-referrer"
                />
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      AI
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Live Skill Match Found</div>
                      <div className="text-[11px] text-slate-500">React.js ↔ UI/UX Design System</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Mutual Match
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Simple 3-Step Process</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">How SkillSwap AI Works</h2>
            <p className="text-slate-600 text-sm mt-3">
              No money exchanges hands. You exchange pure knowledge, structured lessons, and real-time collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Build Your Skill Profile</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                List the skills you have mastery in and the topics you want to learn. Our database instantly syncs your profile with Browse Skills.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Discover Matching Peers</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Use smart search across 14 categories. Filter by expertise level and location. Propose a mutual exchange with one click.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Connect, Chat & Learn</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upon accepting a request, jump into real-time chat, generate Google Meet or Zoom sessions, and follow Gemini AI roadmaps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SKILL CATEGORIES SECTION */}
      <section id="categories" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Explore Fields</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Featured Skill Categories</h2>
              <p className="text-slate-600 text-sm mt-2">
                Browse our curated categories to discover peer mentors ready to share their expertise.
              </p>
            </div>
            <button
              onClick={() => onNavigate('browse')}
              className="mt-4 md:mt-0 text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
            >
              <span>Explore All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SKILL_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(category);
                  onNavigate('browse');
                }}
                className="p-5 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {category}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Active peer exchanges available
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AI ASSISTANT HIGHLIGHT */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-sky-400 rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Powered by Google Gemini 3.8 Flash</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Meet SkillSwap AI Assistant
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Not sure where to start? Our intelligent AI Assistant analyzes your current skills, generates personalized step-by-step learning roadmaps, suggests practical portfolio projects, and guides you on how to structure your 1-on-1 swap sessions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <div className="font-semibold text-sm text-sky-300 mb-1">Tailored Roadmaps</div>
                  <div className="text-xs text-slate-400">Step-by-step beginner to advanced milestones with practice exercises.</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <div className="font-semibold text-sm text-sky-300 mb-1">Matchmaker Guidance</div>
                  <div className="text-xs text-slate-400">Identifies the most in-demand skills in your portfolio to offer potential partners.</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('ai-assistant')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Try AI Skill Assistant</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-700/80">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">SkillSwap AI Assistant</div>
                    <div className="text-[11px] text-sky-400">AI Learning Architect</div>
                  </div>
                </div>
                <div className="mt-4 space-y-3 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-slate-700/60 border border-slate-600/50">
                    <span className="font-semibold text-white">User:</span> "I know React and want to learn Figma design systems."
                  </div>
                  <div className="p-3 rounded-lg bg-blue-900/40 border border-blue-800/60 text-slate-200">
                    <span className="font-semibold text-sky-300">AI Assistant:</span> "Here is your 4-week collaborative roadmap! Partner with Maya Lin in Brooklyn who offers UI/UX and wants React. Focus your first session on token definitions..."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              <Repeat className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">SkillSwap AI</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">Software Construction & Development (SCD) Project</span>
          </div>

          <div className="flex items-center gap-6 text-slate-500">
            <button onClick={() => onNavigate('browse')} className="hover:text-slate-900">Explore Skills</button>
            <a href="#how-it-works" className="hover:text-slate-900">How It Works</a>
            <button onClick={() => openAuthModal('Sign In', 'login')} className="hover:text-slate-900">Sign In</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
