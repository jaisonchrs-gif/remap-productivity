/**
 * RESUME Privacy-Conscious Product Analytics
 * 
 * Strict Privacy Mandate:
 * - Tracks actions and feature usage, NEVER user-entered content.
 * - NEVER sends task titles, notes, descriptions, reminder text, personal goals,
 *   client names, email addresses, phone numbers, or community form inputs.
 * - Accountability scores and individual commitment details remain strictly local.
 */

export type AnalyticsEventName =
  | 'app_opened'
  | 'onboarding_completed'
  | 'session_created'
  | 'session_started'
  | 'session_paused'
  | 'session_resumed'
  | 'session_completed'
  | 'task_completed'
  | 'task_moved_to_tomorrow'
  | 'task_marked_pending'
  | 'task_cancelled'
  | 'reminder_created'
  | 'reminder_opened'
  | 'history_opened'
  | 'accountability_opened'
  | 'pattern_opened'
  | 'got_stuck_selected'
  | 'next_step_saved'
  | 'step_completed'
  | 'task_switched'
  | 'community_form_opened'
  | 'community_form_submitted'
  | 'export_started'
  | 'import_completed'
  | 'goal_completed'
  | 'task_reduced'
  | 'task_adapted'
  | 'friction_logged';

export interface SafeAnalyticsParams {
  [key: string]: string | number | boolean | undefined;
}

// Banned parameter keys that could accidentally leak private content
const FORBIDDEN_KEYS = new Set([
  'title',
  'task_title',
  'taskTitle',
  'description',
  'notes',
  'reminder',
  'text',
  'name',
  'email',
  'phone',
  'city',
  'location',
  'score',
  'accountability_score',
  'currentStep',
  'lastCompleted',
  'stuckNote',
]);

class PrivacyAnalytics {
  private debug = process.env.NODE_ENV !== 'production';

  public logEvent(eventName: AnalyticsEventName, params?: SafeAnalyticsParams): void {
    // Sanitize parameters strictly
    const sanitizedParams: Record<string, string | number | boolean> = {};

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (!FORBIDDEN_KEYS.has(key) && value !== undefined) {
          // Additional safety check: Ensure string values don't look like private task text (>80 chars)
          if (typeof value === 'string' && value.length > 50) {
            continue;
          }
          sanitizedParams[key] = value;
        }
      }
    }

    // Attach timestamp and environment indicator
    const eventPayload = {
      event: eventName,
      timestamp: Date.now(),
      params: sanitizedParams,
    };

    if (this.debug) {
      console.log(`[RESUME Analytics SafeEvent]: ${eventName}`, sanitizedParams);
    }

    // If Google Analytics / Firebase Analytics is initialized in the environment, dispatch safely
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (typeof win.gtag === 'function') {
        win.gtag('event', eventName, sanitizedParams);
      }
    }
  }
}

export const analytics = new PrivacyAnalytics();
