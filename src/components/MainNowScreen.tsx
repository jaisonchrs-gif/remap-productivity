import React, { useState, useMemo } from 'react';
import { SessionRecord, GoalCategory, StuckBlocker } from '../types/session';
import {
  ArrowRight,
  Plus,
  CheckCircle2,
  Calendar,
  CheckSquare,
  Play,
  Sparkles,
  Edit2,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { GOAL_CATEGORIES, TASK_STARTERS } from '../data/goalCategories';
import { WaveformTimer } from './WaveformTimer';
import { UpdateNextStepModal } from './UpdateNextStepModal';

interface MainNowScreenProps {
  session: SessionRecord | null;
  allSessions: SessionRecord[];
  isTimerRunning: boolean;
  currentLapSeconds: number;
  previousTotalSeconds: number;
  onToggleTimer: () => void;
  onStartNew: (initialCategory?: GoalCategory, initialTaskStarter?: string) => void;
  onRequestFinishGoal: () => void;
  onUpdateStep: (newStep: string, previousStepCompleted: string) => void;
  onOpenAccountabilityModal: (sessionToReview?: SessionRecord) => void;
  onSwitchToTask: (task: SessionRecord) => void;
  onLogFriction?: (blocker: StuckBlocker, note?: string) => void;
}

export const MainNowScreen: React.FC<MainNowScreenProps> = ({
  session,
  allSessions,
  isTimerRunning,
  currentLapSeconds,
  previousTotalSeconds,
  onToggleTimer,
  onStartNew,
  onRequestFinishGoal,
  onUpdateStep,
  onOpenAccountabilityModal,
  onSwitchToTask,
  onLogFriction,
}) => {
  const [selectedQuickGoal, setSelectedQuickGoal] = useState<GoalCategory>('studies');
  const [showStepModal, setShowStepModal] = useState(false);
  const [isEditingStepInline, setIsEditingStepInline] = useState(false);
  const [inlineStepText, setInlineStepText] = useState('');
  const [showFrictionHelper, setShowFrictionHelper] = useState(false);
  const [showCompletedSteps, setShowCompletedSteps] = useState(false);
  const [showStartersDropdown, setShowStartersDropdown] = useState(false);
  const [selectedBlocker, setSelectedBlocker] = useState<StuckBlocker | null>(null);
  const [blockerNote, setBlockerNote] = useState('');

  // Filter previous tasks (excluding currently displayed session)
  const otherTasks = allSessions.filter((s) => s.id !== session?.id);
  const otherUnfinished = otherTasks.filter(
    (s) => s.status !== 'completed' && s.status !== 'cancelled'
  );
  const displayTasks = otherUnfinished.length > 0 ? otherUnfinished : otherTasks;

  const isFirstTimeUser = allSessions.length === 0 && !session;
  const activeQuickCategory =
    GOAL_CATEGORIES.find((c) => c.id === selectedQuickGoal) || GOAL_CATEGORIES[0];

  const handleStartInlineEdit = () => {
    if (!session) return;
    setInlineStepText(session.currentStep);
    setIsEditingStepInline(true);
  };

  const handleSaveInlineEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !inlineStepText.trim()) return;
    onUpdateStep(inlineStepText.trim(), session.lastCompleted || 'Adjusted next step');
    setIsEditingStepInline(false);
  };

  const handleSaveBlocker = () => {
    if (selectedBlocker && onLogFriction) {
      onLogFriction(selectedBlocker, blockerNote.trim() || undefined);
      setShowFrictionHelper(false);
      setSelectedBlocker(null);
      setBlockerNote('');
    }
  };

  // -------------------------------------------------------------
  // 1. FIRST-TIME USER SCREEN (Intention & Plan onboarding)
  // -------------------------------------------------------------
  if (isFirstTimeUser) {
    return (
      <div
        id="first-time-welcome-screen"
        className="py-4 sm:py-6 space-y-6 sm:space-y-8"
      >
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1F5EFF]/10 text-[#1F5EFF] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to REMAP</span>
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5] leading-tight">
            What is your main goal right now?
          </h1>
          <p className="text-sm text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed max-w-lg">
            Built on cognitive psychology: clarify your goal, break it into an immediate micro-action, focus without distraction, and reflect on progress.
          </p>
        </div>

        {/* Goal Category Grid */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/60 dark:bg-[#1C1C1A]/60 space-y-4">
          <span className="block text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-bold">
            1. CHOOSE FOCUS AREA
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {GOAL_CATEGORIES.map((cat) => {
              const isSelected = selectedQuickGoal === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedQuickGoal(cat.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-semibold transition cursor-pointer min-h-[46px] ${
                    isSelected
                      ? 'border-[#1F5EFF] bg-[#1F5EFF]/10 text-[#1F5EFF] dark:border-[#3B75FF] dark:text-[#8BB2FF]'
                      : 'border-[#DDDCD6]/80 dark:border-[#2C2C28] text-[#171717] dark:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="text-base shrink-0">{cat.emoji}</span>
                  <span className="truncate">{cat.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Action button to create */}
          <div className="pt-2">
            <button
              id="first-time-start-btn"
              onClick={() => onStartNew(selectedQuickGoal)}
              className="w-full h-12 flex items-center justify-between px-6 rounded-xl bg-[#1F5EFF] hover:bg-[#1a50db] active:scale-[0.99] text-white font-semibold text-sm transition cursor-pointer shadow-xs"
            >
              <span>Start {activeQuickCategory.shortLabel} Intention</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sentence Starters Accordion (Progressive Disclosure) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#DDDCD6]/70 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-2">
          <button
            type="button"
            onClick={() => setShowStartersDropdown(!showStartersDropdown)}
            className="w-full flex items-center justify-between text-xs font-semibold text-[#171717] dark:text-[#EBEAE5] cursor-pointer py-1"
          >
            <span className="flex items-center gap-2">
              <span>💡 Need inspiration? Sentence starters</span>
            </span>
            {showStartersDropdown ? <ChevronUp className="w-4 h-4 text-[#6F6F6A]" /> : <ChevronDown className="w-4 h-4 text-[#6F6F6A]" />}
          </button>

          {showStartersDropdown && (
            <div className="flex flex-wrap gap-2 pt-2">
              {TASK_STARTERS.map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onStartNew(selectedQuickGoal, starter.replace('...', ' '))}
                  className="py-2 px-3 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white dark:bg-[#1C1C1A] text-xs font-medium text-[#171717] dark:text-[#EBEAE5] hover:border-[#1F5EFF] hover:text-[#1F5EFF] transition cursor-pointer min-h-[40px]"
                >
                  {starter}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-center text-xs text-[#6F6F6A] dark:text-[#9E9D97]">
          <span>💡 100% on-device private local storage. No sign-in required.</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. RETURNING USER WITH NO ACTIVE SESSION (Clean, Uncluttered Workspace)
  // -------------------------------------------------------------
  if (!session) {
    return (
      <div
        id="empty-state-screen"
        className="py-4 sm:py-6 space-y-6 sm:space-y-7"
      >
        <div className="space-y-1.5">
          <span className="text-xs uppercase tracking-widest text-[#1F5EFF] font-bold">
            WORKSPACE READY
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5]">
            What is your main intention now?
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed">
            Select a focus category or resume a previous task to begin.
          </p>
        </div>

        {/* Primary Start Intention Card (Unified, No nested cards) */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/60 dark:bg-[#1C1C1A]/60 space-y-4 shadow-xs">
          <span className="block text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-bold">
            SELECT FOCUS AREA
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {GOAL_CATEGORIES.map((cat) => {
              const isSelected = selectedQuickGoal === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedQuickGoal(cat.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-semibold transition cursor-pointer min-h-[46px] ${
                    isSelected
                      ? 'border-[#1F5EFF] bg-[#1F5EFF]/10 text-[#1F5EFF] dark:border-[#3B75FF] dark:text-[#8BB2FF]'
                      : 'border-[#DDDCD6]/80 dark:border-[#2C2C28] text-[#171717] dark:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="text-base shrink-0">{cat.emoji}</span>
                  <span className="truncate">{cat.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <button
            id="start-work-from-goal-btn"
            onClick={() => onStartNew(selectedQuickGoal)}
            className="w-full h-12 flex items-center justify-between px-6 rounded-xl bg-[#1F5EFF] hover:bg-[#1a50db] active:scale-[0.99] text-white font-semibold text-sm shadow-xs transition cursor-pointer"
          >
            <span>Set {activeQuickCategory.shortLabel} Goal &amp; Micro-Action</span>
            <Plus className="w-5 h-5" />
          </button>

          {/* Sentence Starters Accordion (Clean Progressive Disclosure) */}
          <div className="pt-2 border-t border-[#DDDCD6]/60 dark:border-[#2C2C28]/60">
            <button
              type="button"
              onClick={() => setShowStartersDropdown(!showStartersDropdown)}
              className="w-full flex items-center justify-between text-xs font-medium text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] py-1 cursor-pointer transition"
            >
              <span>💡 Need a starter prompt?</span>
              {showStartersDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showStartersDropdown && (
              <div className="flex flex-wrap gap-2 pt-2.5">
                {TASK_STARTERS.map((starter, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onStartNew(selectedQuickGoal, starter.replace('...', ' '))}
                    className="py-2 px-3 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white dark:bg-[#1C1C1A] text-xs font-medium text-[#171717] dark:text-[#EBEAE5] hover:border-[#1F5EFF] hover:text-[#1F5EFF] transition cursor-pointer min-h-[40px]"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section: CONTINUE PENDING TASKS (Clean, Uncluttered List) */}
        {displayTasks.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-t border-[#DDDCD6]/60 dark:border-[#2C2C28]/60 pt-4">
              <span className="text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-bold">
                PENDING TASKS ({displayTasks.length})
              </span>
            </div>

            <div className="space-y-2.5">
              {displayTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/50 dark:bg-[#1C1C1A]/50 flex items-center justify-between gap-3 hover:bg-black/2 dark:hover:bg-white/2 transition"
                >
                  <div className="min-w-0 pr-2 space-y-0.5">
                    <h4
                      className="text-sm font-semibold text-[#171717] dark:text-[#EBEAE5] truncate"
                      data-clarity-mask="true"
                    >
                      {task.title}
                    </h4>
                    <p
                      className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] truncate"
                      data-clarity-mask="true"
                    >
                      Next step: {task.currentStep}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onSwitchToTask(task)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1F5EFF] text-white text-xs font-semibold hover:bg-[#1a50db] transition cursor-pointer min-h-[40px]"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Focus</span>
                    </button>

                    <button
                      onClick={() => onOpenAccountabilityModal(task)}
                      className="p-2 rounded-lg border border-[#DDDCD6] dark:border-[#2C2C28] text-xs font-medium text-[#6F6F6A] hover:text-[#171717] dark:hover:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Check outcome"
                    >
                      <CheckSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. USER WITH ACTIVE FOCUS TASK (Unified, Calm, Beautiful Hierarchy)
  // -------------------------------------------------------------
  const matchedCategory = GOAL_CATEGORIES.find((c) => c.id === session.goalCategory);

  const completedStepsList: string[] = useMemo(() => {
    if (session.completedSteps && session.completedSteps.length > 0) {
      return session.completedSteps;
    }
    if (session.lastCompleted) {
      return [session.lastCompleted];
    }
    return [];
  }, [session.completedSteps, session.lastCompleted]);

  const currentStepNumber = completedStepsList.length + 1;

  return (
    <div id="main-now-screen" className="py-2 space-y-5 sm:space-y-6">
      {/* Commitment transfer history badge if any */}
      {session.transfers && session.transfers.length > 0 && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1F5EFF]/10 text-[#1F5EFF] text-xs font-medium">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            Transferred {session.transfers.length}{' '}
            {session.transfers.length === 1 ? 'time' : 'times'} (history preserved)
          </span>
        </div>
      )}

      {/* UNIFIED FOCUS CANVAS (No nested cards; single calm, high-contrast focal area) */}
      <div className="p-5 sm:p-7 rounded-2xl border border-[#DDDCD6]/90 dark:border-[#2C2C28] bg-white/70 dark:bg-[#1C1C1A]/70 shadow-xs space-y-6">
        {/* Context Header: Main Goal & Step Progression */}
        <div className="space-y-2 border-b border-[#DDDCD6]/60 dark:border-[#2C2C28]/60 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider text-[#6F6F6A] dark:text-[#9E9D97] uppercase flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#1F5EFF]" />
                <span>MAIN GOAL</span>
              </span>
              {matchedCategory && (
                <span className="text-[11px] font-semibold text-[#1F5EFF] bg-[#1F5EFF]/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span>{matchedCategory.emoji}</span>
                  <span>{matchedCategory.shortLabel}</span>
                </span>
              )}
            </div>

            {/* Step Sequence Pills */}
            <div className="flex items-center gap-1.5 text-[11px]">
              {completedStepsList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCompletedSteps(!showCompletedSteps)}
                  className="font-medium text-[#3C7A57] bg-[#3C7A57]/10 hover:bg-[#3C7A57]/20 px-2 py-0.5 rounded-md flex items-center gap-1 transition cursor-pointer"
                  title="Toggle completed steps list"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{completedStepsList.length} done</span>
                </button>
              )}
              <span className="font-bold text-[#1F5EFF] bg-[#1F5EFF]/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isTimerRunning ? 'bg-[#1F5EFF] animate-pulse' : 'bg-[#1F5EFF]'}`} />
                <span>Step {currentStepNumber}</span>
              </span>
            </div>
          </div>

          <h1
            id="now-work-title"
            data-clarity-mask="true"
            className="text-base sm:text-lg font-semibold text-[#171717] dark:text-[#EBEAE5] leading-snug"
          >
            {session.title}
          </h1>

          {/* Expandable completed steps archive */}
          {showCompletedSteps && completedStepsList.length > 0 && (
            <div className="pt-2 pb-1 space-y-1.5">
              {completedStepsList.map((st, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#6F6F6A] dark:text-[#9E9D97]">
                  <span className="font-semibold text-[#3C7A57] shrink-0">✓ Step {i + 1}:</span>
                  <span className="line-through text-[#171717]/70 dark:text-[#EBEAE5]/70 truncate">{st}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HERO FOCAL SECTION: IMMEDIATE MICRO-ACTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F5EFF]">
              STEP {currentStepNumber} · IMMEDIATE ACTION
            </span>
            <span className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
              Focus on this single step
            </span>
          </div>

          {/* Action text or Inline edit form */}
          {isEditingStepInline ? (
            <form onSubmit={handleSaveInlineEdit} className="space-y-2">
              <input
                type="text"
                value={inlineStepText}
                onChange={(e) => setInlineStepText(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 text-base font-semibold rounded-xl border border-[#1F5EFF] bg-white dark:bg-[#141412] text-[#171717] dark:text-[#EBEAE5] focus:outline-hidden"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditingStepInline(false)}
                  className="px-3 py-1.5 text-xs text-[#6F6F6A] dark:text-[#9E9D97] hover:underline cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#1F5EFF] text-white hover:bg-[#1a50db] cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <p
                id="now-next-step"
                data-clarity-mask="true"
                className="text-xl sm:text-2xl font-bold text-[#171717] dark:text-[#EBEAE5] leading-snug tracking-tight"
              >
                {session.currentStep}
              </p>
              <button
                type="button"
                onClick={handleStartInlineEdit}
                className="p-1.5 text-[#6F6F6A] hover:text-[#171717] dark:hover:text-[#EBEAE5] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer shrink-0 transition"
                title="Edit action text"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Primary Action Button (Fitts's Law, 48px height, 2x horizontal padding) */}
          <div className="pt-2">
            <button
              id="done-with-step-btn"
              type="button"
              onClick={() => setShowStepModal(true)}
              className="w-full h-12 flex items-center justify-center gap-2 px-6 rounded-xl bg-[#1F5EFF] hover:bg-[#1a50db] active:scale-[0.99] text-white font-semibold text-sm shadow-xs transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Step {currentStepNumber} &amp; Set Step {currentStepNumber + 1}</span>
            </button>
          </div>
        </div>

        {/* TIMER SECTION (Integrated Waveform Stopwatch) */}
        <div className="pt-1">
          <WaveformTimer
            currentLapSeconds={currentLapSeconds}
            previousTotalSeconds={previousTotalSeconds}
            laps={session.sessions || []}
            isRunning={isTimerRunning}
            onTogglePause={onToggleTimer}
            showPauseButton={true}
          />
        </div>

        {/* PAUSED CONTEXT & FRICTION HELPER (Progressive Disclosure) */}
        {!isTimerRunning && (
          <div className="pt-3 border-t border-[#DDDCD6]/60 dark:border-[#2C2C28]/60 space-y-3 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-semibold text-[#6F6F6A] dark:text-[#9E9D97] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Timer paused · Context preserved</span>
              </span>
              <button
                type="button"
                onClick={() => setShowFrictionHelper(!showFrictionHelper)}
                className="text-[#1F5EFF] hover:underline font-semibold cursor-pointer"
              >
                {showFrictionHelper ? 'Hide friction helper' : 'Facing friction or stuck?'}
              </button>
            </div>

            {session.lastCompleted && (
              <p className="text-[#6F6F6A] dark:text-[#9E9D97]">
                Last completed: <strong className="text-[#171717] dark:text-[#EBEAE5] font-semibold">{session.lastCompleted}</strong>
              </p>
            )}

            {/* Friction Helper Grid */}
            {showFrictionHelper && (
              <div className="p-3.5 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-black/2 dark:bg-white/2 space-y-2.5">
                <span className="font-bold text-[#171717] dark:text-[#EBEAE5] block">
                  Identify Friction (COM-B &amp; Fogg Behavior Model)
                </span>
                <p className="text-[#6F6F6A] dark:text-[#9E9D97]">
                  What is making this hard right now?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: 'too_big' as StuckBlocker, label: 'Task feels too big' },
                    { id: 'need_info' as StuckBlocker, label: 'Missing information' },
                    { id: 'waiting_on_someone' as StuckBlocker, label: 'Waiting on someone' },
                    { id: 'lost_motivation' as StuckBlocker, label: 'Low energy / tired' },
                    { id: 'dont_know_next' as StuckBlocker, label: "Unsure of next step" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBlocker(b.id)}
                      className={`p-2 rounded-lg border text-left text-[11px] font-medium transition cursor-pointer min-h-[38px] ${
                        selectedBlocker === b.id
                          ? 'border-[#1F5EFF] bg-[#1F5EFF]/10 text-[#1F5EFF]'
                          : 'border-[#DDDCD6] dark:border-[#2C2C28] text-[#171717] dark:text-[#EBEAE5] hover:bg-black/5'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                {selectedBlocker && (
                  <div className="pt-2 space-y-2">
                    <input
                      type="text"
                      value={blockerNote}
                      onChange={(e) => setBlockerNote(e.target.value)}
                      placeholder="Optional detail on what you need to adapt..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#DDDCD6] dark:border-[#2C2C28] bg-white dark:bg-[#141412] text-[#171717] dark:text-[#EBEAE5]"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={handleSaveBlocker}
                        className="px-3.5 py-1.5 rounded-lg bg-[#171717] dark:bg-[#EBEAE5] text-white dark:text-[#171717] font-semibold text-xs cursor-pointer hover:opacity-90 min-h-[36px]"
                      >
                        Log Blocker &amp; Adapt
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* QUIET SECONDARY ACTIONS BAR (Subtle, Out of the main focus path) */}
      <div className="flex items-center justify-between flex-wrap gap-3 text-xs pt-1 px-1">
        <button
          id="trigger-accountability-check-btn"
          type="button"
          onClick={() => onOpenAccountabilityModal(session)}
          className="text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] font-medium flex items-center gap-1.5 cursor-pointer py-1.5 transition"
        >
          <CheckSquare className="w-4 h-4 text-[#1F5EFF]" />
          <span>Check outcome / adapt</span>
        </button>

        <button
          type="button"
          onClick={() => onStartNew()}
          className="text-[#1F5EFF] hover:underline font-semibold flex items-center gap-1 cursor-pointer py-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Plan another intention</span>
        </button>
      </div>

      {/* Update Next Step Modal */}
      {showStepModal && (
        <UpdateNextStepModal
          currentStep={session.currentStep}
          stepNumber={currentStepNumber}
          onSaveNewStep={(newStep) => {
            onUpdateStep(newStep, session.currentStep);
            setShowStepModal(false);
          }}
          onClose={() => setShowStepModal(false)}
        />
      )}
    </div>
  );
};
