import React from 'react';
import { AccountabilityRecord, SessionRecord, StopReason } from '../types/session';
import {
  calculateAccountabilityScore,
  filterRecordsThisWeek,
  filterRecordsToday,
  groupRecordsByDay,
} from '../lib/accountabilityScore';
import { ArrowLeft, Check, ArrowRight, Clock, X, Info, Play, CheckSquare } from 'lucide-react';

interface AccountabilityScreenProps {
  records: AccountabilityRecord[];
  sessions: SessionRecord[];
  onBack: () => void;
  onOpenCheckForTask?: (taskId: string) => void;
  onResumeTask?: (taskId: string) => void;
}

export const AccountabilityScreen: React.FC<AccountabilityScreenProps> = ({
  records,
  sessions,
  onBack,
  onOpenCheckForTask,
  onResumeTask,
}) => {
  const weekRecords = filterRecordsThisWeek(records);
  const todayRecords = filterRecordsToday(records);
  const weekBreakdown = calculateAccountabilityScore(weekRecords);
  const todayBreakdown = calculateAccountabilityScore(todayRecords);
  const dayGroups = groupRecordsByDay(records);

  // Compute Weekly Reflection (Section 31)
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  let totalSessionsCount = 0;
  let totalFocusedSecs = 0;
  const stopReasonCounts: Record<StopReason, number> = {
    finished: 0,
    got_stuck: 0,
    got_distracted: 0,
    taking_break: 0,
    something_came_up: 0,
    paused: 0,
    other: 0,
  };

  sessions.forEach((s) => {
    (s.sessions || []).forEach((interval) => {
      if (interval.startedAt >= weekAgo) {
        totalSessionsCount++;
        totalFocusedSecs += interval.duration || 0;
        if (interval.stopReason) {
          stopReasonCounts[interval.stopReason] = (stopReasonCounts[interval.stopReason] || 0) + 1;
        }
      }
    });
  });

  const hours = Math.floor(totalFocusedSecs / 3600);
  const minutes = Math.floor((totalFocusedSecs % 3600) / 60);

  const topStopReason = (Object.entries(stopReasonCounts) as [StopReason, number][])
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])[0];

  const stopLabels: Record<StopReason, string> = {
    finished: 'Finished for now',
    got_stuck: 'Got stuck',
    got_distracted: 'Got distracted',
    taking_break: 'Taking a break',
    something_came_up: 'Something came up',
    paused: 'Paused lap',
    other: 'Other reasons',
  };

  return (
    <div id="accountability-screen" className="py-2">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] mb-4 transition cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Workspace</span>
      </button>

      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5]">
          Accountability
        </h2>
        <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] mt-1">
          Follow-through on your commitments. Resume previous tasks with one tap.
        </p>
      </div>

      <div className="space-y-6">
        {/* THIS WEEK (Section 6 & 28) */}
        <div className="p-5 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-bold">
              THIS WEEK
            </span>
            <span className="text-xs font-medium text-[#6F6F6A] dark:text-[#9E9D97]">
              {weekBreakdown.totalCommitments} {weekBreakdown.totalCommitments === 1 ? 'commitment' : 'commitments'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-white/60 dark:bg-[#22221F] border border-[#DDDCD6]/40 dark:border-[#2C2C28]/40">
              <div className="flex items-center gap-1 text-[#3C7A57] mb-1">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="text-xs font-semibold">Done</span>
              </div>
              <p className="text-xl font-bold text-[#171717] dark:text-[#EBEAE5]">
                {weekBreakdown.completedCount}
              </p>
              <p className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">completed</p>
            </div>

            <div className="p-3 rounded-xl bg-white/60 dark:bg-[#22221F] border border-[#DDDCD6]/40 dark:border-[#2C2C28]/40">
              <div className="flex items-center gap-1 text-[#1F5EFF] mb-1">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="text-xs font-semibold">Moved</span>
              </div>
              <p className="text-xl font-bold text-[#171717] dark:text-[#EBEAE5]">
                {weekBreakdown.movedCount}
              </p>
              <p className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">forward</p>
            </div>

            <div className="p-3 rounded-xl bg-white/60 dark:bg-[#22221F] border border-[#DDDCD6]/40 dark:border-[#2C2C28]/40">
              <div className="flex items-center gap-1 text-[#6F6F6A] dark:text-[#9E9D97] mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Pending</span>
              </div>
              <p className="text-xl font-bold text-[#171717] dark:text-[#EBEAE5]">
                {weekBreakdown.pendingCount}
              </p>
              <p className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">open</p>
            </div>
          </div>

          {/* ACCOUNTABILITY Score Card */}
          <div className="pt-3 border-t border-[#DDDCD6]/60 dark:border-[#2C2C28]/60 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-semibold">
                ACCOUNTABILITY SCORE
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-bold text-[#171717] dark:text-[#EBEAE5]">
                  {weekBreakdown.score}
                </span>
                <span className="text-xs font-medium text-[#6F6F6A] dark:text-[#9E9D97]">
                  {weekBreakdown.score >= 80 ? 'Consistent follow-through' : 'Progress saved'}
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-[#6F6F6A] dark:text-[#9E9D97]">
              <span>Today: {todayBreakdown.score} pts</span>
            </div>
          </div>
        </div>

        {/* Section 27 & 28: Daily Commitment Log */}
        <div className="p-5 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-bold">
              COMMITMENT LOG
            </span>
            <span className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
              Click Continue to resume any task
            </span>
          </div>

          {records.length === 0 ? (
            <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] py-4 text-center">
              No commitments recorded yet. As you start and pause tasks, they will appear here.
            </p>
          ) : (
            <div className="space-y-4">
              {dayGroups.map((group) => (
                <div key={group.fullDateStr} className="space-y-2">
                  <span className="inline-block text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[#6F6F6A] dark:text-[#9E9D97]">
                    {group.dayLabel} · {group.fullDateStr}
                  </span>

                  <div className="space-y-2 pl-1">
                    {group.records.map((r) => {
                      const isDone = r.outcome === 'done';
                      const isMoved = r.outcome === 'moved_to_tomorrow';
                      const isCancelled = r.outcome === 'cancelled';

                      return (
                        <div
                          key={r.id}
                          className="flex items-center justify-between gap-3 py-2 border-b border-[#DDDCD6]/30 dark:border-[#2C2C28]/30 last:border-0 text-xs sm:text-sm"
                        >
                          <div className="flex items-start gap-2.5 min-w-0 pr-2">
                            {isDone && (
                              <Check className="w-4 h-4 text-[#3C7A57] shrink-0 mt-0.5 stroke-[2.5]" />
                            )}
                            {isMoved && (
                              <ArrowRight className="w-4 h-4 text-[#1F5EFF] shrink-0 mt-0.5 stroke-[2.5]" />
                            )}
                            {isCancelled && (
                              <X className="w-4 h-4 text-[#6F6F6A] shrink-0 mt-0.5" />
                            )}
                            {!isDone && !isMoved && !isCancelled && (
                              <Clock className="w-4 h-4 text-[#6F6F6A] shrink-0 mt-0.5" />
                            )}

                            <div className="min-w-0">
                              <p
                                className={`font-semibold truncate ${
                                  isDone
                                    ? 'text-[#171717] dark:text-[#EBEAE5]'
                                    : isCancelled
                                    ? 'text-[#6F6F6A] line-through'
                                    : 'text-[#171717] dark:text-[#EBEAE5]'
                                }`}
                                data-clarity-mask="true"
                              >
                                {r.taskTitle}
                              </p>
                              {r.actionDescription && (
                                <p
                                  className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] truncate"
                                  data-clarity-mask="true"
                                >
                                  {r.actionDescription}
                                </p>
                              )}
                              {r.transferredCount > 0 && (
                                <p className="text-[10px] text-[#1F5EFF] italic mt-0.5">
                                  Moved forward {r.transferredCount}{' '}
                                  {r.transferredCount === 1 ? 'time' : 'times'}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Action to continue this task directly */}
                            {!isDone && onResumeTask && (
                              <button
                                onClick={() => onResumeTask(r.taskId)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1F5EFF] text-white text-xs font-medium hover:bg-[#1a50db] transition cursor-pointer shadow-2xs"
                                title="Continue this task now"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Continue</span>
                              </button>
                            )}

                            {!isDone && !isCancelled && onOpenCheckForTask && (
                              <button
                                onClick={() => onOpenCheckForTask(r.taskId)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[#DDDCD6] dark:border-[#2C2C28] text-xs font-medium text-[#171717] dark:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                                title="Update commitment status"
                              >
                                <CheckSquare className="w-3 h-3 text-[#3C7A57]" />
                                <span>Check</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 31: Weekly Reflection */}
        <div className="p-5 rounded-2xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-3">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-bold">
            <Info className="w-3.5 h-3.5 text-[#1F5EFF]" />
            <span>WEEKLY REFLECTION</span>
          </div>

          <div className="text-xs sm:text-sm text-[#171717] dark:text-[#EBEAE5] space-y-1">
            <p>
              <strong className="font-semibold">{totalSessionsCount}</strong> work sessions ·{' '}
              <strong className="font-semibold">
                {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
              </strong>{' '}
              focused time
            </p>
            <p>
              <strong className="font-semibold">{weekBreakdown.completedCount}</strong> commitments completed ·{' '}
              <strong className="font-semibold">{weekBreakdown.movedCount}</strong> moved forward
            </p>
            {topStopReason && (
              <p className="text-[#6F6F6A] dark:text-[#9E9D97] pt-1">
                Most common pause reason:{' '}
                <span className="font-medium text-[#171717] dark:text-[#EBEAE5]">
                  {stopLabels[topStopReason[0]]}
                </span>{' '}
                ({topStopReason[1]} {topStopReason[1] === 1 ? 'time' : 'times'})
              </p>
            )}
          </div>

          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] italic pt-1 border-t border-[#DDDCD6]/40 dark:border-[#2C2C28]/40">
            {topStopReason && topStopReason[0] === 'got_stuck'
              ? 'Your next step was unclear in several sessions. Try defining a smaller 5-minute action before stepping away.'
              : 'External memory protects your progress without adding guilt.'}
          </p>
        </div>
      </div>
    </div>
  );
};
