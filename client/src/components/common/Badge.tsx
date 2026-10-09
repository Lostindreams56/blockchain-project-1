import React from 'react';

export type BadgeVariant = 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  cyan: {
    container: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/60',
    dot: 'bg-cyan-400',
  },
  emerald: {
    container: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
    dot: 'bg-emerald-400',
  },
  amber: {
    container: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
    dot: 'bg-amber-400',
  },
  rose: {
    container: 'bg-rose-950/60 text-rose-400 border-rose-800/60',
    dot: 'bg-rose-400',
  },
  slate: {
    container: 'bg-slate-900/80 text-slate-400 border-slate-800',
    dot: 'bg-slate-400',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  className = '',
  dot = false,
}) => {
  const styles = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${styles.container} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${styles.dot}`} />}
      {children}
    </span>
  );
};
