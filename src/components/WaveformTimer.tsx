import React, { useState, memo } from 'react';
import { Pause, Play, Disc, Clock, ChevronDown, ChevronUp, Flag } from 'lucide-react';
import { WorkInterval } from '../types/session';

interface WaveformTimerProps {
  currentLapSeconds: number;
  previousTotalSeconds?: number;
  laps?: WorkInterval[];
  isRunning?: boolean;
  onTogglePause?: () => void;
  showPauseButton?: boolean;
  compact?: boolean;
}

const WaveformTimerComponent: React.FC<WaveformTimerProps> = ({
  currentLapSeconds,
  previousTotalSeconds = 0,
  laps = [],
  isRunning = true,
  onTogglePause,
  showPauseButton = true,
  compact = false,
}) => {
  // Total stopwatch time = previous total + current lap time
  const totalSeconds = previousTotalSeconds + currentLapSeconds;

  // 24 waveform bar relative baseline heights
  const barHeights = [
    25, 45, 70, 90, 55, 80, 100, 65, 40, 85, 95, 75,
    60, 90, 100, 70, 45, 85, 95, 60, 80, 50, 65, 30
  ];

  const [showLapBreakdown, setShowLapBreakdown] = useState(false);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completedLaps = laps.filter((l) => (l.duration || 0) > 0);
  const currentLapIndex = completedLaps.length + 1;

  return (
    <div
      id="waveform-session-timer"
      className={`rounded-2xl border transition-all duration-300 ${
        isRunning
          ? 'border-[#1F5EFF]/30 dark:border-[#3B75FF]/30 bg-white/80 dark:bg-[#1C1C1A]/80 shadow-xs'
          : 'border-[#DDDCD6] dark:border-[#2C2C28] bg-black/2 dark:bg-white/2'
      } ${compact ? 'p-3' : 'p-4 sm:p-5'}`}
    >
      <div className="flex flex-col gap-3">
        {/* Top bar: Status, Monospace Total Time, and Pause/Resume button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`relative flex h-2.5 w-2.5 rounded-full ${
                isRunning ? 'bg-[#1F5EFF]' : 'bg-[#6F6F6A]'
              }`}
            >
              {isRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1F5EFF] opacity-75" />
              )}
            </span>

            <span className="text-[11px] font-bold uppercase tracking-wider text-[#171717] dark:text-[#EBEAE5] flex items-center gap-1.5">
              <Disc
                className={`w-3.5 h-3.5 ${
                  isRunning ? 'animate-spin text-[#1F5EFF]' : 'text-[#6F6F6A]'
                }`}
                style={{ animationDuration: '4s' }}
              />
              <span>{isRunning ? 'FOCUS TIMER ACTIVE' : 'TIMER PAUSED'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span
                id="waveform-digital-clock"
                className="font-mono tabular-nums text-lg sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5] block"
              >
                {formatTimer(totalSeconds)}
              </span>
              {previousTotalSeconds > 0 && (
                <span className="text-[10px] text-[#6F6F6A] dark:text-[#9E9D97] block font-mono tabular-nums">
                  Lap {currentLapIndex}: {formatTimer(currentLapSeconds)}
                </span>
              )}
            </div>

            {showPauseButton && onTogglePause && (
              <button
                type="button"
                onClick={onTogglePause}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer min-h-[36px] ${
                  isRunning
                    ? 'bg-[#171717] text-white dark:bg-[#EBEAE5] dark:text-[#171717] hover:opacity-90 active:scale-95'
                    : 'bg-[#1F5EFF] text-white hover:bg-[#1a50db] active:scale-95'
                }`}
                title={isRunning ? 'Pause active session' : 'Resume timer'}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Podcast / Music Player Waveform Visualizer (Hardware-accelerated CSS keyframe animation) */}
        <div
          className="h-10 sm:h-12 w-full flex items-center justify-between gap-0.5 sm:gap-1 px-1 py-1 rounded-xl bg-[#F0EFEB]/80 dark:bg-[#141412]/80 overflow-hidden"
          title={isRunning ? 'Active session sound wave' : 'Paused sound wave'}
        >
          {barHeights.map((baseHeight, idx) => (
            <div key={idx} className="flex-1 flex items-center justify-center h-full">
              <div
                className={`w-full max-w-[5px] sm:max-w-[7px] rounded-full ${
                  isRunning
                    ? idx % 2 === 0
                      ? 'bg-[#1F5EFF] dark:bg-[#3B75FF] animate-remap-wave'
                      : 'bg-[#1F5EFF]/70 dark:bg-[#3B75FF]/70 animate-remap-wave'
                    : 'bg-[#DDDCD6] dark:bg-[#2C2C28]'
                }`}
                style={{
                  height: `${baseHeight}%`,
                  animationDelay: `${((idx % 12) * 0.1).toFixed(2)}s`,
                  animationPlayState: isRunning ? 'running' : 'paused',
                }}
              />
            </div>
          ))}
        </div>

        {/* Reminder hint to pause & stopwatch laps toggle */}
        <div className="flex items-center justify-between text-[11px] text-[#6F6F6A] dark:text-[#9E9D97] px-0.5 pt-0.5">
          <span>
            {isRunning
              ? '💡 Step away? Hit Pause to record this lap and save your exact context.'
              : 'Timer paused. Previous time saved. Ready to resume.'}
          </span>

          {completedLaps.length > 0 && (
            <button
              type="button"
              onClick={() => setShowLapBreakdown(!showLapBreakdown)}
              className="inline-flex items-center gap-1 font-semibold text-[#1F5EFF] hover:underline cursor-pointer shrink-0 ml-2"
            >
              <Flag className="w-3 h-3" />
              <span>{completedLaps.length} {completedLaps.length === 1 ? 'Lap' : 'Laps'}</span>
              {showLapBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Stopwatch Laps Breakdown Panel */}
        {showLapBreakdown && completedLaps.length > 0 && (
          <div className="mt-1 pt-2 border-t border-[#DDDCD6]/60 dark:border-[#2C2C28]/60 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#6F6F6A] dark:text-[#9E9D97]">
              <span>STOPWATCH LAPS</span>
              <span>DURATION</span>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {completedLaps.map((lap, idx) => {
                const lapNum = idx + 1;
                const reasonLabel =
                  lap.stopReason === 'finished'
                    ? 'Goal finished'
                    : lap.stopReason === 'paused'
                    ? 'Manual pause'
                    : lap.stopReason === 'got_stuck'
                    ? 'Stuck'
                    : lap.stopReason === 'got_distracted'
                    ? 'Distracted'
                    : 'Stopped';

                return (
                  <div
                    key={lap.id || idx}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-black/3 dark:bg-white/3 font-mono tabular-nums"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[#1F5EFF] font-semibold">Lap {lapNum}</span>
                      <span className="text-[10px] font-sans text-[#6F6F6A] dark:text-[#9E9D97]">
                        ({reasonLabel})
                      </span>
                    </div>
                    <span className="font-semibold text-[#171717] dark:text-[#EBEAE5]">
                      {formatTimer(lap.duration || 0)}
                    </span>
                  </div>
                );
              })}

              {/* Current running lap */}
              <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#1F5EFF]/10 font-mono tabular-nums text-[#1F5EFF]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Lap {currentLapIndex}</span>
                  <span className="text-[10px] font-sans opacity-80">(Active)</span>
                </div>
                <span className="font-semibold">{formatTimer(currentLapSeconds)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const WaveformTimer = memo(WaveformTimerComponent);
