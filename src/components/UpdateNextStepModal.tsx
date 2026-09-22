import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, X } from 'lucide-react';
import { NEXT_STEP_STARTERS } from '../data/goalCategories';

interface UpdateNextStepModalProps {
  currentStep: string;
  stepNumber?: number;
  onSaveNewStep: (newStep: string) => void;
  onClose: () => void;
}

export const UpdateNextStepModal: React.FC<UpdateNextStepModalProps> = ({
  currentStep,
  stepNumber = 1,
  onSaveNewStep,
  onClose,
}) => {
  const [newStep, setNewStep] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStep.trim()) return;
    onSaveNewStep(newStep.trim());
  };

  return (
    <div
      id="update-next-step-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#F7F6F2] dark:bg-[#1E1E1C] border border-[#DDDCD6] dark:border-[#2C2C28] p-5 sm:p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#3C7A57]/10 text-[#3C7A57]">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-[#3C7A57]">
              STEP {stepNumber} COMPLETED!
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#6F6F6A] dark:text-[#9E9D97] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#171717] dark:text-[#EBEAE5]">
            Set Step {stepNumber + 1}: Immediate Action
          </h3>
          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] mt-0.5">
            You just completed Step {stepNumber}: <span className="line-through font-medium opacity-80">&ldquo;{currentStep}&rdquo;</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <span className="block text-[11px] uppercase tracking-wider text-[#6F6F6A] dark:text-[#9E9D97] font-semibold">
              QUICK STARTERS
            </span>
            <div className="flex flex-wrap gap-1.5">
              {NEXT_STEP_STARTERS.map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNewStep(starter.replace('...', ' '))}
                  className="text-[11px] py-1 px-2.5 rounded-lg border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/80 dark:bg-[#20201D] text-[#171717] dark:text-[#EBEAE5] hover:border-[#1F5EFF] hover:text-[#1F5EFF] transition cursor-pointer"
                >
                  {starter}
                </button>
              ))}
            </div>

            <input
              type="text"
              required
              autoFocus
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              placeholder="e.g. First, open the next chapter... or First, solve question 2..."
              data-clarity-mask="true"
              className="w-full text-base font-medium bg-transparent border-b-2 border-[#1F5EFF] pb-2 text-[#171717] dark:text-[#EBEAE5] placeholder-[#9E9D97] dark:placeholder-[#6F6F6A] outline-hidden transition pt-1"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={!newStep.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-[#1F5EFF] hover:bg-[#1a50db] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <span>Save &amp; Continue Focus</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] text-xs font-semibold text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
