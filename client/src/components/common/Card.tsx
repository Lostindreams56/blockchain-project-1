import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'emerald' | 'amber' | 'none';
  header?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  header,
}) => {
  const glowClass =
    glow === 'cyan'
      ? 'cyber-glow-cyan border-cyan-500/30'
      : glow === 'emerald'
      ? 'cyber-glow-emerald border-emerald-500/30'
      : glow === 'amber'
      ? 'cyber-glow-amber border-amber-500/30'
      : 'border-slate-800/80 hover:border-slate-700/80';

  return (
    <div
      className={`bg-slate-900/60 backdrop-blur-md rounded-xl border p-5 transition-all duration-200 ${glowClass} ${className}`}
    >
      {header && <div className="mb-4 pb-3 border-b border-slate-800/70">{header}</div>}
      {children}
    </div>
  );
};
