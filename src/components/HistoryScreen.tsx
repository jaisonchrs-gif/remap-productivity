import React, { useState } from 'react';
import { SessionRecord } from '../types/session';
import { ChevronDown, ChevronUp, Play, Trash2, ArrowLeft, CheckCircle2, ArrowRight, CheckSquare } from 'lucide-react';

interface HistoryScreenProps {
  sessions: SessionRecord[];
  onSelectSessionToResume: (session: SessionRecord) => void;
  onDeleteSession: (id: string) => void;
  onOpenCheckForTask?: (taskId: string) => void;
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  sessions,
  onSelectSessionToResume,
  onDeleteSession,
  onOpenCheckForTask,
  onBack,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(20);

  const formatTotalTime = (session: SessionRecord) => {
    const totalSecs = (session.sessions || []).reduce((acc, s) => acc + (s.duration || 0), 0);
    const mins = Math.floor(totalSecs / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) {
      return `${hrs}h ${remMins}m`;
    }
    return `${Math.max(1, mins)}m`;
  };

  // Group visible sessions by date: TODAY, YESTERDAY, EARLIER
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

  const currentDisplaySessions = sessions.slice(0, visibleCount);

  const todaySessions: SessionRecord[] = [];
  const yesterdaySessions: SessionRecord[] = [];
  const earlierSessions: SessionRecord[] = [];

  currentDisplaySessions.forEach((s) => {
    const timestamp = s.updatedAt || s.createdAt;
    if (timestamp >= todayStart) {
      todaySessions.push(s);
    } else if (timestamp >= yesterdayStart) {
      yesterdaySessions.push(s);
    } else {
      earlierSessions.push(s);
    }
  });

  const renderGroup = (label: string, list: SessionRecord[]) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-bold mb-3">
          {label}
        </h3>
        <div className="space-y-2">
          {list.map((item) => {
            const isExpanded = expandedId === item.id;
            const sessionCount = (item.sessions || []).length || 1;
            const isDone = item.status === 'completed';
            const transfersCount = item.transfers?.length || 0;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 overflow-hidden transition"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/2 dark:hover:bg-white/2 transition"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className="text-base font-semibold text-[#171717] dark:text-[#EBEAE5]"
                        data-clarity-mask="true"
                      >
                        {item.title}
                      </h4>
                      {isDone && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#3C7A57] bg-[#3C7A57]/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                          <span>Done</span>
                        </span>
                      )}
                      {transfersCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1F5EFF] bg-[#1F5EFF]/10 px-2 py-0.5 rounded-full">
                          <ArrowRight className="w-3 h-3" />
                          <span>Moved {transfersCount}x</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97]">
                      {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'} · {formatTotalTime(item)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSessionToResume(item);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1F5EFF] text-white text-xs font-semibold hover:bg-[#1a50db] transition cursor-pointer shadow-2xs"
                      title="Continue this task"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Continue</span>
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#6F6F6A]" /> : <ChevronDown className="w-4 h-4 text-[#6F6F6A]" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#DDDCD6]/60 dark:border-[#2C2C28]/60 space-y-3 text-xs sm:text-sm animate-in fade-in duration-150">
                    <div>
                      <span className="block text-[11px] uppercase tracking-wider text-[#6F6F6A] dark:text-[#9E9D97] font-semibold mb-0.5">
                        Next Step
                      </span>
                      <p
                        className="font-medium text-[#171717] dark:text-[#EBEAE5]"
                        data-clarity-mask="true"
                      >
                        {item.currentStep}
                      </p>
                    </div>

                    {item.lastCompleted && (
                      <div>
                        <span className="block text-[11px] uppercase tracking-wider text-[#6F6F6A] dark:text-[#9E9D97] font-semibold mb-0.5">
                          Last Finished
                        </span>
                        <p
                          className="text-[#6F6F6A] dark:text-[#9E9D97]"
                          data-clarity-mask="true"
                        >
                          {item.lastCompleted}
                        </p>
                      </div>
                    )}

                    {item.reminder && (
                      <div>
                        <span className="block text-[11px] uppercase tracking-wider text-[#6F6F6A] dark:text-[#9E9D97] font-semibold mb-0.5">
                          Notes
                        </span>
                        <p
                          className="italic text-[#6F6F6A] dark:text-[#9E9D97]"
                          data-clarity-mask="true"
                        >
                          {item.reminder}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSessionToResume(item);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F5EFF] text-white text-xs font-medium hover:bg-[#1a50db] transition cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Resume work</span>
                        </button>

                        {!isDone && onOpenCheckForTask && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCheckForTask(item.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDDCD6] dark:border-[#2C2C28] text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                          >
                            <CheckSquare className="w-3 h-3 text-[#1F5EFF]" />
                            <span>Did you finish?</span>
                          </button>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove "${item.title}" from history?`)) {
                            onDeleteSession(item.id);
                          }
                        }}
                        className="p-1.5 rounded text-[#6F6F6A] hover:text-[#B84A4A] transition cursor-pointer"
                        title="Delete work"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="history-screen" className="py-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] mb-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5]">
            History
          </h2>
          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] mt-0.5">
            Retained indefinitely on your device. Never expires.
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="py-16 text-center text-[#6F6F6A] dark:text-[#9E9D97]">
          <p className="text-sm">No work history recorded yet.</p>
          <p className="text-xs mt-1">Start a session and your timeline will build here naturally.</p>
        </div>
      ) : (
        <div>
          {renderGroup('Today', todaySessions)}
          {renderGroup('Yesterday', yesterdaySessions)}
          {renderGroup('Earlier', earlierSessions)}

          {sessions.length > visibleCount && (
            <div className="pt-4 pb-6 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 20)}
                className="px-4 py-2 rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] text-xs font-semibold text-[#171717] dark:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
              >
                Load older sessions ({sessions.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
