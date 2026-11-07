import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User } from '../types';
import { SKILL_CATEGORIES } from '../data/mockDatabase';
import {
  Search,
  X,
  Filter,
  MapPin,
  Star,
  Repeat,
  CheckCircle2,
  Clock,
  Briefcase,
  GraduationCap,
  Sparkles,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';

interface BrowseSkillsPageProps {
  initialCategory?: string;
  onOpenSwapModalWithUser: (user: User) => void;
  onViewUserProfile: (user: User) => void;
}

export const BrowseSkillsPage: React.FC<BrowseSkillsPageProps> = ({
  initialCategory = 'All',
  onOpenSwapModalWithUser,
  onViewUserProfile
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [locationQuery, setLocationQuery] = useState('');

  const loadSkills = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers({
        search: searchQuery,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        level: selectedLevel === 'All' ? undefined : selectedLevel,
        location: locationQuery || undefined
      });
      setUsers(res.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, [selectedCategory, selectedLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSkills();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLevel('All');
    setLocationQuery('');
    setTimeout(loadSkills, 50);
  };

  const handleSwapClick = (targetUser: User) => {
    if (!isAuthenticated) {
      openAuthModal('Sign in or register to send a skill swap request to ' + targetUser.name, 'login');
      return;
    }
    onOpenSwapModalWithUser(targetUser);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Browse Skills & Find Partners</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore registered peers ready to teach and learn. Connect directly without platform fees or charges.
        </p>
      </div>

      {/* Prominent Search and Filter Bar (Feature Two, A & C) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Main search input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skill (e.g. React, UI/UX, Python) or user name..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Location search input */}
          <div className="md:col-span-3 relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="City, State or Country..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Level Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full py-2.5 px-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="All">All Skill Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          {/* Submit & Reset Buttons */}
          <div className="md:col-span-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-blue-500/20 transition-colors flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            {(searchQuery || selectedCategory !== 'All' || selectedLevel !== 'All' || locationQuery) && (
              <button
                type="button"
                onClick={handleClearFilters}
                title="Clear all filters"
                className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Categories Bar (All 14 categories + All) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {SKILL_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Showing <strong className="text-slate-900">{users.length}</strong> available skill exchange partners</span>
        {selectedCategory !== 'All' && (
          <span>Category: <strong className="text-blue-600">{selectedCategory}</strong></span>
        )}
      </div>

      {/* SKILL PROFILE CARDS GRID (Feature Two, D) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse p-6 space-y-4">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
              <div className="h-12 bg-slate-100 rounded"></div>
              <div className="h-8 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No matching skill partners found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing location filters, or exploring all categories.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((peer) => (
            <div
              key={peer.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                {/* Peer Header */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={peer.profile.avatar}
                    alt={peer.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 truncate">{peer.name}</h3>
                      <span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5">
                        ★ {peer.profile.rating || 5.0}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">{peer.profile.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{peer.location}</span>
                      <span>·</span>
                      <span className="tabular-nums">{peer.profile.exchangesCompleted || 0} swaps</span>
                    </div>
                  </div>
                </div>

                {/* About snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {peer.profile.bio}
                </p>

                {/* Skills I Can Teach */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Skills Offered To Teach
                  </div>
                  <div className="space-y-1.5">
                    {peer.profile.skillsToTeach.map(sk => (
                      <div key={sk.id} className="text-xs text-slate-700 flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <span className="font-semibold text-blue-900">{sk.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{sk.level} · {sk.category}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills I Want to Learn */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Wants To Learn
                  </div>
                  <div className="text-xs text-slate-600 flex flex-wrap gap-1.5">
                    {peer.profile.skillsToLearn.map((wl, idx) => (
                      <span key={idx} className="bg-amber-50 text-amber-800 text-[11px] px-2 py-0.5 rounded font-medium border border-amber-200/60">
                        {wl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                {peer.profile.availability && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{peer.profile.availability}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onViewUserProfile(peer)}
                  className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleSwapClick(peer)}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Send Swap Request</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
