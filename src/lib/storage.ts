import {
  SessionRecord,
  AppSettings,
  AccountabilityRecord,
  AccountabilityOutcome,
  TaskTransferRecord,
  CommunityMemberSubmission,
} from '../types/session';

const SESSIONS_KEY = 'remap_app_sessions_v1';
const LEGACY_SESSIONS_KEY = 'resume_app_sessions_v1';
const ACTIVE_SESSION_ID_KEY = 'remap_app_active_id_v1';
const LEGACY_ACTIVE_ID_KEY = 'resume_app_active_id_v1';
const SETTINGS_KEY = 'remap_app_settings_v1';
const LEGACY_SETTINGS_KEY = 'resume_app_settings_v1';
const LAST_APP_OPEN_KEY = 'remap_app_last_open_v1';
const ACCOUNTABILITY_KEY = 'remap_app_accountability_v1';
const LEGACY_ACCOUNTABILITY_KEY = 'resume_app_accountability_v1';
const COMMUNITY_KEY = 'remap_app_community_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: false,
  notificationPermissionAsked: false,
  reminderDefault: '1h',
  theme: 'light',
  hasCompletedOnboarding: false,
  communityOptIn: false,
};

export const storage = {
  // SESSIONS
  loadSessions(): SessionRecord[] {
    try {
      let raw = localStorage.getItem(SESSIONS_KEY);
      if (!raw) {
        raw = localStorage.getItem(LEGACY_SESSIONS_KEY);
      }
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (err) {
      console.error('Failed to load sessions from storage:', err);
      return [];
    }
  },

  saveSessions(sessions: SessionRecord[]): boolean {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      return true;
    } catch (err) {
      console.error('Failed to save sessions to storage:', err);
      return false;
    }
  },

  getSessionsPaginated(page = 1, pageSize = 20): { sessions: SessionRecord[]; total: number; hasMore: boolean } {
    const all = this.loadSessions();
    const startIndex = (page - 1) * pageSize;
    const paginated = all.slice(startIndex, startIndex + pageSize);
    return {
      sessions: paginated,
      total: all.length,
      hasMore: startIndex + pageSize < all.length,
    };
  },

  getActiveSessionId(): string | null {
    try {
      return localStorage.getItem(ACTIVE_SESSION_ID_KEY) || localStorage.getItem(LEGACY_ACTIVE_ID_KEY);
    } catch {
      return null;
    }
  },

  setActiveSessionId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(ACTIVE_SESSION_ID_KEY, id);
      } else {
        localStorage.removeItem(ACTIVE_SESSION_ID_KEY);
      }
    } catch (err) {
      console.error('Failed to set active session ID:', err);
    }
  },

  getActiveSession(): SessionRecord | null {
    const activeId = this.getActiveSessionId();
    const sessions = this.loadSessions();
    if (activeId) {
      const found = sessions.find((s) => s.id === activeId);
      if (found) return found;
    }
    // If no active session ID specified, find the most recently updated active or paused session
    const openSessions = sessions.filter((s) => s.status !== 'completed' && s.status !== 'cancelled');
    if (openSessions.length > 0) {
      return openSessions.sort((a, b) => b.updatedAt - a.updatedAt)[0];
    }
    return null;
  },

  saveOrUpdateSession(session: SessionRecord): void {
    const sessions = this.loadSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    this.saveSessions(sessions);
    this.setActiveSessionId(session.id);
  },

  deleteSession(id: string): void {
    const sessions = this.loadSessions().filter((s) => s.id !== id);
    this.saveSessions(sessions);
    if (this.getActiveSessionId() === id) {
      const remaining = sessions.filter((s) => s.status !== 'completed' && s.status !== 'cancelled');
      this.setActiveSessionId(remaining[0]?.id || null);
    }
  },

  // ACCOUNTABILITY RECORDS
  loadAccountabilityRecords(): AccountabilityRecord[] {
    try {
      let raw = localStorage.getItem(ACCOUNTABILITY_KEY);
      if (!raw) {
        raw = localStorage.getItem(LEGACY_ACCOUNTABILITY_KEY);
      }
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (err) {
      console.error('Failed to load accountability records:', err);
      return [];
    }
  },

  saveAccountabilityRecords(records: AccountabilityRecord[]): boolean {
    try {
      localStorage.setItem(ACCOUNTABILITY_KEY, JSON.stringify(records));
      return true;
    } catch (err) {
      console.error('Failed to save accountability records:', err);
      return false;
    }
  },

  recordAccountabilityOutcome(params: {
    taskId: string;
    taskTitle: string;
    actionDescription: string;
    outcome: AccountabilityOutcome;
    scheduledTimestamp?: number;
    transferRecord?: TaskTransferRecord;
    note?: string;
  }): AccountabilityRecord {
    const records = this.loadAccountabilityRecords();
    const now = Date.now();
    const scheduled = params.scheduledTimestamp || now;
    const d = new Date(scheduled);
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayLabel = dayNames[d.getDay()];
    const scheduledDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // Look for existing active record for this task and scheduled date
    const existingIndex = records.findIndex(
      (r) => r.taskId === params.taskId && (r.outcome === 'pending' || r.outcome === 'moved_to_tomorrow')
    );

    let updatedRecord: AccountabilityRecord;

    if (existingIndex >= 0) {
      const existing = records[existingIndex];
      const transfers = existing.transfers || [];
      if (params.transferRecord) {
        transfers.push(params.transferRecord);
      }
      updatedRecord = {
        ...existing,
        outcome: params.outcome,
        completedTimestamp: params.outcome === 'done' ? now : existing.completedTimestamp,
        transferredCount: transfers.length,
        transfers,
        historyNote: params.note || existing.historyNote,
        updatedAt: now,
      };
      records[existingIndex] = updatedRecord;
    } else {
      const transfers = params.transferRecord ? [params.transferRecord] : [];
      updatedRecord = {
        id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        taskId: params.taskId,
        taskTitle: params.taskTitle,
        actionDescription: params.actionDescription,
        scheduledDate,
        dayLabel,
        scheduledTimestamp: scheduled,
        completedTimestamp: params.outcome === 'done' ? now : undefined,
        outcome: params.outcome,
        transferredCount: transfers.length,
        transfers,
        historyNote: params.note,
        createdAt: now,
        updatedAt: now,
      };
      records.unshift(updatedRecord);
    }

    this.saveAccountabilityRecords(records);
    return updatedRecord;
  },

  // COMMUNITY SUBMISSIONS
  loadCommunitySubmission(): CommunityMemberSubmission | null {
    try {
      const raw = localStorage.getItem(COMMUNITY_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  saveCommunitySubmission(submission: CommunityMemberSubmission): void {
    try {
      localStorage.setItem(COMMUNITY_KEY, JSON.stringify(submission));
    } catch (err) {
      console.error('Failed to save community submission:', err);
    }
  },

  // SETTINGS
  loadSettings(): AppSettings {
    try {
      let raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        raw = localStorage.getItem(LEGACY_SETTINGS_KEY);
      }
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  },

  // EXPORT & IMPORT (Section 24 & 25)
  exportData(): string {
    const exportObject = {
      app: 'REMAP',
      version: 2,
      exportedAt: new Date().toISOString(),
      sessions: this.loadSessions(),
      accountabilityRecords: this.loadAccountabilityRecords(),
      settings: this.loadSettings(),
      activeSessionId: this.getActiveSessionId(),
      communitySubmission: this.loadCommunitySubmission(),
    };
    return JSON.stringify(exportObject, null, 2);
  },

  importData(jsonString: string): { success: boolean; message: string; importedCount?: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.sessions)) {
        return { success: false, message: 'Invalid file format. "sessions" array not found.' };
      }
      this.saveSessions(parsed.sessions);
      if (Array.isArray(parsed.accountabilityRecords)) {
        this.saveAccountabilityRecords(parsed.accountabilityRecords);
      }
      if (parsed.settings) {
        this.saveSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      }
      if (parsed.activeSessionId) {
        this.setActiveSessionId(parsed.activeSessionId);
      }
      return {
        success: true,
        message: `Successfully restored ${parsed.sessions.length} work items and accountability records.`,
        importedCount: parsed.sessions.length,
      };
    } catch {
      return { success: false, message: 'Could not read JSON file. Please check file format.' };
    }
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(SESSIONS_KEY);
      localStorage.removeItem(ACTIVE_SESSION_ID_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem(LAST_APP_OPEN_KEY);
      localStorage.removeItem(ACCOUNTABILITY_KEY);
      localStorage.removeItem(COMMUNITY_KEY);
    } catch (err) {
      console.error('Failed to clear data:', err);
    }
  },

  recordAppOpen(): number {
    const now = Date.now();
    try {
      const last = localStorage.getItem(LAST_APP_OPEN_KEY);
      localStorage.setItem(LAST_APP_OPEN_KEY, String(now));
      return last ? Number(last) : 0;
    } catch {
      return 0;
    }
  },
};
