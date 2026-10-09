import React, { useState, useRef, useEffect, useCallback } from 'react';
import { feedback } from '../../utils/feedback';

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface RetroWindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized?: boolean;
  isActive: boolean;
  zIndex: number;
  defaultPosition?: WindowPosition;
  defaultSize?: WindowSize;
  minWidth?: number;
  minHeight?: number;
  onFocus: () => void;
  onMinimize: () => void;
  onMaximize?: () => void;
  onClose: () => void;
  children: React.ReactNode;
  menuBar?: React.ReactNode;
  statusBar?: React.ReactNode;
  className?: string;
}

export const RetroWindow: React.FC<RetroWindowProps> = ({
  title,
  icon,
  isOpen,
  isMinimized,
  isMaximized: controlledMaximized,
  isActive,
  zIndex,
  defaultPosition = { x: 50, y: 50 },
  defaultSize = { width: 720, height: 500 },
  minWidth = 320,
  minHeight = 220,
  onFocus,
  onMinimize,
  onMaximize: controlledOnMaximize,
  onClose,
  children,
  menuBar,
  statusBar,
  className = '',
}) => {
  const [internalMaximized, setInternalMaximized] = useState(false);
  const isMaximized = controlledMaximized !== undefined ? controlledMaximized : internalMaximized;

  const [position, setPosition] = useState<WindowPosition>(defaultPosition);
  const [size] = useState<WindowSize>(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  // Track viewport size for mobile adaptation
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Ensure window position is visible inside viewport on initial render or resize
  useEffect(() => {
    if (!isMobile && !isMaximized) {
      const maxX = Math.max(10, window.innerWidth - size.width - 20);
      const maxY = Math.max(10, window.innerHeight - size.height - 60);
      setPosition((prev) => ({
        x: Math.min(Math.max(10, prev.x), maxX),
        y: Math.min(Math.max(10, prev.y), maxY),
      }));
    }
  }, [isMobile, isMaximized, size]);

  const toggleMaximize = useCallback(() => {
    feedback.playClick();
    if (controlledOnMaximize) {
      controlledOnMaximize();
    } else {
      setInternalMaximized((prev) => !prev);
    }
  }, [controlledOnMaximize]);

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag with left mouse button, when not maximized, and not on title buttons
    if (e.button !== 0 || isMaximized || isMobile) return;
    if ((e.target as HTMLElement).closest('.win95-title-btn')) return;

    onFocus();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isMaximized || isMobile) return;
    if ((e.target as HTMLElement).closest('.win95-title-btn')) return;

    onFocus();
    const touch = e.touches[0];
    if (!touch) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      const newX = Math.max(0, Math.min(window.innerWidth - 100, dragStartRef.current.startX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 80, dragStartRef.current.startY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      if (!touch) return;
      const deltaX = touch.clientX - dragStartRef.current.mouseX;
      const deltaY = touch.clientY - dragStartRef.current.mouseY;

      const newX = Math.max(0, Math.min(window.innerWidth - 100, dragStartRef.current.startX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 80, dragStartRef.current.startY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen || isMinimized) return null;

  // Window styling styles
  const windowStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 38, // Above taskbar
        zIndex,
      }
    : isMaximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 38, // Above taskbar
        zIndex,
      }
    : {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        minWidth: `${minWidth}px`,
        minHeight: `${minHeight}px`,
        zIndex,
      };

  return (
    <div
      style={windowStyle}
      onClick={onFocus}
      className={`win95-window-frame flex flex-col shadow-2xl select-text transition-shadow duration-75 ${
        isActive ? 'ring-1 ring-black/40' : 'opacity-95'
      } ${className}`}
      role="region"
      aria-label={title}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={toggleMaximize}
        className={`h-[22px] px-1.5 flex items-center justify-between select-none shrink-0 cursor-default ${
          isActive ? 'win95-titlebar-active' : 'win95-titlebar-inactive'
        }`}
      >
        {/* Title & Icon */}
        <div className="flex items-center gap-1.5 min-w-0">
          {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
          <span className="win95-font text-[12px] font-bold truncate leading-none tracking-tight">
            {title}
          </span>
        </div>

        {/* Title Bar Action Controls */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Minimize button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              feedback.playClick();
              onMinimize();
            }}
            className="win95-title-btn"
            title="Minimize"
            aria-label="Minimize"
          >
            _
          </button>

          {/* Maximize / Restore button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleMaximize();
            }}
            className="win95-title-btn"
            title={isMaximized ? 'Restore' : 'Maximize'}
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? '❐' : '□'}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              feedback.playClick();
              onClose();
            }}
            className="win95-title-btn"
            title="Close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Menu Bar (if present) */}
      {menuBar}

      {/* Window Content Body */}
      <div className="flex-1 overflow-auto bg-[#C0C0C0] p-2 min-h-0 text-black win95-font">
        {children}
      </div>

      {/* Status Bar (if present) */}
      {statusBar}
    </div>
  );
};
