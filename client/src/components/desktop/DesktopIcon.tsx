import React from 'react';
import { feedback } from '../../utils/feedback';

interface DesktopIconProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  label,
  icon,
  isSelected,
  onSelect,
  onOpen,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    feedback.playClick();
    onSelect();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    feedback.playWindowOpen();
    onOpen();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      feedback.playWindowOpen();
      onOpen();
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={label}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      className={`win95-desktop-icon outline-none transition-colors ${
        isSelected ? 'selected' : 'hover:bg-white/10'
      }`}
    >
      <div className="w-9 h-9 flex items-center justify-center shrink-0 drop-shadow-md">
        {icon}
      </div>
      <div className="win95-icon-label select-none">{label}</div>
    </div>
  );
};
