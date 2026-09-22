import React, { useState } from 'react';
import { SessionRecord, AccountabilityOutcome } from '../types/session';
import { Check, ArrowRight, Clock, X, Play, Minimize2, Wrench } from 'lucide-react';

interface AccountabilityModalProps {
  session: SessionRecord;
  onSelectOutcome: (outcome: AccountabilityOutcome, note?: string) => void;
  onContinueTask?: (session: SessionRecord) => void;
  onDismiss: () => void;
}

export const AccountabilityModal: React.FC<AccountabilityModalProps> = ({
  session,
  onSelectOutcome,
  onContinueTask,
  onDismiss,
}) => {
  const [showAdaptInput, setShowAdaptInput] = useState(false);
  const [adaptNote, setAdaptNote] = useState('');
  const [showReduceInput, setShowReduceInput] = useState(false);
  const [reducedStep, setReducedStep] = useState('');

  const handleConfirmReduce = () => {
    if (reducedStep.trim()) {
      onSelectOutcome('reduced', `Reduced task to: ${reducedStep.trim()}`);
    } else {
      onSelectOutcome('reduced', 'Reduced to a smaller micro-step');
    }
  };

  const handleConfirmAdapt = () => {
    if (adaptNote.trim()) {
      onSelectOutcome('adapted', adaptNote.trim());
    } else {
      onSelectOutcome('adapted', 'Adapted task strategy');
    }
  };

  return (
    <div
      id="accountability-decision-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="accountability-modal-card"
        className="w-full max-w-md rounded-2xl border border-[#DDDCD6] dark:border-[#2C2C28] bg-[#FDFDFB] dark:bg-[#1C1C1A] p-5 sm:p-6 shadow-2xl text-[#171717] dark:text-[#EBEAE5] space-y-4 animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#DDDCD6]/60 dark:border-[#2C2C28]/60">
          <span className="text-[11px] uppercase tracking-widest text-[#1F5EFF] font-bold">
            ACCOUNTABILITY &amp; LEARNING
          </span>
          <button
            onClick={onDismiss}
            className="p-1 text-[#6F6F6A] hover:text-[#171717] dark:hover:text-[#EBEAE5] transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5]">
            Check Commitment Outcome
          </h2>
          <p
            className="text-sm font-semibold text-[#171717] dark:text-[#EBEAE5] line-clamp-2"
            data-clarity-mask="true"
          >
            {session.title}
          </p>
          <div className="pt-0.5 text-xs text-[#6F6F6A] dark:text-[#9E9D97]">
            Immediate step: <span className="font-medium text-[#171717] dark:text-[#EBEAE5]">&ldquo;{session.currentStep}&rdquo;</span>
          </div>
        </div>

        {/* Reduction Form */}
        {showReduceInput ? (
          <div className="p-3.5 rounded-xl border border-[#1F5EFF]/30 bg-[#1F5EFF]/5 dark:bg-[#1F5EFF]/10 space-y-3 animate-in fade-in duration-150">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#1F5EFF] flex items-center gap-1.5">
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Make it smaller (Fogg Behavior Model)</span>
              </span>
              <p className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
                When motivation or energy is low, reduce the step to a 2-minute starter action.
              </p>
            </div>
            <input
              type="text"
              value={reducedStep}
              onChange={(e) => setReducedStep(e.target.value)}
              placeholder="e.g. Read just 1 paragraph, write 1 sentence..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#DDDCD6] dark:border-[#2C2C28] bg-white dark:bg-[#141412] text-[#171717] dark:text-[#EBEAE5] focus:outline-hidden focus:border-[#1F5EFF]"
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowReduceInput(false)}
                className="px-2.5 py-1 text-xs text-[#6F6F6A] dark:text-[#9E9D97] hover:underline cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmReduce}
                className="px-3 py-1.5 text-xs rounded-lg bg-[#1F5EFF] text-white font-semibold hover:bg-[#1a50db] cursor-pointer"
              >
                Save Reduced Action
              </button>
            </div>
          </div>
        ) : showAdaptInput ? (
          <div className="p-3.5 rounded-xl border border-[#8A508F]/30 bg-[#8A508F]/5 dark:bg-[#8A508F]/10 space-y-3 animate-in fade-in duration-150">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#8A508F] dark:text-[#C586C0] flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span>Adapt the Strategy</span>
              </span>
              <p className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
                What changed or what information is needed to move forward?
              </p>
            </div>
            <input
              type="text"
              value={adaptNote}
              onChange={(e) => setAdaptNote(e.target.value)}
              placeholder="e.g. Need to email Alex first before continuing..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#DDDCD6] dark:border-[#2C2C28] bg-white dark:bg-[#141412] text-[#171717] dark:text-[#EBEAE5] focus:outline-hidden focus:border-[#8A508F]"
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAdaptInput(false)}
                className="px-2.5 py-1 text-xs text-[#6F6F6A] dark:text-[#9E9D97] hover:underline cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmAdapt}
                className="px-3 py-1.5 text-xs rounded-lg bg-[#8A508F] text-white font-semibold hover:opacity-90 cursor-pointer"
              >
                Save Adaptation
              </button>
            </div>
          </div>
        ) : (
          /* Core Options: Complete, Reschedule, Reduce, Adapt, Cancel */
          <div className="space-y-2">
            {onContinueTask && session.status !== 'completed' && (
              <button
                id="outcome-continue-now-btn"
                onClick={() => onContinueTask(session)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#1F5EFF] hover:bg-[#1a50db] active:scale-[0.99] text-white flex items-center justify-between transition cursor-pointer min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-semibold">FOCUS ON THIS NOW</p>
                    <p className="text-[10px] text-white/80">Switch to this task and start the focus timer.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            )}

            <button
              id="outcome-done-btn"
              onClick={() => onSelectOutcome('done')}
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#3C7A57] hover:bg-[#346b4c] active:scale-[0.99] text-white flex items-center justify-between transition cursor-pointer min-h-[44px]"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 stroke-[2.5]" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-semibold">DONE</p>
                  <p className="text-[10px] text-white/80">Completed as planned.</p>
                </div>
              </div>
              <span className="text-xs font-mono font-medium opacity-80">+100</span>
            </button>

            <button
              id="outcome-move-tomorrow-btn"
              onClick={() => onSelectOutcome('moved_to_tomorrow')}
              className="w-full py-2 px-3.5 rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.99] text-[#171717] dark:text-[#EBEAE5] flex items-center justify-between transition cursor-pointer min-h-[40px]"
            >
              <div className="flex items-center gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-[#1F5EFF]" />
                <div className="text-left">
                  <p className="text-xs font-semibold">RESCHEDULE FOR TOMORROW</p>
                  <p className="text-[10px] text-[#6F6F6A] dark:text-[#9E9D97]">Preserves history and intention without guilt.</p>
                </div>
              </div>
              <span className="text-[10px] text-[#6F6F6A] dark:text-[#9E9D97]">Transfer</span>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowReduceInput(true)}
                className="py-2 px-3 rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] hover:bg-black/5 dark:hover:bg-white/5 text-left text-xs transition cursor-pointer flex items-center gap-2 min-h-[40px]"
              >
                <Minimize2 className="w-3.5 h-3.5 text-[#1F5EFF] shrink-0" />
                <div>
                  <span className="font-semibold block text-[11px]">REDUCE SCOPE</span>
                  <span className="text-[10px] text-[#6F6F6A] dark:text-[#9E9D97]">Make it smaller</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowAdaptInput(true)}
                className="py-2 px-3 rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] hover:bg-black/5 dark:hover:bg-white/5 text-left text-xs transition cursor-pointer flex items-center gap-2 min-h-[40px]"
              >
                <Wrench className="w-3.5 h-3.5 text-[#8A508F] shrink-0" />
                <div>
                  <span className="font-semibold block text-[11px]">ADAPT PLAN</span>
                  <span className="text-[10px] text-[#6F6F6A] dark:text-[#9E9D97]">Adjust strategy</span>
                </div>
              </button>
            </div>

            <button
              id="outcome-cancel-btn"
              onClick={() => onSelectOutcome('cancelled')}
              className="w-full py-1.5 px-3 text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#B84A4A] text-left text-[11px] cursor-pointer"
            >
              Skip or cancel task — no longer relevant (no penalty)
            </button>
          </div>
        )}

        <p className="text-[11px] text-center text-[#6F6F6A] dark:text-[#9E9D97] pt-2 border-t border-[#DDDCD6]/60 dark:border-[#2C2C28]/60">
          REMAP replaces shame with metacognitive clarity: adapt when friction happens.
        </p>
      </div>
    </div>
  );
};
