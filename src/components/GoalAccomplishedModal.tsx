import React, { useState } from 'react';
import { SessionRecord } from '../types/session';
import { CheckCircle2, Clock, ArrowRight, Sparkles, History } from 'lucide-react';

interface GoalAccomplishedModalProps {
  session: SessionRecord;
  totalSeconds: number;
  onConfirmComplete: (reflection?: string, rating?: string) => void;
  onCancel: () => void;
  onViewHistory: () => void;
}

const REFLECTION_RATINGS = [
  { id: 'smooth', label: 'Smooth flow' },
  { id: 'breakthrough', label: 'Overcame hurdle' },
  { id: 'longer', label: 'Needed more time' },
  { id: 'quick_win', label: 'Quick win' },
];

export const GoalAccomplishedModal: React.FC<GoalAccomplishedModalProps> = ({
  session,
  totalSeconds,
  onConfirmComplete,
  onCancel,
  onViewHistory,
}) => {
  const [selectedRating, setSelectedRating] = useState<string>('smooth');
  const [reflectionNote, setReflectionNote] = useState<string>('');

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) {
      return `${hrs}h ${remMins}m`;
    }
    return `${mins || 1} min`;
  };

  const handleSave = () => {
    onConfirmComplete(reflectionNote.trim() || undefined, selectedRating);
  };

  return (
    <div
      id="goal-accomplished-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-accomplished-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#DDDCD6] dark:border-[#2C2C28] bg-[#FDFDFB] dark:bg-[#1C1C1A] p-5 sm:p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header: Intention Accomplished */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#3C7A57]/10 text-[#3C7A57] text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Goal Accomplished</span>
          </div>

          <h2
            id="goal-accomplished-title"
            className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5] leading-snug"
          >
            {session.title}
          </h2>

          <div className="flex items-center gap-3 text-xs text-[#6F6F6A] dark:text-[#9E9D97] pt-0.5">
            <span className="flex items-center gap-1 font-mono font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Total focus: {formatTime(totalSeconds)}</span>
            </span>
            <span>•</span>
            <span>{session.sessions?.length || 1} intervals logged</span>
          </div>
        </div>

        {/* Behavioral Loop: Metacognition & Reflection (Peak-End Rule) */}
        <div className="space-y-3 pt-2 border-t border-[#DDDCD6]/60 dark:border-[#2C2C28]/60">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-bold text-[#6F6F6A] dark:text-[#9E9D97]">
              Reflect: How was the execution?
            </span>
            <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97]">
              Capturing this helps you adapt future task estimates and celebrate momentum.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {REFLECTION_RATINGS.map((r) => {
              const isSelected = selectedRating === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRating(r.id)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition cursor-pointer min-h-[40px] ${
                    isSelected
                      ? 'border-[#171717] dark:border-[#EBEAE5] bg-[#171717] text-white dark:bg-[#EBEAE5] dark:text-[#171717]'
                      : 'border-[#DDDCD6] dark:border-[#2C2C28] text-[#171717] dark:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-1">
            <label
              htmlFor="reflection-notes-input"
              className="block text-xs font-medium text-[#6F6F6A] dark:text-[#9E9D97]"
            >
              Optional Takeaway / Key Result
            </label>
            <input
              id="reflection-notes-input"
              type="text"
              value={reflectionNote}
              onChange={(e) => setReflectionNote(e.target.value)}
              placeholder="e.g. Chapter 4 summary finished, ready for practice test"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] bg-white dark:bg-[#141412] text-[#171717] dark:text-[#EBEAE5] placeholder-[#9E9D97] focus:outline-hidden focus:border-[#1F5EFF]"
            />
          </div>
        </div>

        {/* Primary Actions */}
        <div className="space-y-2 pt-2 border-t border-[#DDDCD6]/60 dark:border-[#2C2C28]/60">
          <button
            id="confirm-goal-complete-btn"
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 px-4 rounded-xl bg-[#171717] hover:bg-[#2c2c2a] dark:bg-[#EBEAE5] dark:hover:bg-white dark:text-[#171717] text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>Save &amp; Complete Goal</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] hover:underline cursor-pointer py-1"
            >
              Keep working on this
            </button>

            <button
              type="button"
              onClick={() => {
                handleSave();
                onViewHistory();
              }}
              className="text-xs text-[#1F5EFF] hover:underline font-medium cursor-pointer flex items-center gap-1 py-1"
            >
              <History className="w-3.5 h-3.5" />
              <span>Save &amp; View in History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
