import React from 'react';
import { ActiveScreen, SessionRecord } from '../types/session';
import { Target, CheckCircle2, BarChart2, History, Settings } from 'lucide-react';

interface MobileBottomNavProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  activeSession?: SessionRecord | null;
  isTimerRunning?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentScreen,
  onNavigate,
  activeSession,
  isTimerRunning = false,
}) => {
  // Do not show bottom nav during first-time onboarding
  if (currentScreen === 'onboarding') return null;

  const navItems = [
    {
      id: 'now' as ActiveScreen,
      label: 'Now',
      icon: Target,
      badge: activeSession ? (
        <span
          className={`absolute top-1.5 right-3 w-2 h-2 rounded-full ${
            isTimerRunning ? 'bg-[#1F5EFF] animate-pulse' : 'bg-[#6F6F6A]'
          }`}
        />
      ) : null,
    },
    {
      id: 'accountability' as ActiveScreen,
      label: 'Account',
      icon: CheckCircle2,
      badge: null,
    },
    {
      id: 'pattern' as ActiveScreen,
      label: 'Pattern',
      icon: BarChart2,
      badge: null,
    },
    {
      id: 'history' as ActiveScreen,
      label: 'History',
      icon: History,
      badge: null,
    },
    {
      id: 'settings' as ActiveScreen,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-[#F7F6F2]/95 dark:bg-[#181816]/95 backdrop-blur-md border-t border-[#DDDCD6]/80 dark:border-[#2C2C28]/80 pb-[env(safe-area-inset-bottom)] transition-colors shadow-lg"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const isActive =
            currentScreen === item.id ||
            (item.id === 'settings' && (currentScreen === 'privacy' || currentScreen === 'community')) ||
            (item.id === 'now' && currentScreen === 'create');
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center gap-1 py-1 px-1 transition-all cursor-pointer min-h-[48px] select-none ${
                isActive
                  ? 'text-[#1F5EFF] dark:text-[#3B75FF] font-bold'
                  : 'text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5]'
              }`}
            >
              {item.badge}
              <div
                className={`p-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1F5EFF]/12 dark:bg-[#3B75FF]/20 text-[#1F5EFF] dark:text-[#8BB2FF] scale-105'
                    : 'text-current'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none whitespace-nowrap">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#1F5EFF] dark:bg-[#3B75FF]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
