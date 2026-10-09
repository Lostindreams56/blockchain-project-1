import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badgeText?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  badgeText,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/40 ${className}`}
    >
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-full mb-3 text-cyan-400">
        <Icon className="w-6 h-6" />
      </div>
      {badgeText && (
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
          {badgeText}
        </span>
      )}
      <h4 className="text-base font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
