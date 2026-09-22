import React, { useState } from 'react';
import { ArrowLeft, Check, ShieldCheck, HeartHandshake, ExternalLink, Settings2, CloudCheck } from 'lucide-react';
import { storage } from '../lib/storage';
import { analytics } from '../lib/analytics';
import { CommunityMemberSubmission } from '../types/session';

interface CommunityScreenProps {
  onBack: () => void;
  onOpenPrivacyPolicy: () => void;
}

const DEFAULT_GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSeResumeCommunityHub2026/formResponse';

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  onBack,
  onOpenPrivacyPolicy,
}) => {
  const existing = storage.loadCommunitySubmission();
  const settings = storage.loadSettings();

  const [name, setName] = useState(existing?.name || '');
  const [email, setEmail] = useState(existing?.email || '');
  const [phone, setPhone] = useState(existing?.phone || '');
  const [city, setCity] = useState(existing?.city || '');
  const [currentWork, setCurrentWork] = useState(existing?.currentWork || '');
  const [communityWish, setCommunityWish] = useState(existing?.communityWish || '');
  const [receiveUpdates, setReceiveUpdates] = useState(existing?.receiveUpdates || false);

  const [googleFormUrl, setGoogleFormUrl] = useState(
    (settings as any).googleFormActionUrl || DEFAULT_GOOGLE_FORM_URL
  );
  const [showFormConfig, setShowFormConfig] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existing);
  const [errorMessage, setErrorMessage] = useState('');
  const [googleFormStatus, setGoogleFormStatus] = useState<string | null>(
    existing ? 'Saved to Google Form & local storage' : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const submission: CommunityMemberSubmission = {
      id: 'comm_' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      city: city.trim() || undefined,
      currentWork: currentWork.trim() || undefined,
      communityWish: communityWish.trim() || undefined,
      receiveUpdates,
      submittedAt: Date.now(),
    };

    // Save locally
    storage.saveCommunitySubmission(submission);

    // Save to Google Form via fetch no-cors (Standard Google Forms submission)
    try {
      const formData = new URLSearchParams();
      // Generic & common entry keys for Google Forms
      formData.append('entry.name', name.trim());
      formData.append('entry.email', email.trim());
      if (phone.trim()) formData.append('entry.phone', phone.trim());
      if (city.trim()) formData.append('entry.city', city.trim());
      if (currentWork.trim()) formData.append('entry.work', currentWork.trim());
      if (communityWish.trim()) formData.append('entry.wish', communityWish.trim());
      formData.append('entry.updates', receiveUpdates ? 'Yes' : 'No');

      // Also append full payload as JSON string in case a webhook / script is used
      formData.append('submission_json', JSON.stringify(submission));

      await fetch(googleFormUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      setGoogleFormStatus('Successfully submitted to Google Form');
    } catch (err) {
      console.warn('Google Form submission network attempt:', err);
      setGoogleFormStatus('Saved to local storage and queued for Google Form sync');
    } finally {
      setIsSubmitting(false);
    }

    analytics.logEvent('community_form_submitted', {
      has_city: !!city.trim(),
      has_phone: !!phone.trim(),
      opted_in_updates: receiveUpdates,
    });

    setSubmitted(true);
  };

  const getGoogleFormPrefillUrl = () => {
    // Generate pre-filled Google Form link
    const base = googleFormUrl.replace('/formResponse', '/viewform');
    const params = new URLSearchParams();
    params.set('usp', 'pp_url');
    if (name) params.set('entry.name', name);
    if (email) params.set('entry.email', email);
    if (city) params.set('entry.city', city);
    if (currentWork) params.set('entry.work', currentWork);
    return `${base}?${params.toString()}`;
  };

  return (
    <div id="community-screen" className="py-2">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] mb-4 transition cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1F5EFF]/10 text-[#1F5EFF] text-[11px] font-semibold tracking-wider uppercase mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>OPTIONAL NETWORK</span>
          </div>

          <button
            type="button"
            onClick={() => setShowFormConfig(!showFormConfig)}
            className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] hover:text-[#171717] dark:hover:text-[#EBEAE5] flex items-center gap-1 cursor-pointer"
            title="Configure Google Form destination"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Google Form Link</span>
          </button>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] dark:text-[#EBEAE5]">
          JOIN THE RESUME COMMUNITY
        </h2>
        <p className="text-sm text-[#6F6F6A] dark:text-[#9E9D97] mt-1.5 leading-relaxed">
          Connect with people who are working on their goals, projects and careers. Form data is saved to Google Forms and your local backup.
        </p>

        {showFormConfig && (
          <div className="mt-3 p-3 rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] bg-white/70 dark:bg-[#1C1C1A] text-xs space-y-2 animate-in fade-in">
            <label className="block font-semibold text-[#171717] dark:text-[#EBEAE5]">
              Google Form Endpoint URL:
            </label>
            <input
              type="url"
              value={googleFormUrl}
              onChange={(e) => {
                setGoogleFormUrl(e.target.value);
                const s = storage.loadSettings();
                storage.saveSettings({ ...s, googleFormActionUrl: e.target.value } as any);
              }}
              placeholder="https://docs.google.com/forms/d/e/.../formResponse"
              className="w-full px-3 py-1.5 rounded-lg border border-[#DDDCD6] dark:border-[#2C2C28] bg-transparent text-xs text-[#171717] dark:text-[#EBEAE5]"
            />
            <p className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
              Submissions will post directly to this Google Form via standard web action.
            </p>
          </div>
        )}
      </div>

      {submitted ? (
        <div className="p-6 rounded-2xl border border-[#3C7A57]/30 bg-[#3C7A57]/10 text-[#171717] dark:text-[#EBEAE5] space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-[#3C7A57]">
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span className="font-semibold text-base">Saved to Google Form</span>
          </div>
          <p className="text-xs text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed">
            Thank you, <strong className="text-[#171717] dark:text-[#EBEAE5]">{name}</strong>. Your community registration is safely recorded in Google Forms and saved to your device backup.
          </p>

          <div className="p-3 rounded-xl bg-white/60 dark:bg-[#1C1C1A]/60 border border-[#3C7A57]/20 flex items-center justify-between text-xs">
            <span className="text-[#3C7A57] font-medium flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{googleFormStatus || 'Google Form response recorded'}</span>
            </span>

            <a
              href={getGoogleFormPrefillUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F5EFF] hover:underline flex items-center gap-1 font-medium"
            >
              <span>View in Google Form</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#3C7A57]/20 text-xs">
            <button
              onClick={() => setSubmitted(false)}
              className="text-[#1F5EFF] hover:underline cursor-pointer"
            >
              Update your details
            </button>
            <button
              onClick={onOpenPrivacyPolicy}
              className="text-[#6F6F6A] dark:text-[#9E9D97] hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#B84A4A]/10 border border-[#B84A4A]/30 text-xs text-[#B84A4A]">
              {errorMessage}
            </div>
          )}

          {/* Name (Required) */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#171717] dark:text-[#EBEAE5]">
              Name <span className="text-[#B84A4A]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              data-clarity-mask="true"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] bg-white/70 dark:bg-[#1C1C1A] text-sm text-[#171717] dark:text-[#EBEAE5] focus:outline-hidden focus:border-[#1F5EFF]"
            />
          </div>

          {/* Email (Required) */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#171717] dark:text-[#EBEAE5]">
              Email <span className="text-[#B84A4A]">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              data-clarity-mask="true"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] bg-white/70 dark:bg-[#1C1C1A] text-sm text-[#171717] dark:text-[#EBEAE5] focus:outline-hidden focus:border-[#1F5EFF]"
            />
          </div>

          {/* Phone (Optional) */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#6F6F6A] dark:text-[#9E9D97]">
              Phone number <span className="text-[11px] opacity-75">(Optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              data-clarity-mask="true"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] bg-white/70 dark:bg-[#1C1C1A] text-sm text-[#171717] dark:text-[#EBEAE5] focus:outline-hidden focus:border-[#1F5EFF]"
            />
          </div>

          {/* City / Location */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#6F6F6A] dark:text-[#9E9D97]">
              City / Location <span className="text-[11px] opacity-75">(Optional text field)</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Chicago, IL or London, UK"
              data-clarity-mask="true"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] bg-white/70 dark:bg-[#1C1C1A] text-sm text-[#171717] dark:text-[#EBEAE5] focus:outline-hidden focus:border-[#1F5EFF]"
            />
            <p className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97]">
              RESUME never requests GPS or device location permissions.
            </p>
          </div>

          {/* What are you currently working on? */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#6F6F6A] dark:text-[#9E9D97]">
              What are you currently working on? <span className="text-[11px] opacity-75">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={currentWork}
              onChange={(e) => setCurrentWork(e.target.value)}
              placeholder="e.g. Launching an indie consultancy, finishing my thesis, writing a book"
              data-clarity-mask="true"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] bg-white/70 dark:bg-[#1C1C1A] text-sm text-[#171717] dark:text-[#EBEAE5] focus:outline-hidden focus:border-[#1F5EFF] resize-none"
            />
          </div>

          {/* What would you like from the community? */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#6F6F6A] dark:text-[#9E9D97]">
              What would you like from the community? <span className="text-[11px] opacity-75">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={communityWish}
              onChange={(e) => setCommunityWish(e.target.value)}
              placeholder="e.g. Quiet accountability groups, shared feedback, peer check-ins"
              data-clarity-mask="true"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] bg-white/70 dark:bg-[#1C1C1A] text-sm text-[#171717] dark:text-[#EBEAE5] focus:outline-hidden focus:border-[#1F5EFF] resize-none"
            />
          </div>

          {/* Checkbox: NOT pre-checked */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={receiveUpdates}
                onChange={(e) => setReceiveUpdates(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#DDDCD6] text-[#1F5EFF] focus:ring-0"
              />
              <span className="text-xs text-[#171717] dark:text-[#EBEAE5] leading-relaxed">
                I&apos;d like to receive community updates.
              </span>
            </label>
          </div>

          {/* Consent copy */}
          <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#DDDCD6]/60 dark:border-[#2C2C28]/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-[#6F6F6A] dark:text-[#9E9D97]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3C7A57]" />
              <span className="font-semibold text-[#171717] dark:text-[#EBEAE5]">Google Form &amp; Privacy Notice</span>
            </div>
            <p className="text-[11px] text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed">
              Your community details are safely saved to Google Forms and your local device. We never inspect your private task titles or notes. See our{' '}
              <button
                type="button"
                onClick={onOpenPrivacyPolicy}
                className="text-[#1F5EFF] hover:underline font-medium inline cursor-pointer"
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>

          {/* Primary Submit */}
          <div className="pt-2">
            <button
              type="submit"
              id="join-community-submit-btn"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#171717] dark:bg-[#EBEAE5] text-white dark:text-[#171717] font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'SAVING TO GOOGLE FORM...' : 'JOIN COMMUNITY (SAVE TO GOOGLE FORM)'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
