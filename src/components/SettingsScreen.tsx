import React, { useRef, useState } from 'react';
import { AppSettings } from '../types/session';
import {
  ArrowLeft,
  Download,
  Upload,
  Trash2,
  Shield,
  Moon,
  Sun,
  Monitor,
  HeartHandshake,
  FileText,
  Info,
  Bell,
  Check,
} from 'lucide-react';
import { analytics } from '../lib/analytics';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onExportData: () => void;
  onImportData: (jsonString: string) => { success: boolean; message: string };
  onClearAllData: () => void;
  onRequestNotificationPermission: () => Promise<boolean>;
  onSendTestNotification?: () => void;
  onNavigateToCommunity: () => void;
  onNavigateToPrivacy: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onClearAllData,
  onRequestNotificationPermission,
  onSendTestNotification,
  onNavigateToCommunity,
  onNavigateToPrivacy,
  onBack,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [testSent, setTestSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleNotifications = async () => {
    if (!settings.notificationsEnabled) {
      await onRequestNotificationPermission();
      onUpdateSettings({
        ...settings,
        notificationsEnabled: true,
        notificationPermissionAsked: true,
      });
    } else {
      onUpdateSettings({
        ...settings,
        notificationsEnabled: false,
      });
    }
  };

  const handleTestNotification = () => {
    if (onSendTestNotification) {
      onSendTestNotification();
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    analytics.logEvent('import_completed');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = onImportData(content);
        setImportStatus(result.message);
        setTimeout(() => setImportStatus(null), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportClick = () => {
    analytics.logEvent('export_started');
    onExportData();
  };

  return (
    <div id="settings-screen" className="py-2">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] mb-4 transition cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Workspace</span>
      </button>

      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5]">
          Settings
        </h2>
        <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] mt-1">
          Preferences &amp; local data control.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance / Theme */}
        <div className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40">
          <label className="block text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-bold mb-3">
            THEME
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'light', label: 'Light Mode', icon: Sun },
              { id: 'dark', label: 'Dark Mode', icon: Moon },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onUpdateSettings({ ...settings, theme: t.id as 'light' | 'dark' })}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer min-h-[44px] ${
                    isSelected
                      ? 'border-[#171717] bg-[#171717] text-[#F7F6F2] dark:border-[#EBEAE5] dark:bg-[#EBEAE5] dark:text-[#171717] shadow-xs'
                      : 'border-[#DDDCD6] dark:border-[#2C2C28] text-[#171717] dark:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-bold">
                NOTIFICATIONS &amp; REMINDERS
              </span>
              <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] mt-0.5">
                In-app &amp; browser reminders when you return to unfinished work.
              </p>
            </div>
            <button
              id="settings-notification-toggle-btn"
              onClick={handleToggleNotifications}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                settings.notificationsEnabled
                  ? 'border-[#1F5EFF] bg-[#1F5EFF] text-white shadow-2xs'
                  : 'border-[#DDDCD6] dark:border-[#2C2C28] text-[#6F6F6A] dark:text-[#9E9D97] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {settings.notificationsEnabled ? 'Enabled' : 'Off'}
            </button>
          </div>

          {settings.notificationsEnabled && (
            <div className="pt-1 flex items-center justify-between border-t border-[#DDDCD6]/60 dark:border-[#2C2C28]/60 text-xs">
              <span className="text-[#3C7A57] font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Reminders active (in-app &amp; system)</span>
              </span>

              <button
                onClick={handleTestNotification}
                className="text-[#1F5EFF] hover:underline font-medium cursor-pointer"
              >
                {testSent ? 'Reminder sent!' : 'Send test reminder'}
              </button>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#6F6F6A] dark:text-[#9E9D97] font-semibold mb-2">
              Default reminder timing
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['30m', '1h', '3h', 'tomorrow'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => onUpdateSettings({ ...settings, reminderDefault: opt })}
                  className={`py-1.5 text-xs rounded-md border text-center transition cursor-pointer ${
                    settings.reminderDefault === opt
                      ? 'border-[#1F5EFF] bg-[#1F5EFF]/10 text-[#1F5EFF] font-medium'
                      : 'border-[#DDDCD6]/60 dark:border-[#2C2C28] text-[#6F6F6A] dark:text-[#9E9D97]'
                  }`}
                >
                  {opt === '30m' ? '30m' : opt === '1h' ? '1 hour' : opt === '3h' ? '3 hours' : 'Tomorrow'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Community & Connection */}
        <div className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-bold">
              <HeartHandshake className="w-3.5 h-3.5 text-[#1F5EFF]" />
              <span>RESUME COMMUNITY</span>
            </div>
            <span className="text-[11px] text-[#1F5EFF] font-medium">Google Form Integrated</span>
          </div>
          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed">
            Connect with others working on their goals, independent projects, and careers. Submissions sync to Google Forms.
          </p>
          <button
            id="settings-community-btn"
            onClick={onNavigateToCommunity}
            className="w-full py-2.5 px-3 rounded-lg border border-[#DDDCD6] dark:border-[#2C2C28] bg-white/60 dark:bg-[#22221F] text-xs font-semibold text-[#171717] dark:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Open Community Registration</span>
          </button>
        </div>

        {/* Data Management */}
        <div className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-3">
          <span className="block text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-bold">
            DATA &amp; BACKUP
          </span>
          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97]">
            Because all your data stays strictly on this device, you can export a complete backup anytime or import to restore.
          </p>

          {importStatus && (
            <div className="p-2.5 rounded-lg bg-[#3C7A57]/10 text-[#3C7A57] text-xs font-medium">
              {importStatus}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={handleExportClick}
              className="flex-1 py-2 px-3 rounded-lg border border-[#DDDCD6] dark:border-[#2C2C28] text-xs font-medium text-[#171717] dark:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export backup (.json)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 px-3 rounded-lg border border-[#DDDCD6] dark:border-[#2C2C28] text-xs font-medium text-[#171717] dark:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import backup</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#3C7A57]" />
            <span className="text-xs uppercase tracking-widest text-[#6F6F6A] dark:text-[#9E9D97] font-bold">
              PRIVACY &amp; LOCAL STORAGE
            </span>
          </div>
          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed">
            REMAP stores all tasks, steps, notes, and accountability scores locally on your device. We never inspect or sell your private task contents.
          </p>
          <button
            onClick={onNavigateToPrivacy}
            className="text-xs text-[#1F5EFF] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Read full Privacy Policy</span>
          </button>
        </div>

        {/* Delete All Data */}
        <div className="pt-2">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-2.5 px-3 rounded-lg border border-[#B84A4A]/30 text-xs font-medium text-[#B84A4A] hover:bg-[#B84A4A]/5 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete all local data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] bg-[#F7F6F2] dark:bg-[#1C1C1A] p-5 shadow-xl text-[#171717] dark:text-[#EBEAE5] space-y-3 animate-in fade-in">
            <h3 className="text-base font-bold text-[#B84A4A]">Delete all local data?</h3>
            <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed">
              This will permanently delete all tasks, history, commitment logs, and settings stored on this device. This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-[#DDDCD6] dark:border-[#2C2C28] text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAllData();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-2 rounded-lg bg-[#B84A4A] text-white text-xs font-medium hover:bg-[#a03f3f] transition cursor-pointer"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
