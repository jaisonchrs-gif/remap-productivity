import { useState, useEffect, useCallback } from 'react';
import { analytics } from '../lib/analytics';

export interface InAppAlert {
  id: string;
  title: string;
  body: string;
  taskId?: string;
  timestamp: number;
}

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [inAppAlert, setInAppAlert] = useState<InAppAlert | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    } else {
      setIsSupported(false);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setPermission(res);
        return true; // Enables notifications (browser-level if granted, in-app always)
      } catch (err) {
        console.warn('Browser notification permission error or restricted iframe:', err);
        return true; // Still enable in-app notifications
      }
    }
    return true; // Fallback to in-app notifications
  }, []);

  const dismissInAppAlert = useCallback(() => {
    setInAppAlert(null);
  }, []);

  const triggerAlert = useCallback((title: string, body: string, taskId?: string) => {
    // 1. In-App Notification (Always works even in iframes or sandboxed environments)
    setInAppAlert({
      id: 'alert_' + Date.now(),
      title,
      body,
      taskId,
      timestamp: Date.now(),
    });

    // 2. System Browser Notification (if allowed)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/icon.svg',
          tag: `resume-reminder-${taskId || 'general'}`,
        });

        analytics.logEvent('reminder_opened');

        notif.onclick = () => {
          window.focus();
          if (taskId) {
            window.location.hash = `#/accountability-check?id=${taskId}`;
          } else {
            window.location.hash = '#/resume';
          }
        };
      } catch (e) {
        console.warn('System notification display error:', e);
      }
    }
  }, []);

  const scheduleReminder = useCallback(
    (delayMs: number, targetTimestamp?: number, nextStepTitle?: string, taskId?: string) => {
      analytics.logEvent('reminder_created', {
        delay_seconds: Math.round(delayMs / 1000),
      });

      const safeDelay = Math.max(100, delayMs);

      setTimeout(() => {
        const bodyText = nextStepTitle
          ? `You left something unfinished:\n"${nextStepTitle}"`
          : 'You left something unfinished. Open RESUME to continue your work.';

        triggerAlert('RESUME — Pick up where you left off', bodyText, taskId);
      }, safeDelay);
    },
    [triggerAlert]
  );

  const sendTestNotification = useCallback(() => {
    triggerAlert(
      'RESUME — Reminder Active',
      'This is how you will be reminded to pick up unfinished work.',
      undefined
    );
  }, [triggerAlert]);

  return {
    isSupported,
    permission,
    inAppAlert,
    dismissInAppAlert,
    requestPermission,
    scheduleReminder,
    sendTestNotification,
  };
}
