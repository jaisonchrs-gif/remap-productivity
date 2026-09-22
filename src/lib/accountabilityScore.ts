import { AccountabilityRecord, AccountabilityOutcome } from '../types/session';

export interface ScoreWeights {
  completedOnTime: number;
  completedLate: number;
  movedToTomorrow: number;
  keptPending: number;
  ignored: number;
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  completedOnTime: 100,
  completedLate: 70,
  movedToTomorrow: 60,
  keptPending: 30,
  ignored: 0,
};

export interface CommitmentBreakdown {
  totalCommitments: number;
  completedCount: number;
  movedCount: number;
  pendingCount: number;
  cancelledCount: number;
  score: number; // 0 to 100
  supportingText: string;
}

export interface DayCommitmentGroup {
  dayLabel: string; // e.g. "MON", "TUE"
  fullDateStr: string; // "YYYY-MM-DD"
  records: AccountabilityRecord[];
}

/**
 * Calculates the accountability score and breakdown for a list of accountability records.
 * Follows transparent, non-judgmental scoring rules.
 */
export function calculateAccountabilityScore(
  records: AccountabilityRecord[],
  weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS
): CommitmentBreakdown {
  if (records.length === 0) {
    return {
      totalCommitments: 0,
      completedCount: 0,
      movedCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      score: 100, // clean start
      supportingText: 'No commitments tracked yet this period.',
    };
  }

  let totalPoints = 0;
  let scoredItemsCount = 0;
  let completedCount = 0;
  let movedCount = 0;
  let pendingCount = 0;
  let cancelledCount = 0;

  for (const record of records) {
    switch (record.outcome) {
      case 'done': {
        completedCount++;
        scoredItemsCount++;
        // If it was transferred previously before being marked done, it completed after original date
        const isLate = (record.transferredCount || 0) > 0;
        totalPoints += isLate ? weights.completedLate : weights.completedOnTime;
        break;
      }
      case 'moved_to_tomorrow': {
        movedCount++;
        scoredItemsCount++;
        totalPoints += weights.movedToTomorrow;
        break;
      }
      case 'pending': {
        pendingCount++;
        scoredItemsCount++;
        totalPoints += weights.keptPending;
        break;
      }
      case 'cancelled': {
        // Cancelled is not penalized; neutral and excluded from scoring denominator
        cancelledCount++;
        break;
      }
      case 'ignored': {
        scoredItemsCount++;
        totalPoints += weights.ignored;
        break;
      }
      default: {
        pendingCount++;
        scoredItemsCount++;
        totalPoints += weights.keptPending;
        break;
      }
    }
  }

  const rawScore = scoredItemsCount > 0 ? Math.round(totalPoints / scoredItemsCount) : 100;
  const score = Math.min(100, Math.max(0, rawScore));

  return {
    totalCommitments: records.length,
    completedCount,
    movedCount,
    pendingCount,
    cancelledCount,
    score,
    supportingText: 'Based on how you handled your commitments this week.',
  };
}

/**
 * Filters records for the current calendar week (Monday to Sunday)
 */
export function filterRecordsThisWeek(records: AccountabilityRecord[]): AccountabilityRecord[] {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = (currentDay + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const startOfWeek = monday.getTime();
  return records.filter((r) => r.scheduledTimestamp >= startOfWeek || r.createdAt >= startOfWeek);
}

/**
 * Filters records for today
 */
export function filterRecordsToday(records: AccountabilityRecord[]): AccountabilityRecord[] {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
  return records.filter(
    (r) =>
      (r.scheduledTimestamp >= startOfDay && r.scheduledTimestamp < endOfDay) ||
      (r.createdAt >= startOfDay && r.createdAt < endOfDay)
  );
}

/**
 * Groups records into day buckets (e.g. MON, TUE, WED) chronologically
 */
export function groupRecordsByDay(records: AccountabilityRecord[]): DayCommitmentGroup[] {
  const groupsMap = new Map<string, DayCommitmentGroup>();

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const sorted = [...records].sort((a, b) => a.scheduledTimestamp - b.scheduledTimestamp);

  for (const r of sorted) {
    const d = new Date(r.scheduledTimestamp || r.createdAt);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLabel = dayNames[d.getDay()];

    if (!groupsMap.has(dateKey)) {
      groupsMap.set(dateKey, {
        dayLabel,
        fullDateStr: dateKey,
        records: [],
      });
    }

    groupsMap.get(dateKey)!.records.push(r);
  }

  return Array.from(groupsMap.values());
}
