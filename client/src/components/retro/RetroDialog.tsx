import React, { useEffect } from 'react';
import { RetroButton } from './RetroButton';
import { WarningAlertIcon, InfoBalloonIcon } from './RetroIcons';
import { feedback } from '../../utils/feedback';

export type DialogType = 'info' | 'warning' | 'error' | 'question';

interface RetroDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  detail?: string;
  type?: DialogType;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const RetroDialog: React.FC<RetroDialogProps> = ({
  isOpen,
  title,
  message,
  detail,
  type = 'info',
  onConfirm,
  onCancel,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    if (type === 'error' || type === 'warning') {
      feedback.playError();
    } else {
      feedback.playClick();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onCancel) onCancel();
        else onConfirm();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, type, onConfirm, onCancel]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (type) {
      case 'warning':
      case 'error':
        return <WarningAlertIcon className="w-8 h-8 shrink-0" />;
      case 'info':
      default:
        return <InfoBalloonIcon className="w-8 h-8 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-[0.5px] p-4">
      <div
        className="win95-window-frame max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-100"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Title Bar */}
        <div className="win95-titlebar-active px-2 py-1 flex items-center justify-between select-none">
          <span id="dialog-title" className="win95-font text-[12px] font-bold text-white truncate">
            {title}
          </span>
          <button
            type="button"
            onClick={onCancel || onConfirm}
            className="win95-title-btn"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-4 bg-[#C0C0C0]">
          <div className="flex items-start gap-3">
            {renderIcon()}
            <div className="flex-1">
              <p className="win95-font text-[12px] text-black leading-snug font-medium">
                {message}
              </p>
              {detail && (
                <div className="mt-2 p-2 win95-field-sunken bg-white text-[11px] win95-mono text-[#333333] max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {detail}
                </div>
              )}
            </div>
          </div>

          {/* Buttons Area */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <RetroButton
              variant="primary"
              onClick={onConfirm}
              className="min-w-[75px]"
              autoFocus
            >
              {confirmLabel}
            </RetroButton>
            {onCancel && (
              <RetroButton onClick={onCancel} className="min-w-[75px]">
                {cancelLabel}
              </RetroButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
