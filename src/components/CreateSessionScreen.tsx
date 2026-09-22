import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Check } from 'lucide-react';
import { evaluateNextStepQuality } from '../lib/nextStepUtils';
import { analytics } from '../lib/analytics';
import {
  GOAL_CATEGORIES,
  TASK_STARTERS,
  NEXT_STEP_STARTERS,
  REMINDER_STARTERS,
} from '../data/goalCategories';
import { GoalCategory } from '../types/session';

interface CreateSessionScreenProps {
  onCancel?: () => void;
  onSubmit: (
    title: string,
    currentStep: string,
    reminder?: string,
    reminderType?: 'none' | 'today' | 'tomorrow',
    goalCategory?: GoalCategory
  ) => void;
  initialTitle?: string;
  initialStep?: string;
  initialCategory?: GoalCategory;
}

export const CreateSessionScreen: React.FC<CreateSessionScreenProps> = ({
  onCancel,
  onSubmit,
  initialTitle = '',
  initialStep = '',
  initialCategory = 'studies',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory>(initialCategory);
  const [title, setTitle] = useState(initialTitle);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [reminder, setReminder] = useState('');
  const [reminderType, setReminderType] = useState<'none' | 'today' | 'tomorrow'>('none');
  const [dismissedSuggestion, setDismissedSuggestion] = useState(false);

  const activeCategoryConfig =
    GOAL_CATEGORIES.find((c) => c.id === selectedCategory) || GOAL_CATEGORIES[0];

  const qualityCheck = evaluateNextStepQuality(currentStep);
  const showSuggestion = qualityCheck.isVague && !dismissedSuggestion;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentStep.trim()) return;

    analytics.logEvent('session_created', {
      has_reminder: reminderType !== 'none',
      goal_category: selectedCategory,
    });

    onSubmit(
      title.trim(),
      currentStep.trim(),
      reminder.trim() || undefined,
      reminderType,
      selectedCategory
    );
  };

  const handleApplySuggestion = () => {
    if (qualityCheck.suggestion) {
      setCurrentStep(qualityCheck.suggestion);
      setDismissedSuggestion(true);
      analytics.logEvent('next_step_saved');
    }
  };

  // Append or replace with sentence starter
  const handleApplyTaskStarter = (starter: string) => {
    const cleanPrefix = starter.replace('...', ' ');
    setTitle(cleanPrefix);
  };

  const handleApplyNextStepStarter = (starter: string) => {
    const cleanPrefix = starter.replace('...', ' ');
    setCurrentStep(cleanPrefix);
    setDismissedSuggestion(false);
  };

  const handleApplyReminderStarter = (starter: string) => {
    const cleanPrefix = starter.replace('...', ' ');
    setReminder(cleanPrefix);
  };

  return (
    <div id="create-session-screen" className="py-2">
      {onCancel && (
        <button
          id="create-session-cancel-btn"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] mb-4 transition cursor-pointer min-h-[40px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to workspace</span>
        </button>
      )}

      <div className="mb-6">
        <span className="block text-xs uppercase tracking-widest text-[#1F5EFF] font-bold mb-1">
          NEW TASK SETUP
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5]">
          Start your focus session
        </h2>
        <p className="text-xs sm:text-sm text-[#6F6F6A] dark:text-[#9E9D97] mt-1">
          Use the sentence starters below so it&apos;s fast and effortless to begin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Goal Options */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-3">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-bold">
              WHAT IS YOUR MAIN GOAL FOR TODAY?
            </label>
            <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] mt-0.5">
              Select your focus area:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {GOAL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition cursor-pointer min-h-[44px] ${
                    isSelected
                      ? 'border-[#1F5EFF] bg-[#1F5EFF]/10 text-[#1F5EFF] dark:border-[#3B75FF] dark:text-[#8BB2FF] shadow-2xs'
                      : 'border-[#DDDCD6] dark:border-[#2C2C28] text-[#171717] dark:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="text-base shrink-0">{cat.emoji}</span>
                  <span className="truncate">{cat.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Goal / Intention */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-3">
          <div>
            <label
              htmlFor="session-title-input"
              className="block text-xs uppercase tracking-widest text-[#171717] dark:text-[#EBEAE5] font-bold"
            >
              MAIN GOAL / INTENTION
            </label>
            <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] mt-0.5">
              What do you want to work on or accomplish?
            </p>
          </div>

          {/* Quick sentence starters */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {TASK_STARTERS.map((starter, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyTaskStarter(starter)}
                className="text-[11px] py-1 px-2.5 rounded-lg border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/80 dark:bg-[#20201D] text-[#171717] dark:text-[#EBEAE5] hover:border-[#1F5EFF] hover:text-[#1F5EFF] transition cursor-pointer"
              >
                {starter}
              </button>
            ))}
          </div>

          <input
            id="session-title-input"
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. I want to study... or I want to research... or I want to call..."
            data-clarity-mask="true"
            className="w-full text-base sm:text-lg font-medium bg-transparent border-b-2 border-[#DDDCD6] dark:border-[#2C2C28] pb-2 text-[#171717] dark:text-[#EBEAE5] placeholder-[#9E9D97] dark:placeholder-[#6F6F6A] focus:border-[#1F5EFF] dark:focus:border-[#3B75FF] outline-hidden transition"
          />
        </div>

        {/* Step 1: First Micro-Action */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-3">
          <div>
            <label
              htmlFor="session-step-input"
              className="block text-xs uppercase tracking-widest text-[#1F5EFF] font-bold"
            >
              STEP 1: FIRST MICRO-ACTION
            </label>
            <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] mt-0.5">
              The very first micro-action to do right when you sit down:
            </p>
          </div>

          {/* Next immediate task starters */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {NEXT_STEP_STARTERS.map((starter, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyNextStepStarter(starter)}
                className="text-[11px] py-1 px-2.5 rounded-lg border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/80 dark:bg-[#20201D] text-[#171717] dark:text-[#EBEAE5] hover:border-[#1F5EFF] hover:text-[#1F5EFF] transition cursor-pointer"
              >
                {starter}
              </button>
            ))}
          </div>

          <input
            id="session-step-input"
            type="text"
            required
            value={currentStep}
            onChange={(e) => {
              setCurrentStep(e.target.value);
              setDismissedSuggestion(false);
            }}
            placeholder="e.g. First, open the document... or First, read page 5..."
            data-clarity-mask="true"
            className="w-full text-base sm:text-lg bg-transparent border-b-2 border-[#DDDCD6] dark:border-[#2C2C28] pb-2 text-[#171717] dark:text-[#EBEAE5] placeholder-[#9E9D97] dark:placeholder-[#6F6F6A] focus:border-[#1F5EFF] dark:focus:border-[#3B75FF] outline-hidden transition"
          />

          {showSuggestion && qualityCheck.suggestion && (
            <div
              id="next-step-suggestion-box"
              className="mt-3 p-3.5 rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] bg-white/70 dark:bg-[#22221F] text-xs transition"
            >
              <div className="flex items-center gap-1.5 text-[#1F5EFF] font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Make your next task even smaller?</span>
              </div>
              <p className="text-[#6F6F6A] dark:text-[#9E9D97] mb-2 leading-relaxed">
                <span className="line-through opacity-70">&ldquo;{qualityCheck.original}&rdquo;</span> could become:
                <br />
                <strong className="text-[#171717] dark:text-[#EBEAE5]">&ldquo;{qualityCheck.suggestion}&rdquo;</strong>
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="suggestion-apply-btn"
                  onClick={handleApplySuggestion}
                  className="px-3 py-1.5 rounded-lg bg-[#1F5EFF] text-white font-medium hover:bg-[#1a50db] transition flex items-center gap-1 cursor-pointer min-h-[36px]"
                >
                  <Check className="w-3 h-3" />
                  <span>Use smaller step</span>
                </button>
                <button
                  type="button"
                  id="suggestion-dismiss-btn"
                  onClick={() => setDismissedSuggestion(true)}
                  className="px-3 py-1.5 rounded-lg text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] transition cursor-pointer min-h-[36px]"
                >
                  Keep as is
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: CONTEXT OR REMINDER */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-2">
          <div>
            <label
              htmlFor="session-reminder-input"
              className="block text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-bold"
            >
              CONTEXT OR REMINDER <span className="text-[10px] font-normal normal-case opacity-70">(optional)</span>
            </label>
            <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] mt-0.5">
              Quick context to help you remember where you left off:
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 pb-1">
            {REMINDER_STARTERS.map((starter, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyReminderStarter(starter)}
                className="text-[11px] py-1 px-2.5 rounded-lg border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/80 dark:bg-[#20201D] text-[#171717] dark:text-[#EBEAE5] hover:border-[#1F5EFF] hover:text-[#1F5EFF] transition cursor-pointer"
              >
                {starter}
              </button>
            ))}
          </div>

          <input
            id="session-reminder-input"
            type="text"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            placeholder="e.g. Left off at paragraph 3... or File is saved in downloads..."
            data-clarity-mask="true"
            className="w-full text-xs sm:text-sm bg-transparent border-b border-[#DDDCD6] dark:border-[#2C2C28] pb-2 text-[#171717] dark:text-[#EBEAE5] placeholder-[#9E9D97] dark:placeholder-[#6F6F6A] focus:border-[#1F5EFF] dark:focus:border-[#3B75FF] outline-hidden transition"
          />
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            id="create-session-submit-btn"
            type="submit"
            disabled={!title.trim() || !currentStep.trim()}
            className="w-full h-12 sm:h-13 rounded-xl bg-[#1F5EFF] hover:bg-[#1a50db] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm sm:text-base shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Begin Focus Session</span>
          </button>
        </div>
      </form>
    </div>
  );
};
