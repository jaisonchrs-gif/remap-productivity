import React from 'react';
import { ArrowLeft, Shield, Database, Activity, Users, Bell, Trash2 } from 'lucide-react';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => {
  return (
    <div id="privacy-policy-screen" className="py-2 animate-in fade-in duration-200">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] mb-4 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C7A57]/10 text-[#3C7A57] text-[11px] font-semibold tracking-wider uppercase mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>TRANSPARENCY</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5]">
          Privacy Policy
        </h2>
        <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] mt-1">
          Last updated: September 2026. How RESUME protects your work and data.
        </p>
      </div>

      <div className="space-y-5 text-[#171717] dark:text-[#EBEAE5]">
        {/* 1. Local Productivity Data */}
        <section className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#1F5EFF]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              1. Local-First Productivity Data
            </h3>
          </div>
          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed">
            All your tasks, work sessions, timer intervals, pause notes, stop reasons, and accountability history are stored strictly locally on your device (via your browser database or local SQLite/Room storage on Android). No mandatory login or user account is required to use RESUME, and we do not operate a cloud database holding your task or session data.
          </p>
        </section>

        {/* 2. Privacy-Conscious Analytics */}
        <section className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1F5EFF]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              2. Privacy-Conscious Analytics
            </h3>
          </div>
          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed">
            RESUME logs anonymous, high-level action events (such as opening the app, starting or pausing a timer, or viewing settings) strictly to evaluate product reliability and usability.
          </p>
          <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-[#DDDCD6]/40 dark:border-[#2C2C28]/40 text-[11px] text-[#6F6F6A] dark:text-[#9E9D97] space-y-1">
            <p className="font-semibold text-[#171717] dark:text-[#EBEAE5]">
              Strict Content Masking Guarantee:
            </p>
            <p>
              We NEVER transmit task titles, notes, descriptions, reminder text, personal goals, client names, email addresses, or phone numbers. Analytics describes actions, never private content.
            </p>
          </div>
        </section>

        {/* 3. UX Analytics & Clarity */}
        <section className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#1F5EFF]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              3. UX Session Recording Masking
            </h3>
          </div>
          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed">
            All user-entered text fields, note inputs, task titles, and form inputs carry strict privacy masking attributes (<code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/5 font-mono text-[10px]">data-clarity-mask=&quot;true&quot;</code>) so that third-party diagnostic and UX recording tools cannot capture sensitive information.
          </p>
        </section>

        {/* 4. Voluntary Community Network */}
        <section className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1F5EFF]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              4. Community Information
            </h3>
          </div>
          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed">
            Joining the RESUME Community is entirely voluntary and is never required to use any productivity feature. Information submitted (name, email, optional phone, and optional location) is used solely to facilitate community cohorts and send updates if you explicitly opt in. We do not sell community information.
          </p>
        </section>

        {/* 5. Notifications */}
        <section className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#1F5EFF]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              5. Local Device Reminders
            </h3>
          </div>
          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed">
            Reminder alerts are scheduled on your local operating system or browser via the Web Notifications API. We do not pass your schedule to remote servers. You can revoke notification permissions at any time through your browser or device settings.
          </p>
        </section>

        {/* 6. Data Controls & Deletion */}
        <section className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-2">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-[#B84A4A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              6. Data Export &amp; Total Deletion
            </h3>
          </div>
          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed">
            You maintain complete ownership of your productivity history. From the Settings tab, you can export your entire dataset as a JSON file at any time, or click &ldquo;Delete all local data&rdquo; to permanently purge all tasks, sessions, and logs from this device.
          </p>
        </section>

        {/* 7. Google Play Policy & Developer Contact */}
        <section className="p-4 rounded-xl border border-[#DDDCD6]/80 dark:border-[#2C2C28] bg-white/40 dark:bg-[#1C1C1A]/40 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#3C7A57]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              7. Google Play Compliance &amp; Contact
            </h3>
          </div>
          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed">
            RESUME complies strictly with Google Play Console Developer Policies, Family and COPPA guidelines. We do not knowingly collect personal data from children under 13, and our app functions entirely without advertising or behavioral profiling trackers.
          </p>
          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] pt-1">
            For privacy inquiries, questions, or data requests, contact: <a href="mailto:jaisonchrs@gmail.com" className="text-[#1F5EFF] underline font-medium">jaisonchrs@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};
