import React, { useState, useEffect } from 'react';
import { Win95LogoIcon } from '../retro/RetroIcons';
import { feedback } from '../../utils/feedback';
import { Volume2, VolumeX, Database, Activity } from 'lucide-react';

export interface TaskbarWindowItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isActive: boolean;
}

interface TaskbarProps {
  windows: TaskbarWindowItem[];
  isStartMenuOpen: boolean;
  onToggleStartMenu: () => void;
  onWindowClick: (id: string) => void;
  isApiHealthy?: boolean;
  isDbReady?: boolean;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  isStartMenuOpen,
  onToggleStartMenu,
  onWindowClick,
  isApiHealthy = true,
  isDbReady = true,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(feedback.isSoundEnabled());

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundEnabled;
    setSoundEnabled(next);
    feedback.setSoundEnabled(next);
  };

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 h-[38px] bg-[#C0C0C0] win95-raised border-t-2 border-white flex items-center px-1 z-[9990] select-none gap-1.5"
      role="navigation"
      aria-label="Desktop Taskbar"
    >
      {/* Start Button */}
      <button
        id="start-button"
        type="button"
        onClick={() => {
          feedback.playClick();
          onToggleStartMenu();
        }}
        className={`h-[28px] px-2 flex items-center gap-1.5 win95-font text-[12px] font-bold text-black outline-none cursor-pointer ${
          isStartMenuOpen ? 'win95-depressed bg-[#B0B0B0]' : 'win95-raised bg-[#C0C0C0]'
        }`}
        aria-expanded={isStartMenuOpen}
        aria-haspopup="menu"
      >
        <Win95LogoIcon className="w-4 h-4 shrink-0" />
        <span className="tracking-wide">Start</span>
      </button>

      {/* Sunken Vertical Separator */}
      <div className="w-[2px] h-[22px] bg-[#808080] border-r border-white mx-0.5 shrink-0" />

      {/* Active Windows Tabs */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto h-[30px] py-0.5 no-scrollbar">
        {windows
          .filter((w) => w.isOpen)
          .map((w) => {
            const isPressed = w.isActive && !w.isMinimized;

            return (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  feedback.playClick();
                  onWindowClick(w.id);
                }}
                className={`h-[26px] max-w-[160px] min-w-[110px] px-2 flex items-center gap-1.5 text-[11px] win95-font font-medium truncate outline-none cursor-pointer ${
                  isPressed
                    ? 'win95-depressed bg-[#DFDFDF] font-bold text-black'
                    : 'win95-raised bg-[#C0C0C0] text-black hover:bg-[#D4D0C8]'
                }`}
                title={w.title}
              >
                {w.icon && <span className="shrink-0 flex items-center">{w.icon}</span>}
                <span className="truncate leading-none">{w.title}</span>
              </button>
            );
          })}
      </div>

      {/* System Tray (Notification Area) */}
      <div className="h-[28px] win95-sunken bg-[#C0C0C0] px-2 flex items-center gap-2 shrink-0 text-[11px] win95-font text-black">
        {/* Audio Toggle Indicator */}
        <button
          type="button"
          onClick={handleToggleSound}
          className="hover:bg-black/10 p-0.5 rounded cursor-pointer"
          title={soundEnabled ? 'Retro Audio: Enabled (Click to Mute)' : 'Retro Audio: Muted (Click to Unmute)'}
          aria-label="Toggle retro audio"
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-[#000080]" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-[#808080]" />
          )}
        </button>

        {/* Database Readiness Indicator */}
        <span
          className="flex items-center gap-0.5"
          title={isDbReady ? 'MongoDB Atlas: Connected' : 'MongoDB: Standby/Disconnected'}
        >
          <Database className={`w-3.5 h-3.5 ${isDbReady ? 'text-[#008000]' : 'text-[#AA0000]'}`} />
        </span>

        {/* Backend API Health Indicator */}
        <span
          className="flex items-center gap-0.5"
          title={isApiHealthy ? 'Express API: Online (5000)' : 'Express API: Unreachable'}
        >
          <Activity className={`w-3.5 h-3.5 ${isApiHealthy ? 'text-[#008000]' : 'text-[#AA0000]'}`} />
        </span>

        {/* Digital Clock */}
        <div className="pl-1 border-l border-[#808080] win95-font font-medium tracking-tight">
          {timeStr || '12:00 PM'}
        </div>
      </div>
    </footer>
  );
};
