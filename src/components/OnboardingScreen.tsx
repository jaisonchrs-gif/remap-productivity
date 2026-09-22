import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface OnboardingScreenProps {
  onGetStarted: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onGetStarted }) => {
  return (
    <div
      id="onboarding-screen"
      className="min-h-[82vh] flex flex-col justify-between py-8 text-left animate-in fade-in duration-300"
    >
      <div className="pt-4">
        <div className="flex items-center gap-2 mb-10">
          <span className="text-xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5]">
            RESUME
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#1F5EFF]" />
        </div>

        <div className="space-y-4 max-w-lg">
          <p className="text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-semibold">
            EXTERNAL MEMORY FOR UNFINISHED WORK
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5] leading-tight">
            Pick up where you left off.
          </h1>
          <p className="text-base sm:text-lg text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed pt-2">
            Remember your last step so you can get back into work without rebuilding your mental context or starting from zero.
          </p>
        </div>
      </div>

      <div className="pt-12 space-y-4 max-w-md">
        <button
          id="onboarding-get-started-btn"
          onClick={onGetStarted}
          className="w-full h-12 flex items-center justify-between px-6 rounded-xl bg-[#1F5EFF] hover:bg-[#1a50db] active:scale-[0.99] text-white font-medium text-base shadow-sm transition"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-[#6F6F6A] dark:text-[#9E9D97] pt-1">
          <ShieldCheck className="w-4 h-4 text-[#3C7A57] shrink-0" />
          <span>No account. No setup. Your data stays on this device.</span>
        </div>
      </div>
    </div>
  );
};
