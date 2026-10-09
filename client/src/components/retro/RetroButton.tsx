import React from 'react';
import { feedback } from '../../utils/feedback';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'danger';
  pressed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  children,
  variant = 'default',
  pressed = false,
  size = 'md',
  icon,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    feedback.playClick();
    if (onClick) {
      onClick(e);
    }
  };

  const sizeClasses = {
    sm: 'text-[10px] py-0.5 px-2 min-h-[20px]',
    md: 'text-[11px] py-1 px-3 min-h-[24px]',
    lg: 'text-[12px] py-1.5 px-4 min-h-[28px]',
  }[size];

  const variantBorder = variant === 'primary' 
    ? 'font-bold' 
    : variant === 'danger' 
    ? 'text-[#800000]' 
    : '';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`win95-btn win95-font select-none ${sizeClasses} ${variantBorder} ${
        pressed ? 'pressed' : ''
      } ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
