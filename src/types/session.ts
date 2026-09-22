export type StopReason = 
  | 'finished' 
  | 'got_stuck' 
  | 'got_distracted' 
  | 'taking_break' 
  | 'something_came_up' 
  | 'paused'
  | 'other';

export type GoalCategory =
  | 'business'
  | 'studies'
  | 'personal'
  | 'financial'
  | 'creative'
  | 'admin'
  | 'other';

export type StuckBlocker = 
  | 'dont_know_next' 
  | 'need_info' 
  | 'too_big' 
  | 'waiting_on_someone' 
  | 'lost_motivation' 
  | 'other';

export type AccountabilityOutcome = 
  | 'done'
  | 'moved_to_tomorrow'
  | 'reduced'
  | 'adapted'
  | 'pending'
  | 'cancelled'
  | 'ignored';

export interface TaskTransferRecord {
  id: string;
  fromTimestamp: number;
  toTimestamp: number;
  fromDayLabel?: string;
  toDayLabel?: string;
  note?: string;
}

export interface ReminderConfig {
  id: string;
  scheduledFor: number; // timestamp
  type: 'today' | 'tomorrow' | 'custom';
  customTimeStr?: string; // e.g. "19:30"
  customDateStr?: string; // e.g. "2026-09-22"
  fired?: boolean;
  acknowledged?: boolean;
  outcome?: AccountabilityOutcome;
}

export interface AccountabilityRecord {
  id: string;
  taskId: string;
  taskTitle: string;
  actionDescription: string;
  scheduledDate: string; // YYYY-MM-DD
  dayLabel: string; // "MON", "TUE", etc.
  scheduledTimestamp: number;
  completedTimestamp?: number;
  outcome: AccountabilityOutcome;
  transferredCount: number;
  transfers?: TaskTransferRecord[];
  scoreImpact?: number;
  historyNote?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WorkInterval {
  id: string;
  startedAt: number;
  endedAt?: number;
  duration: number; // in seconds
  stopReason?: StopReason;
  stuckBlocker?: StuckBlocker;
  stuckNote?: string;
}

export interface SessionRecord {
  id: string;
  title: string;
  currentStep: string;
  goalCategory?: GoalCategory;
  lastCompleted?: string;
  completedSteps?: string[];
  reminder?: string; // context note
  reminderConfig?: ReminderConfig;
  transfers?: TaskTransferRecord[];
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  outcome?: AccountabilityOutcome;
  accountabilityId?: string;
  reflectionNote?: string;
  completedAt?: number;
  activeIntervalStartedAt?: number | null;
  createdAt: number;
  updatedAt: number;
  sessions: WorkInterval[];
}

export interface AppSettings {
  notificationsEnabled: boolean;
  notificationPermissionAsked?: boolean;
  reminderDefault: '30m' | '1h' | '3h' | 'tomorrow';
  theme: 'light' | 'dark';
  hasCompletedOnboarding: boolean;
  communityOptIn?: boolean;
}

export interface CommunityMemberSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  currentWork?: string;
  communityWish?: string;
  receiveUpdates: boolean;
  submittedAt: number;
}

export type ActiveScreen = 
  | 'onboarding'
  | 'create'
  | 'now'
  | 'active'
  | 'pause'
  | 'resume'
  | 'history'
  | 'accountability'
  | 'pattern'
  | 'community'
  | 'privacy'
  | 'settings';
