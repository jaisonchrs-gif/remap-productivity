/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ActiveScreen,
  SessionRecord,
  AppSettings,
  StopReason,
  StuckBlocker,
  AccountabilityOutcome,
  AccountabilityRecord,
  TaskTransferRecord,
  GoalCategory,
} from './types/session';
import { storage, DEFAULT_SETTINGS } from './lib/storage';
import { analytics } from './lib/analytics';
import { useNotifications } from './hooks/useNotifications';
import { AppHeader } from './components/AppHeader';
import { OnboardingScreen } from './components/OnboardingScreen';
import { CreateSessionScreen } from './components/CreateSessionScreen';
import { MainNowScreen } from './components/MainNowScreen';
import { GoalAccomplishedModal } from './components/GoalAccomplishedModal';
import { HistoryScreen } from './components/HistoryScreen';
import { AccountabilityScreen } from './components/AccountabilityScreen';
import { PatternScreen } from './components/PatternScreen';
import { CommunityScreen } from './components/CommunityScreen';
import { PrivacyPolicyScreen } from './components/PrivacyPolicyScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AccountabilityModal } from './components/AccountabilityModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { InAppNotificationBanner } from './components/InAppNotificationBanner';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const [sessions, setSessions] = useState<SessionRecord[]>(() => storage.loadSessions());
  const [accountabilityRecords, setAccountabilityRecords] = useState<AccountabilityRecord[]>(() =>
    storage.loadAccountabilityRecords()
  );
  const [settings, setSettings] = useState<AppSettings>(() => storage.loadSettings());
  const [activeSession, setActiveSession] = useState<SessionRecord | null>(() =>
    storage.getActiveSession()
  );
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('now');
  const [accountabilityModalSession, setAccountabilityModalSession] =
    useState<SessionRecord | null>(null);
  const [showGoalAccomplished, setShowGoalAccomplished] = useState<boolean>(false);
  const [pendingGoalCategory, setPendingGoalCategory] = useState<GoalCategory>('studies');
  const [pendingTaskStarter, setPendingTaskStarter] = useState<string>('');

  // Real-time wall-clock timing ticker
  const [nowTick, setNowTick] = useState<number>(Date.now());

  const {
    isSupported,
    permission,
    inAppAlert,
    dismissInAppAlert,
    requestPermission,
    scheduleReminder,
    sendTestNotification,
  } = useNotifications();

  // -------------------------------------------------------------
  // Wall-Clock Timing Calculations (Stopwatch with Laps)
  // -------------------------------------------------------------
  const isTimerRunning = Boolean(activeSession && activeSession.status === 'active');

  useEffect(() => {
    if (!isTimerRunning) return;
    const timerInterval = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [isTimerRunning, activeSession?.id]);

  const previousTotalSeconds = useMemo(() => {
    if (!activeSession) return 0;
    return (activeSession.sessions || []).reduce((acc, s) => acc + (s.duration || 0), 0);
  }, [activeSession?.id, activeSession?.sessions]);

  const currentLapSeconds = useMemo(() => {
    if (!activeSession || activeSession.status !== 'active' || !activeSession.activeIntervalStartedAt) {
      return 0;
    }
    return Math.max(0, Math.floor((nowTick - activeSession.activeIntervalStartedAt) / 1000));
  }, [activeSession?.status, activeSession?.activeIntervalStartedAt, nowTick]);

  const totalSessionSeconds = previousTotalSeconds + currentLapSeconds;

  // Apply Theme (Light or Dark Mode)
  useEffect(() => {
    const root = document.documentElement;
    const metaTheme = document.getElementById('meta-theme-color');

    const applyThemeClass = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
        if (metaTheme) metaTheme.setAttribute('content', '#181816');
      } else {
        root.classList.remove('dark');
        if (metaTheme) metaTheme.setAttribute('content', '#F7F6F2');
      }
    };

    if (settings.theme === 'dark') {
      applyThemeClass(true);
    } else {
      applyThemeClass(false);
    }
  }, [settings.theme]);

  // Initial routing decision on app launch
  useEffect(() => {
    storage.recordAppOpen();
    analytics.logEvent('app_opened');

    const hash = window.location.hash;

    if (hash.startsWith('#/accountability-check')) {
      const urlParams = new URLSearchParams(hash.split('?')[1]);
      const targetId = urlParams.get('id');
      if (targetId) {
        const found = sessions.find((s) => s.id === targetId);
        if (found) {
          setAccountabilityModalSession(found);
        }
      }
    } else if (hash === '#/accountability') {
      setCurrentScreen('accountability');
      analytics.logEvent('accountability_opened');
      return;
    } else if (hash === '#/community') {
      setCurrentScreen('community');
      analytics.logEvent('community_form_opened');
      return;
    } else if (hash === '#/privacy') {
      setCurrentScreen('privacy');
      return;
    } else if (hash === '#/history') {
      setCurrentScreen('history');
      analytics.logEvent('history_opened');
      return;
    } else if (hash === '#/settings') {
      setCurrentScreen('settings');
      return;
    }

    if (!settings.hasCompletedOnboarding && sessions.length === 0) {
      setCurrentScreen('onboarding');
    } else {
      setCurrentScreen('now');
    }
  }, []);

  // Google Play Console / PWA Safety: Warn user before leaving or closing if timer is active
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isTimerRunning && activeSession) {
        e.preventDefault();
        e.returnValue = 'You have an active focus timer running. Are you sure you want to close?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isTimerRunning, activeSession]);

  // Google Play Console & Mobile UX: Push notification reminder when app is minimized with running timer
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isTimerRunning && activeSession && settings.notificationsEnabled) {
        try {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('REMAP Focus Timer Active', {
              body: `Focusing on "${activeSession.title}". Tap to return.`,
              icon: '/icon.svg',
              tag: 'active-focus-timer',
            });
          }
        } catch (err) {
          console.error('Notification error:', err);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isTimerRunning, activeSession, settings.notificationsEnabled]);

  // Android system back button handler
  useEffect(() => {
    const handlePopState = () => {
      if (showGoalAccomplished) {
        setShowGoalAccomplished(false);
        return;
      }
      if (accountabilityModalSession) {
        setAccountabilityModalSession(null);
        return;
      }
      if (currentScreen !== 'now') {
        setCurrentScreen('now');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showGoalAccomplished, accountabilityModalSession, currentScreen]);

  // Listen to hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/accountability-check')) {
        const urlParams = new URLSearchParams(hash.split('?')[1]);
        const targetId = urlParams.get('id');
        if (targetId) {
          const found = sessions.find((s) => s.id === targetId);
          if (found) {
            setAccountabilityModalSession(found);
          }
        }
      } else if (hash === '#/accountability') {
        setCurrentScreen('accountability');
      } else if (hash === '#/community') {
        setCurrentScreen('community');
      } else if (hash === '#/privacy') {
        setCurrentScreen('privacy');
      } else if (hash === '#/history') {
        setCurrentScreen('history');
      } else if (hash === '#/settings') {
        setCurrentScreen('settings');
      } else if (hash === '' || hash === '#/' || hash === '#/now') {
        setCurrentScreen('now');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [sessions]);

  // Handle Onboarding Completion
  const handleGetStarted = () => {
    analytics.logEvent('onboarding_completed');
    const updated = { ...settings, hasCompletedOnboarding: true };
    setSettings(updated);
    storage.saveSettings(updated);
    setCurrentScreen('create');
  };

  // Start / Create New Intention
  const handleStartSession = (
    title: string,
    currentStep: string,
    reminder?: string,
    reminderType?: 'none' | 'today' | 'tomorrow',
    goalCategory?: GoalCategory
  ) => {
    const now = Date.now();
    let scheduledTimestamp: number | undefined;

    if (reminderType === 'today') {
      const target = new Date();
      target.setHours(19, 30, 0, 0);
      if (target.getTime() <= now) {
        target.setTime(now + 2 * 60 * 60 * 1000);
      }
      scheduledTimestamp = target.getTime();
    } else if (reminderType === 'tomorrow') {
      const target = new Date();
      target.setDate(target.getDate() + 1);
      target.setHours(9, 0, 0, 0);
      scheduledTimestamp = target.getTime();
    }

    const sessionId = 'session_' + now + '_' + Math.random().toString(36).substring(2, 7);

    const newSession: SessionRecord = {
      id: sessionId,
      title,
      currentStep,
      goalCategory: goalCategory || pendingGoalCategory,
      reminder,
      status: 'active',
      activeIntervalStartedAt: now,
      createdAt: now,
      updatedAt: now,
      reminderConfig: scheduledTimestamp
        ? {
            id: 'rem_' + now,
            scheduledFor: scheduledTimestamp,
            type: reminderType as any,
          }
        : undefined,
      sessions: [],
    };

    storage.saveOrUpdateSession(newSession);

    // Initial accountability record
    storage.recordAccountabilityOutcome({
      taskId: sessionId,
      taskTitle: title,
      actionDescription: currentStep,
      outcome: 'pending',
      scheduledTimestamp,
    });

    if (scheduledTimestamp && settings.notificationsEnabled) {
      const delay = Math.max(0, scheduledTimestamp - now);
      scheduleReminder(delay, scheduledTimestamp, currentStep, sessionId);
    }

    const allSessions = storage.loadSessions();
    setSessions(allSessions);
    setAccountabilityRecords(storage.loadAccountabilityRecords());
    setActiveSession(newSession);
    setCurrentScreen('now');
    analytics.logEvent('session_started');
    window.location.hash = '';
  };

  // -------------------------------------------------------------
  // Single Stopwatch Toggle (Play / Pause Laps)
  // -------------------------------------------------------------
  const handleToggleTimer = () => {
    if (!activeSession) return;
    const now = Date.now();

    if (activeSession.status === 'active') {
      // PAUSE: record lap interval
      const lapStart = activeSession.activeIntervalStartedAt || now;
      const lapDuration = Math.max(1, Math.floor((now - lapStart) / 1000));
      const newInterval = {
        id: 'lap_' + now,
        startedAt: lapStart,
        endedAt: now,
        duration: lapDuration,
        stopReason: 'paused' as StopReason,
      };

      const updated: SessionRecord = {
        ...activeSession,
        status: 'paused',
        activeIntervalStartedAt: undefined,
        updatedAt: now,
        sessions: [...(activeSession.sessions || []), newInterval],
      };

      storage.saveOrUpdateSession(updated);
      setActiveSession(updated);
      setSessions(storage.loadSessions());
      analytics.logEvent('session_paused');
    } else {
      // RESUME / PLAY: start new lap
      const updated: SessionRecord = {
        ...activeSession,
        status: 'active',
        activeIntervalStartedAt: now,
        updatedAt: now,
      };

      storage.saveOrUpdateSession(updated);
      setActiveSession(updated);
      setSessions(storage.loadSessions());
      analytics.logEvent('session_resumed');
    }
  };

  // -------------------------------------------------------------
  // Goal Accomplishment (Peak-End Rule & Metacognition)
  // -------------------------------------------------------------
  const handleConfirmGoalComplete = (reflectionNote?: string, reflectionRating?: string) => {
    if (!activeSession) return;
    const now = Date.now();

    // Finalize any in-flight lap
    let finalSessions = [...(activeSession.sessions || [])];
    if (activeSession.status === 'active' && activeSession.activeIntervalStartedAt) {
      const lastLap = Math.max(1, Math.floor((now - activeSession.activeIntervalStartedAt) / 1000));
      finalSessions.push({
        id: 'lap_' + now,
        startedAt: activeSession.activeIntervalStartedAt,
        endedAt: now,
        duration: lastLap,
        stopReason: 'finished' as StopReason,
      });
    }

    const updated: SessionRecord = {
      ...activeSession,
      status: 'completed',
      completedAt: now,
      activeIntervalStartedAt: undefined,
      lastCompleted: activeSession.currentStep,
      reflectionNote: reflectionNote || reflectionRating,
      outcome: 'done',
      updatedAt: now,
      sessions: finalSessions,
    };

    storage.saveOrUpdateSession(updated);
    storage.recordAccountabilityOutcome({
      taskId: activeSession.id,
      taskTitle: activeSession.title,
      actionDescription: activeSession.currentStep,
      outcome: 'done',
      note: reflectionNote || reflectionRating,
    });

    storage.setActiveSessionId(null);
    setSessions(storage.loadSessions());
    setAccountabilityRecords(storage.loadAccountabilityRecords());
    setActiveSession(null);
    setShowGoalAccomplished(false);
    analytics.logEvent('goal_completed');
  };

  // Accountability Outcome Handler (Self-monitoring & Learning)
  const handleAccountabilityOutcome = (
    session: SessionRecord,
    outcome: AccountabilityOutcome,
    note?: string
  ) => {
    const now = Date.now();
    let updatedSession: SessionRecord;

    if (outcome === 'done') {
      analytics.logEvent('task_completed');
      updatedSession = {
        ...session,
        status: 'completed',
        completedAt: now,
        lastCompleted: session.currentStep,
        outcome: 'done',
        updatedAt: now,
      };
      storage.recordAccountabilityOutcome({
        taskId: session.id,
        taskTitle: session.title,
        actionDescription: session.currentStep,
        outcome: 'done',
        note,
      });
      if (activeSession?.id === session.id) {
        storage.setActiveSessionId(null);
        setActiveSession(null);
      }
    } else if (outcome === 'moved_to_tomorrow') {
      analytics.logEvent('task_moved_to_tomorrow');
      const tomorrowMorning = new Date();
      tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
      tomorrowMorning.setHours(9, 0, 0, 0);

      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const transferRecord: TaskTransferRecord = {
        id: 'tr_' + now,
        fromTimestamp: session.updatedAt,
        toTimestamp: tomorrowMorning.getTime(),
        fromDayLabel: dayNames[new Date(session.updatedAt).getDay()],
        toDayLabel: dayNames[tomorrowMorning.getDay()],
        note: note || 'Moved forward to tomorrow',
      };

      const updatedTransfers = [...(session.transfers || []), transferRecord];

      updatedSession = {
        ...session,
        status: 'paused',
        transfers: updatedTransfers,
        outcome: 'moved_to_tomorrow',
        reminderConfig: {
          id: 'rem_' + now,
          scheduledFor: tomorrowMorning.getTime(),
          type: 'tomorrow',
        },
        updatedAt: now,
      };

      storage.recordAccountabilityOutcome({
        taskId: session.id,
        taskTitle: session.title,
        actionDescription: session.currentStep,
        outcome: 'moved_to_tomorrow',
        scheduledTimestamp: tomorrowMorning.getTime(),
        transferRecord,
        note,
      });

      if (settings.notificationsEnabled) {
        const delay = Math.max(0, tomorrowMorning.getTime() - now);
        scheduleReminder(delay, tomorrowMorning.getTime(), session.currentStep, session.id);
      }

      if (activeSession?.id === session.id) {
        setActiveSession(updatedSession);
      }
    } else if (outcome === 'reduced') {
      // Fogg Behavior Model: Reduced scope
      analytics.logEvent('task_reduced');
      updatedSession = {
        ...session,
        status: 'paused',
        outcome: 'reduced',
        reminder: note || 'Reduced to smaller micro-step',
        updatedAt: now,
      };
      storage.recordAccountabilityOutcome({
        taskId: session.id,
        taskTitle: session.title,
        actionDescription: session.currentStep,
        outcome: 'reduced',
        note,
      });
      if (activeSession?.id === session.id) {
        setActiveSession(updatedSession);
      }
    } else if (outcome === 'adapted') {
      // Adaptation & Strategy adjustment
      analytics.logEvent('task_adapted');
      updatedSession = {
        ...session,
        status: 'paused',
        outcome: 'adapted',
        reminder: note || 'Adapted strategy',
        updatedAt: now,
      };
      storage.recordAccountabilityOutcome({
        taskId: session.id,
        taskTitle: session.title,
        actionDescription: session.currentStep,
        outcome: 'adapted',
        note,
      });
      if (activeSession?.id === session.id) {
        setActiveSession(updatedSession);
      }
    } else if (outcome === 'cancelled') {
      analytics.logEvent('task_cancelled');
      updatedSession = {
        ...session,
        status: 'cancelled',
        outcome: 'cancelled',
        updatedAt: now,
      };
      storage.recordAccountabilityOutcome({
        taskId: session.id,
        taskTitle: session.title,
        actionDescription: session.currentStep,
        outcome: 'cancelled',
        note,
      });
      if (activeSession?.id === session.id) {
        storage.setActiveSessionId(null);
        setActiveSession(null);
      }
    } else {
      // 'pending'
      analytics.logEvent('task_marked_pending');
      updatedSession = {
        ...session,
        outcome: 'pending',
        updatedAt: now,
      };
      storage.recordAccountabilityOutcome({
        taskId: session.id,
        taskTitle: session.title,
        actionDescription: session.currentStep,
        outcome: 'pending',
        note,
      });
    }

    storage.saveOrUpdateSession(updatedSession);
    setSessions(storage.loadSessions());
    setAccountabilityRecords(storage.loadAccountabilityRecords());
    setAccountabilityModalSession(null);
  };

  // Switch to another past task
  const handleSwitchToTask = (task: SessionRecord) => {
    const now = Date.now();
    if (activeSession && activeSession.id !== task.id && activeSession.status === 'active') {
      // Pause current session before switching
      const lapStart = activeSession.activeIntervalStartedAt || now;
      const lapDuration = Math.max(1, Math.floor((now - lapStart) / 1000));
      const pausedCurrent: SessionRecord = {
        ...activeSession,
        status: 'paused',
        activeIntervalStartedAt: undefined,
        updatedAt: now,
        sessions: [
          ...(activeSession.sessions || []),
          {
            id: 'lap_' + now,
            startedAt: lapStart,
            endedAt: now,
            duration: lapDuration,
            stopReason: 'paused',
          },
        ],
      };
      storage.saveOrUpdateSession(pausedCurrent);
    }

    storage.setActiveSessionId(task.id);
    const activated: SessionRecord = {
      ...task,
      status: 'active',
      activeIntervalStartedAt: now,
      updatedAt: now,
    };
    storage.saveOrUpdateSession(activated);
    setSessions(storage.loadSessions());
    setActiveSession(activated);
    setCurrentScreen('now');
    analytics.logEvent('task_switched');
    window.location.hash = '';
  };

  // Delete session from history
  const handleDeleteSession = (id: string) => {
    storage.deleteSession(id);
    setSessions(storage.loadSessions());
    setActiveSession(storage.getActiveSession());
  };

  // Settings: Export
  const handleExportData = () => {
    const jsonString = storage.exportData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remap-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Settings: Import
  const handleImportData = (jsonString: string) => {
    const res = storage.importData(jsonString);
    if (res.success) {
      setSessions(storage.loadSessions());
      setAccountabilityRecords(storage.loadAccountabilityRecords());
      setActiveSession(storage.getActiveSession());
      setSettings(storage.loadSettings());
    }
    return res;
  };

  // Settings: Clear all data
  const handleClearAllData = () => {
    storage.clearAllData();
    setSessions([]);
    setAccountabilityRecords([]);
    setActiveSession(null);
    setSettings(DEFAULT_SETTINGS);
    setCurrentScreen('onboarding');
  };

  // Free, smooth navigation (no annoying blocking popups!)
  const handleNavigate = (screen: ActiveScreen) => {
    setCurrentScreen(screen);
    if (screen === 'history') {
      window.location.hash = '#/history';
      analytics.logEvent('history_opened');
    } else if (screen === 'accountability') {
      window.location.hash = '#/accountability';
      analytics.logEvent('accountability_opened');
    } else if (screen === 'pattern') {
      analytics.logEvent('pattern_opened');
      window.location.hash = '#/pattern';
    } else if (screen === 'settings') {
      window.location.hash = '#/settings';
    } else if (screen === 'community') {
      window.location.hash = '#/community';
      analytics.logEvent('community_form_opened');
    } else if (screen === 'privacy') {
      window.location.hash = '#/privacy';
    } else {
      window.location.hash = '';
    }
  };

  // Advance to next micro-step in the plan
  const handleUpdateStep = (newStep: string, previousStepCompleted: string) => {
    if (!activeSession) return;
    const prevCompletedList = activeSession.completedSteps || (activeSession.lastCompleted ? [activeSession.lastCompleted] : []);
    const updated: SessionRecord = {
      ...activeSession,
      currentStep: newStep,
      lastCompleted: previousStepCompleted,
      completedSteps: [...prevCompletedList, previousStepCompleted],
      updatedAt: Date.now(),
    };
    storage.saveOrUpdateSession(updated);
    setActiveSession(updated);
    setSessions(storage.loadSessions());
    analytics.logEvent('step_completed');
  };

  // Log friction blocker when paused
  const handleLogFriction = (blocker: StuckBlocker, note?: string) => {
    if (!activeSession) return;
    const now = Date.now();
    const updated: SessionRecord = {
      ...activeSession,
      reminder: note || `Blocker logged: ${blocker}`,
      updatedAt: now,
    };
    storage.saveOrUpdateSession(updated);
    setActiveSession(updated);
    setSessions(storage.loadSessions());
    analytics.logEvent('friction_logged', { blocker });
  };

  return (
    <div
      id="app-root-container"
      className="min-h-screen bg-[#F7F6F2] dark:bg-[#181816] text-[#171717] dark:text-[#EBEAE5]"
    >
      {/* Maximum content width: 720px centered */}
      <main className="w-full max-w-[720px] mx-auto px-4 sm:px-6 min-h-screen flex flex-col justify-between pb-24 sm:pb-8">
        <div>
          <AppHeader
            currentScreen={currentScreen}
            onNavigate={handleNavigate}
            activeSession={activeSession}
            isTimerRunning={isTimerRunning}
            activeSeconds={totalSessionSeconds}
            onToggleTimerPause={handleToggleTimer}
            onReturnToFocus={() => handleNavigate('now')}
          />

          {currentScreen === 'onboarding' && (
            <OnboardingScreen onGetStarted={handleGetStarted} />
          )}

          {currentScreen === 'create' && (
            <CreateSessionScreen
              onCancel={activeSession ? () => setCurrentScreen('now') : undefined}
              onSubmit={handleStartSession}
              initialCategory={pendingGoalCategory}
              initialTitle={pendingTaskStarter}
            />
          )}

          {currentScreen === 'now' && (
            <MainNowScreen
              session={activeSession}
              allSessions={sessions}
              isTimerRunning={isTimerRunning}
              currentLapSeconds={currentLapSeconds}
              previousTotalSeconds={previousTotalSeconds}
              onToggleTimer={handleToggleTimer}
              onStartNew={(initialCat, initialStarter) => {
                if (initialCat) setPendingGoalCategory(initialCat);
                setPendingTaskStarter(initialStarter || '');
                setCurrentScreen('create');
              }}
              onRequestFinishGoal={() => setShowGoalAccomplished(true)}
              onUpdateStep={handleUpdateStep}
              onOpenAccountabilityModal={(sessionToReview) => {
                setAccountabilityModalSession(sessionToReview || activeSession);
              }}
              onSwitchToTask={handleSwitchToTask}
              onLogFriction={handleLogFriction}
            />
          )}

          {currentScreen === 'history' && (
            <HistoryScreen
              sessions={sessions}
              onSelectSessionToResume={handleSwitchToTask}
              onDeleteSession={handleDeleteSession}
              onOpenCheckForTask={(taskId) => {
                const found = sessions.find((s) => s.id === taskId);
                if (found) setAccountabilityModalSession(found);
              }}
              onBack={() => setCurrentScreen('now')}
            />
          )}

          {currentScreen === 'accountability' && (
            <AccountabilityScreen
              records={accountabilityRecords}
              sessions={sessions}
              onBack={() => setCurrentScreen('now')}
              onOpenCheckForTask={(taskId) => {
                const found = sessions.find((s) => s.id === taskId);
                if (found) setAccountabilityModalSession(found);
              }}
              onResumeTask={(taskId) => {
                const found = sessions.find((s) => s.id === taskId);
                if (found) handleSwitchToTask(found);
              }}
            />
          )}

          {currentScreen === 'pattern' && (
            <PatternScreen
              sessions={sessions}
              onBack={() => setCurrentScreen('now')}
              onSwitchToTask={(task) => {
                setActiveSession(task);
                setCurrentScreen('now');
              }}
            />
          )}

          {currentScreen === 'community' && (
            <CommunityScreen
              onBack={() => setCurrentScreen('settings')}
              onOpenPrivacyPolicy={() => setCurrentScreen('privacy')}
            />
          )}

          {currentScreen === 'privacy' && (
            <PrivacyPolicyScreen onBack={() => setCurrentScreen('settings')} />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              settings={settings}
              onUpdateSettings={(newSettings) => {
                setSettings(newSettings);
                storage.saveSettings(newSettings);
              }}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onClearAllData={handleClearAllData}
              onRequestNotificationPermission={requestPermission}
              onSendTestNotification={sendTestNotification}
              onNavigateToCommunity={() => {
                setCurrentScreen('community');
                analytics.logEvent('community_form_opened');
              }}
              onNavigateToPrivacy={() => setCurrentScreen('privacy')}
              onBack={() => setCurrentScreen('now')}
            />
          )}
        </div>

        {/* Quiet footer signature */}
        <footer className="py-6 text-center text-[11px] text-[#6F6F6A]/70 dark:text-[#9E9D97]/70">
          <span>REMAP · intention → plan → act → account → reflect → adapt</span>
        </footer>
      </main>

      {/* Goal Accomplished Modal (Peak-End Rule & Metacognitive Reflection) */}
      {showGoalAccomplished && activeSession && (
        <GoalAccomplishedModal
          session={activeSession}
          totalSeconds={totalSessionSeconds}
          onConfirmComplete={handleConfirmGoalComplete}
          onCancel={() => setShowGoalAccomplished(false)}
          onViewHistory={() => {
            handleNavigate('history');
          }}
        />
      )}

      {/* Accountability Decision Modal */}
      {accountabilityModalSession && (
        <AccountabilityModal
          session={accountabilityModalSession}
          onSelectOutcome={(outcome, note) =>
            handleAccountabilityOutcome(accountabilityModalSession, outcome, note)
          }
          onContinueTask={(sessionToContinue) => {
            handleSwitchToTask(sessionToContinue);
            setAccountabilityModalSession(null);
          }}
          onDismiss={() => setAccountabilityModalSession(null)}
        />
      )}

      {/* In-App Notification Reminder Banner */}
      {inAppAlert && (
        <InAppNotificationBanner
          alert={inAppAlert}
          onDismiss={dismissInAppAlert}
          onResumeTask={(taskId) => {
            if (taskId) {
              const found = sessions.find((s) => s.id === taskId);
              if (found) handleSwitchToTask(found);
            } else if (activeSession) {
              handleToggleTimer();
            }
          }}
        />
      )}

      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Mobile Bottom Navigation (Fixed thumb-friendly bar on mobile) */}
      <MobileBottomNav
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        activeSession={activeSession}
        isTimerRunning={isTimerRunning}
      />
    </div>
  );
}
