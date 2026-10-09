import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RetroButton } from '../components/retro/RetroButton';
import { RetroInput } from '../components/retro/RetroInput';
import { KeyLockIcon, Win95LogoIcon, WarningAlertIcon } from '../components/retro/RetroIcons';
import { Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both your analyst email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEmail('');
    setPassword('');
    setErrorMessage(null);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 select-none"
      style={{ backgroundColor: 'var(--win-desktop-teal)' }}
    >
      <div
        className="win95-window-frame w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150 win95-font"
        role="dialog"
        aria-labelledby="login-title"
      >
        {/* Title Bar */}
        <div className="win95-titlebar-active px-2 py-1 flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5 min-w-0">
            <Win95LogoIcon className="w-3.5 h-3.5 shrink-0" />
            <span id="login-title" className="text-[12px] font-bold text-white truncate">
              Log On to Ethereum Fraud Intelligence 95
            </span>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              className="win95-title-btn"
              title="Close"
              aria-label="Close"
              onClick={handleCancel}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Dialog Content */}
        <div className="p-4 bg-[#C0C0C0]">
          {/* Top Instruction Header */}
          <div className="flex items-start gap-3 pb-3 border-b border-[#808080] mb-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <KeyLockIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[11px] text-black font-semibold leading-tight">
                Type an authorized analyst email and password to log on to the FraudOS 95 Risk Intelligence Console.
              </p>
              <p className="text-[10px] text-[#404040] mt-1 font-mono">
                Environment: Ethereum Mainnet Threat Radar
              </p>
            </div>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-3 p-2 win95-sunken bg-[#FFCCCC] border border-[#AA0000] text-[11px] text-[#800000] flex items-start gap-2"
            >
              <WarningAlertIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="login-email"
                className="block text-[11px] font-bold text-black mb-1"
              >
                Analyst User Name / Email:
              </label>
              <RetroInput
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@risk-intelligence.io"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-[11px] font-bold text-black mb-1"
              >
                Password:
              </label>
              <RetroInput
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                suffixElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-[#606060] hover:text-black p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                }
              />
            </div>

            {/* Actions Bar */}
            <div className="mt-4 pt-3 border-t border-[#808080] flex flex-wrap items-center justify-between gap-2">
              <Link
                to="/register"
                className="text-[11px] text-[#000080] hover:underline font-semibold"
              >
                Register New Analyst...
              </Link>

              <div className="flex items-center gap-2">
                <RetroButton
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="min-w-[70px]"
                >
                  {isSubmitting ? 'Verifying...' : 'OK'}
                </RetroButton>
                <RetroButton
                  type="button"
                  onClick={handleCancel}
                  className="min-w-[70px]"
                >
                  Cancel
                </RetroButton>
              </div>
            </div>
          </form>
        </div>

        {/* Status Strip */}
        <div className="h-5 bg-[#C0C0C0] border-t border-[#808080] px-2 flex items-center justify-between text-[10px] text-[#555]">
          <span>Security Protocol: JWT + HttpOnly Cookies</span>
          <span>Build: 1.0.0 (Stage 3)</span>
        </div>
      </div>
    </div>
  );
};
