import React from 'react';
import { User } from '../types';
import {
  X,
  MapPin,
  Calendar,
  Award,
  Target,
  Briefcase,
  GraduationCap,
  Clock,
  Repeat
} from 'lucide-react';

interface UserProfileModalProps {
  user: User | null;
  onClose: () => void;
  onProposeSwap: (user: User) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, onProposeSwap }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user.profile.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-slate-200 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  ★ {user.profile.rating || 5.0}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-600 font-medium">{user.profile.title}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{user.location}</span>
                </span>
                <span>·</span>
                <span>Joined {user.profile.joinedDate}</span>
                <span>·</span>
                <span>{user.profile.exchangesCompleted || 0} swaps</span>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bio */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">About</h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {user.profile.bio}
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
            <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Skills Offered To Teach</span>
            </div>
            <div className="space-y-1.5">
              {user.profile.skillsToTeach.map(s => (
                <div key={s.id} className="p-2 bg-white rounded-lg border border-blue-100 text-xs">
                  <div className="font-semibold text-slate-900">{s.name}</div>
                  <div className="text-[11px] text-slate-500">{s.level} · {s.category} {s.experienceYears ? `· ${s.experienceYears}y exp` : ''}</div>
                  {s.description && <div className="text-[10px] text-slate-600 mt-0.5">{s.description}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 space-y-2">
            <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-600" />
              <span>Skills Desired to Learn</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {user.profile.skillsToLearn.map((wl, i) => (
                <span key={i} className="px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-xs font-medium text-amber-900">
                  {wl}
                </span>
              ))}
            </div>
            {user.profile.learningGoals && (
              <div className="pt-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Goal:</span> {user.profile.learningGoals}
              </div>
            )}
          </div>
        </div>

        {/* Experience & Availability */}
        <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
          {user.profile.experience && (
            <div className="flex items-start gap-2">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span><strong>Experience:</strong> {user.profile.experience}</span>
            </div>
          )}
          {user.profile.education && (
            <div className="flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span><strong>Education:</strong> {user.profile.education}</span>
            </div>
          )}
          {user.profile.availability && (
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span><strong>Availability:</strong> {user.profile.availability}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onProposeSwap(user);
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Send Swap Request</span>
          </button>
        </div>
      </div>
    </div>
  );
};
