import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-indicator-banner"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-[#DDDCD6] dark:border-[#2C2C28] bg-[#F7F6F2] dark:bg-[#22221F] px-4 py-2 text-xs font-medium text-[#171717] dark:text-[#EBEAE5] shadow-md transition-all"
    >
      <WifiOff className="w-3.5 h-3.5 text-[#A56A18]" />
      <span>Offline — All data saved locally on this device</span>
    </div>
  );
};
