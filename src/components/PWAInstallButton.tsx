import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-[#DDDCD6] dark:border-[#2C2C28] text-[#171717] dark:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5 transition"
        title="Install app to your device"
      >
        <Download className="w-3.5 h-3.5 text-[#1F5EFF]" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-[#DDDCD6] dark:border-[#2C2C28] text-[#171717] dark:text-[#EBEAE5] hover:bg-black/5 dark:hover:bg-white/5 transition"
        >
          <Download className="w-3.5 h-3.5 text-[#1F5EFF]" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div
            id="ios-pwa-guide-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
          >
            <div className="w-full max-w-sm rounded-xl border border-[#DDDCD6] dark:border-[#2C2C28] bg-[#F7F6F2] dark:bg-[#1C1C1A] p-6 shadow-xl text-[#171717] dark:text-[#EBEAE5]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">Install on iOS</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded text-[#6F6F6A] hover:text-[#171717] dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-[#6F6F6A] dark:text-[#9E9D97] leading-relaxed mb-4">
                1. Tap the <strong>Share</strong> icon in Safari&apos;s toolbar.<br />
                2. Select <strong>Add to Home Screen</strong>.<br />
                3. Open RESUME anytime with full offline access.
              </p>
              <button
                id="ios-guide-close-btn"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-lg bg-[#171717] dark:bg-[#EBEAE5] text-[#F7F6F2] dark:text-[#171717] text-sm font-medium transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
