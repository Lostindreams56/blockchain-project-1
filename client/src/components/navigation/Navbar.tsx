import React from 'react';
import { Shield, ExternalLink, Terminal } from 'lucide-react';
import { Badge } from '../common/Badge';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 rounded-lg text-cyan-400 cyber-glow-cyan">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  ETH<span className="text-cyan-400">GUARD</span>
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">|</span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  Risk Intelligence Platform
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Links (Stage 1 placeholders) */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a
              href="#overview"
              className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
            >
              Overview
            </a>
            <a
              href="#wallet-analysis"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Wallet Analysis
            </a>
            <a
              href="#investigations"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Investigations
            </a>
            <a
              href="#model-performance"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              ML Models
            </a>
          </nav>

          {/* Right Status Badges */}
          <div className="flex items-center gap-3">
            <Badge variant="cyan" dot>
              STAGE 1: FOUNDATION
            </Badge>

            <a
              href="https://ethereum.org"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mainnet Data</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
