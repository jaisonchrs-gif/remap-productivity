import React from 'react';
import { InAppAlert } from '../hooks/useNotifications';
import { Bell, ArrowRight, X } from 'lucide-react';

interface InAppNotificationBannerProps {
  alert: InAppAlert;
  onDismiss: () => void;
  onResumeTask?: (taskId?: string) => void;
}

export const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = ({
  alert,
  onDismiss,
  onResumeTask,
}) => {
  return (
    <div
      id="in-app-notification-banner"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[640px] px-4 animate-in slide-in-from-top-4 duration-200"
    >
      <div className="flex items-start justify-between gap-3 p-4 rounded-2xl border border-[#1F5EFF]/30 bg-[#F7F6F2] dark:bg-[#1C1C1A] shadow-2xl text-[#171717] dark:text-[#EBEAE5]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#1F5EFF]/10 text-[#1F5EFF] shrink-0 mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#1F5EFF]">
              {alert.title}
            </h4>
            <p className="text-sm font-medium leading-snug whitespace-pre-line text-[#171717] dark:text-[#EBEAE5]">
              {alert.body}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {alert.taskId && onResumeTask && (
            <button
              onClick={() => {
                onResumeTask(alert.taskId);
                onDismiss();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#1F5EFF] text-white text-xs font-semibold hover:bg-[#1a50db] transition flex items-center gap-1 cursor-pointer"
            >
              <span>Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-[#6F6F6A] hover:text-[#171717] dark:hover:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
