import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ExternalLink, Terminal, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3">
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
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              to="/dashboard"
              className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
            >
              Console
            </Link>
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

          {/* Right Status Badges & Auth Controls */}
          <div className="flex items-center gap-3">
            <Badge variant="cyan" dot className="hidden sm:inline-flex">
              STAGE 2: AUTH SECURED
            </Badge>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
                  <div className="w-5 h-5 rounded bg-cyan-950 border border-cyan-800/80 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-slate-200 max-w-[120px] truncate hidden md:inline">
                    {user.name}
                  </span>
                  <Badge variant="slate" className="text-[10px] px-1.5 py-0 uppercase">
                    {user.role}
                  </Badge>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  title="Sign Out of Session"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/60 rounded-lg text-xs font-mono transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs font-mono transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 bg-cyan-600/90 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            <a
              href="https://ethereum.org"
              target="_blank"
              rel="noreferrer"
              className="hidden xl:flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mainnet</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
