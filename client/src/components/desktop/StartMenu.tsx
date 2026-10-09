import React, { useRef, useEffect } from 'react';
import {
  ShieldScannerIcon,
  WalletExplorerIcon,
  ModelCpuIcon,
  FolderReportsIcon,
  SettingsIcon,
  HelpBookIcon,
  KeyLockIcon,
} from '../retro/RetroIcons';
import { feedback } from '../../utils/feedback';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWindow: (windowId: string) => void;
  onLogout: () => void;
  userName?: string;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  onOpenWindow,
  onLogout,
  userName = 'Analyst',
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      // If clicked outside the menu and not on the start button
      const target = e.target as HTMLElement;
      if (menuRef.current && !menuRef.current.contains(target) && !target.closest('#start-button')) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleItemClick = (action: () => void) => {
    feedback.playClick();
    onClose();
    action();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bottom-[38px] left-0 z-[9000] win95-window-frame flex shadow-2xl animate-in fade-in duration-75 select-none"
      style={{ width: '240px' }}
      role="menu"
      aria-label="Start Menu"
    >
      {/* Vintage Left Vertical Title Banner */}
      <div className="w-[34px] bg-gradient-to-b from-[#000080] via-[#1084D0] to-[#000080] flex items-end justify-center pb-3 border-r border-[#404040]">
        <div className="transform -rotate-90 origin-bottom-center whitespace-nowrap text-white font-extrabold tracking-widest text-xs win95-font mb-4">
          <span className="font-bold text-[#FFAA00]">FraudOS</span> 95
        </div>
      </div>

      {/* Menu Actions List */}
      <div className="flex-1 bg-[#C0C0C0] p-1 flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => handleItemClick(() => onOpenWindow('scanner'))}
          className="flex items-center gap-3 px-2 py-1.5 hover:bg-[#000080] hover:text-white text-black text-[12px] win95-font text-left cursor-pointer outline-none group"
        >
          <span className="w-5 h-5 flex items-center justify-center shrink-0">
            <ShieldScannerIcon className="w-5 h-5" />
          </span>
          <span className="font-semibold">Fraud Scanner</span>
        </button>

        <button
          type="button"
          onClick={() => handleItemClick(() => onOpenWindow('explorer'))}
          className="flex items-center gap-3 px-2 py-1.5 hover:bg-[#000080] hover:text-white text-black text-[12px] win95-font text-left cursor-pointer outline-none group"
        >
          <span className="w-5 h-5 flex items-center justify-center shrink-0">
            <WalletExplorerIcon className="w-5 h-5" />
          </span>
          <span>Wallet Explorer</span>
        </button>

        <button
          type="button"
          onClick={() => handleItemClick(() => onOpenWindow('model'))}
          className="flex items-center gap-3 px-2 py-1.5 hover:bg-[#000080] hover:text-white text-black text-[12px] win95-font text-left cursor-pointer outline-none group"
        >
          <span className="w-5 h-5 flex items-center justify-center shrink-0">
            <ModelCpuIcon className="w-5 h-5" />
          </span>
          <span>Model Telemetry</span>
        </button>

        <button
          type="button"
          onClick={() => handleItemClick(() => onOpenWindow('history'))}
          className="flex items-center gap-3 px-2 py-1.5 hover:bg-[#000080] hover:text-white text-black text-[12px] win95-font text-left cursor-pointer outline-none group"
        >
          <span className="w-5 h-5 flex items-center justify-center shrink-0">
            <FolderReportsIcon className="w-5 h-5" />
          </span>
          <span>Investigation Dossiers</span>
        </button>

        {/* Divider */}
        <div className="my-1 border-t border-[#808080] border-b border-white" />

        <button
          type="button"
          onClick={() => handleItemClick(() => onOpenWindow('settings'))}
          className="flex items-center gap-3 px-2 py-1.5 hover:bg-[#000080] hover:text-white text-black text-[12px] win95-font text-left cursor-pointer outline-none group"
        >
          <span className="w-5 h-5 flex items-center justify-center shrink-0">
            <SettingsIcon className="w-5 h-5" />
          </span>
          <span>Control Panel & Settings...</span>
        </button>

        <button
          type="button"
          onClick={() => handleItemClick(() => onOpenWindow('about'))}
          className="flex items-center gap-3 px-2 py-1.5 hover:bg-[#000080] hover:text-white text-black text-[12px] win95-font text-left cursor-pointer outline-none group"
        >
          <span className="w-5 h-5 flex items-center justify-center shrink-0">
            <HelpBookIcon className="w-5 h-5" />
          </span>
          <span>About FraudOS 95...</span>
        </button>

        {/* Divider */}
        <div className="my-1 border-t border-[#808080] border-b border-white" />

        <button
          type="button"
          onClick={() => handleItemClick(onLogout)}
          className="flex items-center gap-3 px-2 py-1.5 hover:bg-[#000080] hover:text-white text-black text-[12px] win95-font text-left cursor-pointer outline-none group"
        >
          <span className="w-5 h-5 flex items-center justify-center shrink-0">
            <KeyLockIcon className="w-5 h-5" />
          </span>
          <span>Log Off {userName}...</span>
        </button>
      </div>
    </div>
  );
};
