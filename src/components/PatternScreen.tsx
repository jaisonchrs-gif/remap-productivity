import React, { useState, useMemo } from 'react';
import { SessionRecord, StopReason, GoalCategory } from '../types/session';
import {
  ArrowLeft,
  Clock,
  Activity,
  Compass,
  CheckCircle2,
  Calendar,
  Layers,
  BarChart3,
  TrendingUp,
  Target,
  ArrowUpRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { GOAL_CATEGORIES } from '../data/goalCategories';

export type TimeframeFilter = 'today' | 'week' | 'month' | 'all';

interface PatternScreenProps {
  sessions: SessionRecord[];
  onBack: () => void;
  onSwitchToTask?: (task: SessionRecord) => void;
}

export const PatternScreen: React.FC<PatternScreenProps> = ({
  sessions,
  onBack,
  onSwitchToTask,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('today');

  // Format seconds to clean human display
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  // Compute timestamp boundaries
  const { startTime, filterLabel, windowDescription } = useMemo(() => {
    const now = Date.now();
    switch (timeframe) {
      case 'today': {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return {
          startTime: todayStart.getTime(),
          filterLabel: "Today's Status",
          windowDescription: 'Overview of focus time, sessions, and goals worked on today',
        };
      }
      case 'week': {
        return {
          startTime: now - 7 * 24 * 60 * 60 * 1000,
          filterLabel: 'Weekly Status & Patterns',
          windowDescription: 'Broader 7-day picture of your momentum, consistency, and friction',
        };
      }
      case 'month': {
        return {
          startTime: now - 30 * 24 * 60 * 60 * 1000,
          filterLabel: 'Monthly Status & Trends',
          windowDescription: 'Broader 30-day picture of your habits, completion volume, and progress',
        };
      }
      case 'all':
      default: {
        return {
          startTime: 0,
          filterLabel: 'All-Time Broader Picture',
          windowDescription: 'Complete recorded history across all work sessions and goals',
        };
      }
    }
  }, [timeframe]);

  // Daily breakdown for the past 7 days (Weekly view)
  const past7DaysData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const startOfDay = d.getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
      const label = i === 0 ? 'Today' : i === 1 ? 'Yest' : d.toLocaleDateString(undefined, { weekday: 'short' });
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      let daySecs = 0;
      let daySessionsCount = 0;

      sessions.forEach((s) => {
        (s.sessions || []).forEach((interval) => {
          if (interval.startedAt >= startOfDay && interval.startedAt <= endOfDay) {
            daySecs += interval.duration || 0;
            daySessionsCount++;
          }
        });
      });

      days.push({
        label,
        dateStr,
        daySecs,
        daySessionsCount,
      });
    }
    return days;
  }, [sessions]);

  // Weekly breakdown for the past 4 weeks (Monthly view)
  const past4WeeksData = useMemo(() => {
    const weeks = [];
    const now = Date.now();
    for (let i = 3; i >= 0; i--) {
      const start = now - (i + 1) * 7 * 24 * 3600 * 1000;
      const end = now - i * 7 * 24 * 3600 * 1000;
      const label = i === 0 ? 'This Week' : i === 1 ? 'Last Week' : `${i + 1} wks ago`;

      let weekSecs = 0;
      let weekSessionsCount = 0;
      let weekGoalsCompleted = 0;

      sessions.forEach((s) => {
        (s.sessions || []).forEach((interval) => {
          if (interval.startedAt >= start && interval.startedAt < end) {
            weekSecs += interval.duration || 0;
            weekSessionsCount++;
          }
        });
        if (
          s.status === 'completed' &&
          ((s.completedAt && s.completedAt >= start && s.completedAt < end) ||
            (s.updatedAt >= start && s.updatedAt < end))
        ) {
          weekGoalsCompleted++;
        }
      });

      weeks.push({
        label,
        weekSecs,
        weekSessionsCount,
        weekGoalsCompleted,
      });
    }
    return weeks;
  }, [sessions]);

  // Today's chronological intervals list (Today's view)
  const todayIntervals = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const startMs = todayStart.getTime();

    const list: {
      startedAt: number;
      duration: number;
      taskTitle: string;
      category?: GoalCategory;
      stopReason?: StopReason;
    }[] = [];

    sessions.forEach((s) => {
      (s.sessions || []).forEach((interval) => {
        if (interval.startedAt >= startMs) {
          list.push({
            startedAt: interval.startedAt,
            duration: interval.duration || 0,
            taskTitle: s.title,
            category: s.goalCategory,
            stopReason: interval.stopReason,
          });
        }
      });
    });

    return list.sort((a, b) => b.startedAt - a.startedAt);
  }, [sessions]);

  // Aggregate statistics for selected timeframe
  const analytics = useMemo(() => {
    let totalFocusedSecs = 0;
    let totalIntervals = 0;
    let pausedIntervalsCount = 0;
    let finishedIntervalsCount = 0;

    const reasonCounts: Record<StopReason, number> = {
      finished: 0,
      got_stuck: 0,
      got_distracted: 0,
      taking_break: 0,
      something_came_up: 0,
      paused: 0,
      other: 0,
    };

    const categorySecs: Partial<Record<GoalCategory, number>> = {};
    const touchedSessionsMap = new Map<
      string,
      { session: SessionRecord; secsInWindow: number; intervalsCount: number }
    >();

    sessions.forEach((s) => {
      let sessionSecsInWindow = 0;
      let sessionIntervalsInWindow = 0;

      (s.sessions || []).forEach((interval) => {
        if (interval.startedAt >= startTime) {
          const duration = interval.duration || 0;
          totalFocusedSecs += duration;
          totalIntervals += 1;
          sessionSecsInWindow += duration;
          sessionIntervalsInWindow += 1;

          if (interval.stopReason) {
            reasonCounts[interval.stopReason] = (reasonCounts[interval.stopReason] || 0) + 1;
            if (interval.stopReason === 'finished') {
              finishedIntervalsCount += 1;
            } else {
              pausedIntervalsCount += 1;
            }
          }

          if (s.goalCategory) {
            categorySecs[s.goalCategory] = (categorySecs[s.goalCategory] || 0) + duration;
          }
        }
      });

      const isCompletedInWindow =
        s.status === 'completed' &&
        ((s.completedAt && s.completedAt >= startTime) || s.updatedAt >= startTime);

      if (sessionIntervalsInWindow > 0 || isCompletedInWindow) {
        touchedSessionsMap.set(s.id, {
          session: s,
          secsInWindow: sessionSecsInWindow,
          intervalsCount: sessionIntervalsInWindow,
        });
      }
    });

    const touchedGoals = Array.from(touchedSessionsMap.values()).sort(
      (a, b) => b.secsInWindow - a.secsInWindow
    );

    const completedGoalsCount = touchedGoals.filter(
      (g) => g.session.status === 'completed'
    ).length;

    const inProgressGoalsCount = touchedGoals.filter(
      (g) => g.session.status !== 'completed'
    ).length;

    const completionRate =
      touchedGoals.length > 0
        ? Math.round((completedGoalsCount / touchedGoals.length) * 100)
        : 0;

    const sortedReasons = (Object.entries(reasonCounts) as [StopReason, number][])
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    const sortedCategories = (Object.entries(categorySecs) as [GoalCategory, number][])
      .filter(([_, secs]) => secs > 0)
      .sort((a, b) => b[1] - a[1]);

    return {
      totalFocusedSecs,
      totalIntervals,
      pausedIntervalsCount,
      finishedIntervalsCount,
      completedGoalsCount,
      inProgressGoalsCount,
      touchedGoals,
      completionRate,
      sortedReasons,
      reasonCounts,
      sortedCategories,
    };
  }, [sessions, startTime]);

  const reasonLabels: Record<StopReason, string> = {
    finished: 'Finished for now',
    got_stuck: 'Got stuck',
    got_distracted: 'Got distracted',
    taking_break: 'Taking a break',
    something_came_up: 'Something came up',
    paused: 'Paused lap',
    other: 'Other reasons',
  };

  // Generate contextual behavioral observations
  const observation = useMemo(() => {
    if (analytics.totalIntervals === 0) {
      if (timeframe === 'today') {
        return 'No work sessions recorded yet today. Sit down for 5 minutes with a micro-action to build immediate momentum.';
      }
      return 'As you complete and pause work sessions, your natural work patterns will quietly surface here.';
    }

    if (analytics.reasonCounts.got_stuck >= 2) {
      return 'Friction detected: You pause most often when a task feels too broad. Try breaking the next step down into a 2-minute micro-action before leaving your desk.';
    }
    if (analytics.reasonCounts.got_distracted >= 2) {
      return 'Distraction buffer: Context shifts happen naturally. Saving where you left off keeps the cognitive activation barrier low.';
    }
    if (analytics.completedGoalsCount >= 2) {
      return 'Strong completion momentum: Having a concrete micro-action attached to each goal significantly reinforces self-efficacy.';
    }
    if (timeframe === 'today') {
      return `You have completed ${analytics.totalIntervals} focused session${
        analytics.totalIntervals === 1 ? '' : 's'
      } today. Preserving your clear next step keeps your mind calm.`;
    }
    if (timeframe === 'week') {
      return 'Weekly rhythm: Consistent short intervals generate higher sustained clarity than irregular marathons.';
    }
    if (timeframe === 'month') {
      return 'Monthly consistency: Steady small steps across weeks compound into major achievements without cognitive burnout.';
    }
    return 'Broader picture: Small, bounded actions compound into substantial progress without cognitive overwhelm.';
  }, [analytics, timeframe]);

  // Max daily seconds for chart scaling
  const maxDaySecs = useMemo(() => {
    const max = Math.max(...past7DaysData.map((d) => d.daySecs), 3600);
    return max;
  }, [past7DaysData]);

  // Max weekly seconds for chart scaling
  const maxWeekSecs = useMemo(() => {
    const max = Math.max(...past4WeeksData.map((w) => w.weekSecs), 7200);
    return max;
  }, [past4WeeksData]);

  return (
    <div id="pattern-screen" className="py-2 space-y-6">
      {/* Header and Back Button */}
      <div>
        <button
          id="pattern-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] mb-3 transition cursor-pointer min-h-[36px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspace</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5]">
              Pattern & Analytics
            </h2>
            <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] mt-1">
              {windowDescription}
            </p>
          </div>

          {/* Timeframe Filter Tabs: Today / Weekly / Monthly / All Time */}
          <div
            id="pattern-timeframe-filters"
            className="flex items-center p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-[#DDDCD6]/80 dark:border-[#2C2C28] self-start sm:self-auto"
            role="tablist"
            aria-label="Timeframe filters"
          >
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'Weekly' },
                { id: 'month', label: 'Monthly' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                id={`filter-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={timeframe === tab.id}
                onClick={() => setTimeframe(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer min-h-[36px] whitespace-nowrap ${
                  timeframe === tab.id
                    ? 'bg-[#171717] text-[#F7F6F2] dark:bg-[#EBEAE5] dark:text-[#171717] shadow-xs'
                    : 'text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Status Overview Banner (Dynamic to Selected Filter) */}
      <div className="p-5 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/60 dark:bg-[#1C1C1A]/60 space-y-3 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#1F5EFF]/10 text-[#1F5EFF]">
              <Zap className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase tracking-widest text-[#171717] dark:text-[#EBEAE5] font-bold">
              {filterLabel.toUpperCase()}
            </span>
          </div>

          <span className="text-xs font-mono font-semibold text-[#1F5EFF] bg-[#1F5EFF]/10 px-2.5 py-1 rounded-md">
            {formatTime(analytics.totalFocusedSecs)} focused
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <p className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#EBEAE5]">
            {analytics.totalIntervals === 0 ? (
              <span>No focus intervals recorded yet for this timeframe.</span>
            ) : (
              <span>
                {analytics.totalIntervals} session{analytics.totalIntervals === 1 ? '' : 's'} logged ·{' '}
                <span className="text-[#3C7A57]">{analytics.completedGoalsCount} completed</span>
                {analytics.inProgressGoalsCount > 0 && (
                  <span> · {analytics.inProgressGoalsCount} in progress</span>
                )}
              </span>
            )}
          </p>

          {analytics.touchedGoals.length > 0 && (
            <span className="text-xs text-[#6F6F6A] dark:text-[#9E9D97]">
              {analytics.completionRate}% follow-through
            </span>
          )}
        </div>

        {/* Visual Progress Ratio Bar */}
        {analytics.touchedGoals.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden flex">
              <div
                className="h-full bg-[#3C7A57] transition-all duration-300"
                style={{ width: `${analytics.completionRate}%` }}
                title={`Completed: ${analytics.completionRate}%`}
              />
              <div
                className="h-full bg-[#1F5EFF] transition-all duration-300"
                style={{ width: `${100 - analytics.completionRate}%` }}
                title={`In Progress: ${100 - analytics.completionRate}%`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3C7A57]" />
                <span>{analytics.completedGoalsCount} Completed</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#1F5EFF]" />
                <span>{analytics.inProgressGoalsCount} In Progress</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Focused Time */}
        <div className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6F6F6A] dark:text-[#9E9D97]">
            <Clock className="w-3.5 h-3.5 text-[#1F5EFF]" />
            <span>Focused Time</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5]">
            {formatTime(analytics.totalFocusedSecs)}
          </p>
          <p className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
            active focus duration
          </p>
        </div>

        {/* Sessions / Laps Count */}
        <div className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6F6F6A] dark:text-[#9E9D97]">
            <Activity className="w-3.5 h-3.5 text-[#1F5EFF]" />
            <span>Work Sessions</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5]">
            {analytics.totalIntervals}
          </p>
          <p className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
            focus intervals logged
          </p>
        </div>

        {/* Goals Completed */}
        <div className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#3C7A57]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3C7A57]" />
            <span>Completed</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#3C7A57]">
            {analytics.completedGoalsCount}
          </p>
          <p className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
            goals finished
          </p>
        </div>

        {/* Completion Rate */}
        <div className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6F6F6A] dark:text-[#9E9D97]">
            <TrendingUp className="w-3.5 h-3.5 text-[#1F5EFF]" />
            <span>Follow-through</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5]">
            {analytics.completionRate}%
          </p>
          <p className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
            completed vs touched
          </p>
        </div>
      </div>

      {/* Visual Chart Section based on Filter */}
      {timeframe === 'week' && (
        <div className="p-5 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/50 dark:bg-[#1C1C1A]/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#1F5EFF]" />
              <h3 className="text-xs uppercase tracking-widest text-[#171717] dark:text-[#EBEAE5] font-bold">
                7-Day Activity Rhythm
              </h3>
            </div>
            <span className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
              Minutes focused per day
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2 items-end h-32">
            {past7DaysData.map((d, idx) => {
              const heightPct =
                maxDaySecs > 0 ? Math.max(8, Math.round((d.daySecs / maxDaySecs) * 100)) : 8;
              const hasActivity = d.daySecs > 0;

              return (
                <div key={idx} className="flex flex-col items-center justify-end h-full gap-1.5">
                  <span className="text-[10px] font-mono text-[#6F6F6A] dark:text-[#9E9D97] truncate">
                    {d.daySecs > 0 ? Math.round(d.daySecs / 60) + 'm' : '—'}
                  </span>
                  <div className="w-full bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden flex items-end h-20">
                    <div
                      className={`w-full rounded-lg transition-all duration-300 ${
                        hasActivity
                          ? 'bg-[#1F5EFF] hover:bg-[#1a50db]'
                          : 'bg-black/10 dark:bg-white/10'
                      }`}
                      style={{ height: `${heightPct}%` }}
                      title={`${d.label} (${d.dateStr}): ${formatTime(d.daySecs)} across ${
                        d.daySessionsCount
                      } sessions`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#171717] dark:text-[#EBEAE5]">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {timeframe === 'month' && (
        <div className="p-5 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/50 dark:bg-[#1C1C1A]/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#1F5EFF]" />
              <h3 className="text-xs uppercase tracking-widest text-[#171717] dark:text-[#EBEAE5] font-bold">
                4-Week Momentum Distribution
              </h3>
            </div>
            <span className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
              Progress across past 30 days
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {past4WeeksData.map((w, idx) => {
              const pct = maxWeekSecs > 0 ? Math.round((w.weekSecs / maxWeekSecs) * 100) : 0;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-[#DDDCD6]/60 dark:border-[#2C2C28]/60 bg-black/2 dark:bg-white/2 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#171717] dark:text-[#EBEAE5]">{w.label}</span>
                    <span className="font-mono text-[#1F5EFF] font-bold">
                      {formatTime(w.weekSecs)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-[#1F5EFF] rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#6F6F6A] dark:text-[#9E9D97]">
                    <span>{w.weekSessionsCount} sessions</span>
                    <span>{w.weekGoalsCompleted} finished</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {timeframe === 'today' && todayIntervals.length > 0 && (
        <div className="p-5 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/50 dark:bg-[#1C1C1A]/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1F5EFF]" />
              <h3 className="text-xs uppercase tracking-widest text-[#171717] dark:text-[#EBEAE5] font-bold">
                Today&apos;s Focus Intervals ({todayIntervals.length})
              </h3>
            </div>
            <span className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
              Chronological sequence
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {todayIntervals.map((iv, idx) => {
              const timeStr = new Date(iv.startedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const cat = GOAL_CATEGORIES.find((c) => c.id === iv.category);

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[#DDDCD6]/50 dark:border-[#2C2C28]/50 bg-black/2 dark:bg-white/2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[#6F6F6A] dark:text-[#9E9D97] shrink-0">
                      {timeStr}
                    </span>
                    {cat && <span className="shrink-0">{cat.emoji}</span>}
                    <span className="font-medium text-[#171717] dark:text-[#EBEAE5] truncate">
                      {iv.taskTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-[#1F5EFF]">
                      {formatTime(iv.duration)}
                    </span>
                    {iv.stopReason && (
                      <span className="text-[10px] text-[#6F6F6A] dark:text-[#9E9D97] px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5">
                        {reasonLabels[iv.stopReason] || iv.stopReason}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Goals Worked On in this timeframe */}
      <div className="p-5 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/50 dark:bg-[#1C1C1A]/50 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#1F5EFF]" />
            <h3 className="text-xs uppercase tracking-widest text-[#171717] dark:text-[#EBEAE5] font-bold">
              {filterLabel} — Goals Worked On ({analytics.touchedGoals.length})
            </h3>
          </div>
          <span className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
            {analytics.completedGoalsCount} completed · {analytics.inProgressGoalsCount} in progress
          </span>
        </div>

        {analytics.touchedGoals.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] italic">
              No tasks or goals were logged during this timeframe.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#DDDCD6]/50 dark:divide-[#2C2C28]/50">
            {analytics.touchedGoals.map(({ session: s, secsInWindow, intervalsCount }) => {
              const cat = GOAL_CATEGORIES.find((c) => c.id === s.goalCategory);
              const isCompleted = s.status === 'completed';

              return (
                <div
                  key={s.id}
                  className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-[#3C7A57]/10 text-[#3C7A57]'
                            : 'bg-[#1F5EFF]/10 text-[#1F5EFF]'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </>
                        ) : (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-[#1F5EFF]" />
                            <span>In Progress</span>
                          </>
                        )}
                      </span>

                      {cat && (
                        <span className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97] font-medium flex items-center gap-1">
                          <span>{cat.emoji}</span>
                          <span>{cat.shortLabel}</span>
                        </span>
                      )}

                      <span className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
                        · {intervalsCount} {intervalsCount === 1 ? 'lap' : 'laps'}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-[#171717] dark:text-[#EBEAE5] truncate">
                      {s.title}
                    </p>

                    <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] truncate">
                      Next action: &ldquo;{s.currentStep}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-[#171717] dark:text-[#EBEAE5]">
                        {formatTime(secsInWindow)}
                      </p>
                      <p className="text-[10px] text-[#6F6F6A] dark:text-[#9E9D97]">focus time</p>
                    </div>

                    {!isCompleted && onSwitchToTask && (
                      <button
                        type="button"
                        onClick={() => onSwitchToTask(s)}
                        className="p-1.5 rounded-lg border border-[#DDDCD6] dark:border-[#2C2C28] text-[#1F5EFF] hover:bg-[#1F5EFF]/10 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Focus on this task now"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Time Allocation */}
      {analytics.sortedCategories.length > 0 && (
        <div className="p-5 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/50 dark:bg-[#1C1C1A]/50 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1F5EFF]" />
            <h3 className="text-xs uppercase tracking-widest text-[#171717] dark:text-[#EBEAE5] font-bold">
              Category Allocation ({filterLabel})
            </h3>
          </div>

          <div className="space-y-2.5">
            {analytics.sortedCategories.map(([catId, secs]) => {
              const cat = GOAL_CATEGORIES.find((c) => c.id === catId);
              const percentage =
                analytics.totalFocusedSecs > 0
                  ? Math.round((secs / analytics.totalFocusedSecs) * 100)
                  : 0;

              return (
                <div key={catId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#171717] dark:text-[#EBEAE5] flex items-center gap-1.5">
                      <span>{cat?.emoji || '🎯'}</span>
                      <span>{cat?.label || catId}</span>
                    </span>
                    <span className="text-[#6F6F6A] dark:text-[#9E9D97] font-mono">
                      {formatTime(secs)} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#1F5EFF] transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Friction & Stop Reasons */}
      <div className="p-5 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/50 dark:bg-[#1C1C1A]/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#1F5EFF]" />
            <h3 className="text-xs uppercase tracking-widest text-[#171717] dark:text-[#EBEAE5] font-bold">
              Stop & Friction Reasons ({filterLabel})
            </h3>
          </div>
        </div>

        {analytics.sortedReasons.length === 0 ? (
          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] italic py-2">
            No pause or stop events recorded in this period.
          </p>
        ) : (
          <div className="space-y-2">
            {analytics.sortedReasons.map(([reason, count]) => {
              const pct =
                analytics.totalIntervals > 0
                  ? Math.round((count / analytics.totalIntervals) * 100)
                  : 0;

              return (
                <div
                  key={reason}
                  className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-[#DDDCD6]/40 dark:border-[#2C2C28]/40 last:border-0"
                >
                  <span className="text-[#171717] dark:text-[#EBEAE5] font-medium">
                    {reasonLabels[reason] || reason}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-xs text-[#6F6F6A] dark:text-[#9E9D97]">
                    <span>
                      {count} {count === 1 ? 'time' : 'times'}
                    </span>
                    <span className="text-[11px] opacity-70">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Behavioral Observation grounded in Cognitive Psychology */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#1F5EFF]/30 bg-[#1F5EFF]/5 dark:bg-[#1F5EFF]/10 space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-[#1F5EFF] font-bold uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Cognitive Insight ({filterLabel})</span>
        </div>
        <p className="text-xs sm:text-sm text-[#171717] dark:text-[#EBEAE5] leading-relaxed font-medium">
          &ldquo;{observation}&rdquo;
        </p>
      </div>
    </div>
  );
};
