import React, { useState, useRef, useEffect } from 'react';
import { feedback } from '../../utils/feedback';

export interface MenuItem {
  label?: string;
  action?: () => void;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

interface RetroMenuBarProps {
  categories: MenuCategory[];
  className?: string;
}

export const RetroMenuBar: React.FC<RetroMenuBarProps> = ({ categories, className = '' }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenIndex(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTitleClick = (index: number) => {
    feedback.playClick();
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleTitleHover = (index: number) => {
    if (openIndex !== null && openIndex !== index) {
      setOpenIndex(index);
    }
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled || item.divider) return;
    feedback.playClick();
    setOpenIndex(null);
    if (item.action) {
      item.action();
    }
  };

  return (
    <div
      ref={menuBarRef}
      className={`h-6 bg-[#C0C0C0] border-b border-[#808080] flex items-center px-1 text-[11px] win95-font text-black select-none relative ${className}`}
    >
      {categories.map((category, idx) => {
        const isOpen = openIndex === idx;

        return (
          <div key={idx} className="relative">
            <button
              type="button"
              onClick={() => handleTitleClick(idx)}
              onMouseEnter={() => handleTitleHover(idx)}
              className={`px-2 py-0.5 outline-none cursor-pointer flex items-center ${
                isOpen
                  ? 'win95-sunken bg-[#C0C0C0] font-semibold'
                  : 'hover:bg-[#000080] hover:text-white'
              }`}
            >
              {/* First letter underlined for vintage ALT-key feel */}
              <span className="underline">{category.title.charAt(0)}</span>
              <span>{category.title.slice(1)}</span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div
                className="absolute top-full left-0 z-50 min-w-[170px] win95-window-frame bg-[#C0C0C0] p-0.5 shadow-md"
                role="menu"
              >
                {category.items.map((item, itemIdx) => {
                  if (item.divider) {
                    return (
                      <div
                        key={itemIdx}
                        className="my-1 border-t border-[#808080] border-b border-white"
                      />
                    );
                  }

                  return (
                    <button
                      key={itemIdx}
                      type="button"
                      disabled={item.disabled}
                      onClick={() => handleItemClick(item)}
                      className={`w-full text-left px-3 py-1 flex items-center justify-between text-[11px] win95-font cursor-pointer outline-none ${
                        item.disabled
                          ? 'text-[#808080] select-none cursor-not-allowed'
                          : 'hover:bg-[#000080] hover:text-white text-black'
                      }`}
                      role="menuitem"
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="ml-4 text-[10px] text-[#404040] hover:text-white win95-mono">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
