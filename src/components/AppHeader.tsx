import React from 'react';
import { ActiveScreen, SessionRecord } from '../types/session';
import { History, BarChart2, Settings, CheckCircle2, Pause, Play, ArrowRight } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface AppHeaderProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  activeSession?: SessionRecord | null;
  isTimerRunning?: boolean;
  activeSeconds?: number;
  onToggleTimerPause?: () => void;
  onReturnToFocus?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentScreen,
  onNavigate,
  activeSession,
  isTimerRunning = false,
  activeSeconds = 0,
  onToggleTimerPause,
  onReturnToFocus,
}) => {
  if (currentScreen === 'onboarding') return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    const hrs = Math.floor(mins / 60);
    const remM = mins % 60;
    if (hrs > 0) {
      return `${hrs}:${remM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const showActiveStatusInOtherScreens =
    activeSession &&
    (currentScreen === 'history' ||
      currentScreen === 'accountability' ||
      currentScreen === 'pattern' ||
      currentScreen === 'settings' ||
      currentScreen === 'privacy' ||
      currentScreen === 'community');

  return (
    <div id="app-header-container" className="w-full mb-4 sm:mb-6">
      <header
        id="app-header"
        className="w-full flex items-center justify-between py-3.5 sm:py-4 border-b border-[#DDDCD6]/60 dark:border-[#2C2C28]/60"
      >
        <button
          id="nav-logo-btn"
          onClick={() => onNavigate('now')}
          className="flex items-center gap-2 group text-left cursor-pointer min-h-[44px] px-1 -ml-1"
          aria-label="Go to REMAP Workspace"
        >
          <span className="font-bold tracking-tight text-xl text-[#171717] dark:text-[#EBEAE5] group-hover:opacity-80 transition font-sans">
            REMAP
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#1F5EFF]" />
        </button>

        {/* Mobile Header Actions (Clean, uncluttered, no squished buttons) */}
        <div className="flex sm:hidden items-center gap-2">
          <PWAInstallButton />
          {activeSession && currentScreen !== 'now' && (
            <button
              onClick={() => onNavigate('now')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1F5EFF] text-white text-xs font-semibold cursor-pointer min-h-[36px]"
              title="Return to active focus"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isTimerRunning ? 'bg-white animate-pulse' : 'bg-white/80'}`} />
              <span className="font-mono tabular-nums">{formatTimer(activeSeconds)}</span>
            </button>
          )}
        </div>

        {/* Desktop Navigation (sm:flex) */}
        <nav className="hidden sm:flex items-center gap-1.5" aria-label="Main navigation">
          <PWAInstallButton />

          <button
            id="nav-now-btn"
            onClick={() => onNavigate('now')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer min-h-[44px] ${
              currentScreen === 'now' || currentScreen === 'create'
                ? 'bg-[#171717] text-[#F7F6F2] dark:bg-[#EBEAE5] dark:text-[#171717] shadow-xs'
                : 'text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title="Active workspace"
          >
            <span>Workspace</span>
          </button>

          <button
            id="nav-accountability-btn"
            onClick={() => onNavigate('accountability')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer min-h-[44px] ${
              currentScreen === 'accountability'
                ? 'bg-[#171717] text-[#F7F6F2] dark:bg-[#EBEAE5] dark:text-[#171717] shadow-xs'
                : 'text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title="Accountability & Actions"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accountability</span>
          </button>

          <button
            id="nav-history-btn"
            onClick={() => onNavigate('history')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer min-h-[44px] ${
              currentScreen === 'history'
                ? 'bg-[#171717] text-[#F7F6F2] dark:bg-[#EBEAE5] dark:text-[#171717] shadow-xs'
                : 'text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title="Session history & logs"
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>

          <button
            id="nav-pattern-btn"
            onClick={() => onNavigate('pattern')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer min-h-[44px] ${
              currentScreen === 'pattern'
                ? 'bg-[#171717] text-[#F7F6F2] dark:bg-[#EBEAE5] dark:text-[#171717] shadow-xs'
                : 'text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title="Pattern & Analytics (Today, Weekly, Monthly)"
          >
            <BarChart2 className="w-4 h-4" />
            <span>Pattern</span>
          </button>

          <button
            id="nav-settings-btn"
            onClick={() => onNavigate('settings')}
            className={`flex items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition cursor-pointer min-h-[44px] min-w-[44px] ${
              currentScreen === 'settings' || currentScreen === 'privacy' || currentScreen === 'community'
                ? 'bg-[#171717] text-[#F7F6F2] dark:bg-[#EBEAE5] dark:text-[#171717] shadow-xs'
                : 'text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </nav>
      </header>

      {/* Sleek, non-intrusive live focus status bar when browsing other tabs */}
      {showActiveStatusInOtherScreens && (
        <div
          id="header-live-focus-status"
          className="mt-2.5 px-3 py-2 rounded-xl border border-[#1F5EFF]/30 bg-[#1F5EFF]/5 dark:bg-[#1F5EFF]/10 flex items-center justify-between gap-2 text-xs"
        >
          <div className="flex items-center gap-2 truncate min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              {isTimerRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1F5EFF] opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isTimerRunning ? 'bg-[#1F5EFF]' : 'bg-[#6F6F6A]'
                }`}
              />
            </span>

            <span className="font-mono tabular-nums font-bold text-[#1F5EFF] shrink-0">
              {formatTimer(activeSeconds)}
            </span>

            <span className="text-[#6F6F6A] dark:text-[#9E9D97] truncate">
              Focus: <strong className="text-[#171717] dark:text-[#EBEAE5] font-medium">{activeSession.title}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onToggleTimerPause && (
              <button
                type="button"
                onClick={onToggleTimerPause}
                className="px-2 py-1 rounded-lg border border-[#DDDCD6] dark:border-[#2C2C28] bg-white dark:bg-[#1C1C1A] text-[11px] font-medium text-[#171717] dark:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer flex items-center gap-1"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-3 h-3 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Resume</span>
                  </>
                )}
              </button>
            )}

            {onReturnToFocus && (
              <button
                type="button"
                onClick={onReturnToFocus}
                className="px-2.5 py-1 rounded-lg bg-[#1F5EFF] text-white text-[11px] font-semibold hover:bg-[#1a50db] transition cursor-pointer flex items-center gap-1"
              >
                <span>Focus</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
