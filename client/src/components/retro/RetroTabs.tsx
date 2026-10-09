import React from 'react';
import { feedback } from '../../utils/feedback';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface RetroTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const RetroTabs: React.FC<RetroTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex items-end gap-0.5 border-b-2 border-white pl-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              feedback.playClick();
              onChange(tab.id);
            }}
            className={`win95-font text-[11px] px-3 py-1 flex items-center gap-1.5 cursor-pointer outline-none relative select-none ${
              isActive
                ? 'bg-[#C0C0C0] font-bold text-black border-t-2 border-l-2 border-r-2 border-white border-r-[#808080] -mb-[2px] pb-1.5 z-10'
                : 'bg-[#B0B0B0] text-[#404040] hover:text-black border-t border-l border-r border-[#DFDFDF] border-r-[#808080] mb-0'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
