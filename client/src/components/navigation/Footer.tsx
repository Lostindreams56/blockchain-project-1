import React from 'react';
import { Shield, GitBranch, Cpu, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/90 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-4 h-4 text-cyan-500" />
            <span className="font-semibold text-slate-300">
              Ethereum Fraud Detection & Risk Intelligence Platform
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Express + Vite + TS
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-amber-400" /> MongoDB Atlas
            </span>
            <span className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" /> FastAPI + XGBoost Ready
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-600">
          <p>Production-ready portfolio engineering architecture • Intermediate Placement Edition</p>
          <p>Stage 1: System Baseline & Multi-tier Monorepo Scaffold</p>
        </div>
      </div>
    </footer>
  );
};
