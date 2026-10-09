import React from 'react';

interface StatusBarPanel {
  content: React.ReactNode;
  width?: string;
}

interface RetroStatusBarProps {
  message?: string;
  panels?: StatusBarPanel[];
  className?: string;
}

export const RetroStatusBar: React.FC<RetroStatusBarProps> = ({
  message = 'Ready',
  panels = [],
  className = '',
}) => {
  return (
    <div
      className={`h-6 bg-[#C0C0C0] border-t border-[#808080] flex items-center px-1 gap-1 text-[11px] win95-font text-black select-none ${className}`}
    >
      {/* Primary Message Panel */}
      <div className="flex-1 win95-sunken px-2 py-0.5 truncate bg-[#C0C0C0] text-[11px] h-[19px] flex items-center">
        {message}
      </div>

      {/* Additional Configured Panels */}
      {panels.map((panel, idx) => (
        <div
          key={idx}
          style={{ width: panel.width }}
          className="win95-sunken px-2 py-0.5 truncate bg-[#C0C0C0] text-[11px] h-[19px] flex items-center shrink-0"
        >
          {panel.content}
        </div>
      ))}

      {/* Classic Resize Grip lines in bottom-right corner */}
      <div className="w-3 h-3 flex flex-col justify-end items-end p-0.5 shrink-0 opacity-60">
        <div className="w-1 h-1 bg-[#808080] mb-0.5" />
        <div className="flex gap-0.5">
          <div className="w-1 h-1 bg-[#808080]" />
          <div className="w-1 h-1 bg-[#808080]" />
        </div>
      </div>
    </div>
  );
};
