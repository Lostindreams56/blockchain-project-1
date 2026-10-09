import React from 'react';
import { Link } from 'react-router-dom';
import { RetroButton } from '../components/retro/RetroButton';
import { WarningAlertIcon, Win95LogoIcon } from '../components/retro/RetroIcons';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 select-none win95-font"
      style={{ backgroundColor: 'var(--win-desktop-teal)' }}
    >
      <div className="win95-window-frame w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Title Bar */}
        <div className="win95-titlebar-active px-2 py-1 flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5">
            <Win95LogoIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[12px] font-bold text-white">
              Error 404: Resource Not Found
            </span>
          </div>
          <button type="button" className="win95-title-btn" aria-label="Close">
            ✕
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-4 bg-[#C0C0C0]">
          <div className="flex items-start gap-3">
            <WarningAlertIcon className="w-10 h-10 shrink-0" />
            <div>
              <p className="text-[12px] font-bold text-black mb-1">
                The requested URL path does not exist on this workstation.
              </p>
              <p className="text-[11px] text-[#444] leading-snug">
                An invalid page address was specified. Please verify the target route or return
                to the desktop console.
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <Link to="/dashboard">
              <RetroButton variant="primary" className="min-w-[100px]">
                Return to Desktop
              </RetroButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
