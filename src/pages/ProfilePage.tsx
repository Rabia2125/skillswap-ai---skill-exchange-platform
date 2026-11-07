import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserSkill, User } from '../types';
import { SKILL_CATEGORIES } from '../data/mockDatabase';
import {
  User as UserIcon,
  MapPin,
  Mail,
  Calendar,
  Briefcase,
  GraduationCap,
  Clock,
  Target,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Award
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit form state
  const [editName, setEditName] = useState(user?.name || '');
  const [editLocation, setEditLocation] = useState(user?.location || '');
  const [editTitle, setEditTitle] = useState(user?.profile.title || '');
  const [editBio, setEditBio] = useState(user?.profile.bio || '');
  const [editAvatar, setEditAvatar] = useState(user?.profile.avatar || '');
  const [editExperience, setEditExperience] = useState(user?.profile.experience || '');
  const [editEducation, setEditEducation] = useState(user?.profile.education || '');
  const [editAvailability, setEditAvailability] = useState(user?.profile.availability || '');
  const [editLearningGoals, setEditLearningGoals] = useState(user?.profile.learningGoals || '');
  const [editSkillsToTeach, setEditSkillsToTeach] = useState<UserSkill[]>(user?.profile.skillsToTeach || []);
  const [editSkillsToLearn, setEditSkillsToLearn] = useState<string[]>(user?.profile.skillsToLearn || []);
  const [newLearnSkill, setNewLearnSkill] = useState('');

  // Add new teach skill temporary inputs
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<string>(SKILL_CATEGORIES[0]);
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  const [newSkillYears, setNewSkillYears] = useState<number>(2);

  if (!user) return null;

  // Calculate profile completion percentage
  const fields = [
    user.name,
    user.location,
    user.profile.title,
    user.profile.bio,
    user.profile.skillsToTeach.length > 0,
    user.profile.skillsToLearn.length > 0,
    user.profile.experience,
    user.profile.education,
    user.profile.availability,
    user.profile.learningGoals
  ];
  const completedFields = fields.filter(Boolean).length;
  const completionPercentage = Math.round((completedFields / fields.length) * 100);

  const handleOpenEdit = () => {
    setEditName(user.name);
    setEditLocation(user.location);
    setEditTitle(user.profile.title);
    setEditBio(user.profile.bio);
    setEditAvatar(user.profile.avatar);
    setEditExperience(user.profile.experience);
    setEditEducation(user.profile.education);
    setEditAvailability(user.profile.availability);
    setEditLearningGoals(user.profile.learningGoals);
    setEditSkillsToTeach([...user.profile.skillsToTeach]);
    setEditSkillsToLearn([...user.profile.skillsToLearn]);
    setIsEditing(true);
    setMessage(null);
  };

  const handleAddSkillToTeach = () => {
    if (!newSkillName.trim()) return;
    const newSkill: UserSkill = {
      id: `sk_${Date.now()}`,
      name: newSkillName.trim(),
      category: newSkillCategory,
      level: newSkillLevel,
      experienceYears: Number(newSkillYears) || 1
    };
    setEditSkillsToTeach(prev => [...prev, newSkill]);
    setNewSkillName('');
  };

  const handleRemoveSkillToTeach = (id: string) => {
    setEditSkillsToTeach(prev => prev.filter(s => s.id !== id));
  };

  const handleAddSkillToLearn = () => {
    if (!newLearnSkill.trim()) return;
    if (!editSkillsToLearn.includes(newLearnSkill.trim())) {
      setEditSkillsToLearn(prev => [...prev, newLearnSkill.trim()]);
    }
    setNewLearnSkill('');
  };

  const handleRemoveSkillToLearn = (skillName: string) => {
    setEditSkillsToLearn(prev => prev.filter(s => s !== skillName));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.updateProfile({
        name: editName.trim(),
        location: editLocation.trim(),
        title: editTitle.trim(),
        bio: editBio.trim(),
        avatar: editAvatar.trim(),
        skillsToTeach: editSkillsToTeach,
        skillsToLearn: editSkillsToLearn,
        experience: editExperience.trim(),
        education: editEducation.trim(),
        availability: editAvailability.trim(),
        learningGoals: editLearningGoals.trim()
      });

      updateUser(res.user);
      setMessage({ text: 'Profile updated and synchronized with Browse Skills!', type: 'success' });
      setIsEditing(false);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to save profile changes.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold animate-in fade-in duration-150 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* TOP PROFILE BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={user.profile.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-md shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Verified Member
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600">{user.profile.title}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{user.location}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {user.profile.joinedDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button & Completion Score */}
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <button
              onClick={handleOpenEdit}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            {/* Profile Completion Indicator */}
            <div className="w-48 text-right space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Profile Completion</span>
                <span className="text-blue-600 tabular-nums">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* About Me */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About Me</h2>
          <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
            {user.profile.bio}
          </p>
        </div>
      </div>

      {/* 2-COLUMN SKILLS & EXPERIENCE SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills I Can Teach */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Skills I Can Teach ({user.profile.skillsToTeach.length})</span>
            </h2>
            <button onClick={handleOpenEdit} className="text-xs text-blue-600 font-semibold hover:underline">
              Add Skill
            </button>
          </div>

          <div className="space-y-3">
            {user.profile.skillsToTeach.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center">No skills listed to teach yet.</div>
            ) : (
              user.profile.skillsToTeach.map(s => (
                <div key={s.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{s.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {s.level}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Category: {s.category} {s.experienceYears ? `· ${s.experienceYears} yrs exp` : ''}
                  </div>
                  {s.description && (
                    <div className="text-[11px] text-slate-600 pt-0.5">{s.description}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Skills I Want to Learn */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-600" />
              <span>Skills I Want to Learn ({user.profile.skillsToLearn.length})</span>
            </h2>
            <button onClick={handleOpenEdit} className="text-xs text-blue-600 font-semibold hover:underline">
              Edit Wishlist
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {user.profile.skillsToLearn.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center w-full">No skills added to wishlist yet.</div>
            ) : (
              user.profile.skillsToLearn.map((wl, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-900"
                >
                  {wl}
                </div>
              ))
            )}
          </div>

          {/* Learning Goals */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Learning Goals</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {user.profile.learningGoals || 'No learning goals set yet.'}
            </p>
          </div>
        </div>

        {/* Experience & Education */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-600" />
            <span>Experience & Background</span>
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            {user.profile.experience || 'No experience details added.'}
          </p>

          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Education</span>
            </h3>
            <p className="text-xs text-slate-700">
              {user.profile.education || 'No formal education specified.'}
            </p>
          </div>
        </div>

        {/* Availability & Interests */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span>Availability for Learning Sessions</span>
          </h2>
          <p className="text-xs text-slate-700">
            {user.profile.availability || 'Flexible on request.'}
          </p>

          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Interests</h3>
            <div className="flex flex-wrap gap-1.5">
              {user.profile.interests.map((int, i) => (
                <span key={i} className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                  {int}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Personal Profile</h3>
                <p className="text-xs text-slate-500">Changes will synchronize immediately with Browse Skills</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline / Professional Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Developer & React Enthusiast"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">About Me (Bio)</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Skills I Can Teach Management */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-900">Manage Skills You Can Teach</div>
                <div className="space-y-2">
                  {editSkillsToTeach.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{s.name}</span>
                        <span className="text-slate-500 ml-2">({s.level} · {s.category})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkillToTeach(s.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new skill inline */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Skill name (e.g. Docker)"
                    className="sm:col-span-2 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  />
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSkillToTeach}
                    className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Skills I Want to Learn Management */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-900">Manage Skills You Want to Learn</div>
                <div className="flex flex-wrap gap-2">
                  {editSkillsToLearn.map((wl, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                      <span>{wl}</span>
                      <button type="button" onClick={() => handleRemoveSkillToLearn(wl)} className="text-slate-400 hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLearnSkill}
                    onChange={(e) => setNewLearnSkill(e.target.value)}
                    placeholder="e.g. Flutter, SEO, UI/UX"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkillToLearn}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg"
                  >
                    Add to Wishlist
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experience</label>
                  <input
                    type="text"
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                    placeholder="e.g. 5 years in Frontend, 2 years at TechCorp"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Education</label>
                  <input
                    type="text"
                    value={editEducation}
                    onChange={(e) => setEditEducation(e.target.value)}
                    placeholder="e.g. B.S. in Computer Science"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Availability</label>
                  <input
                    type="text"
                    value={editAvailability}
                    onChange={(e) => setEditAvailability(e.target.value)}
                    placeholder="e.g. Weekday evenings (6 PM - 8 PM EST)"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Learning Goals</label>
                  <input
                    type="text"
                    value={editLearningGoals}
                    onChange={(e) => setEditLearningGoals(e.target.value)}
                    placeholder="e.g. Master React and build full-stack apps"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
