import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RetroButton } from '../components/retro/RetroButton';
import { RetroInput } from '../components/retro/RetroInput';
import { Win95LogoIcon, WarningAlertIcon, KeyLockIcon } from '../components/retro/RetroIcons';
import { Eye, EyeOff, Check } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password complexity checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === passwordConfirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your analyst full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setErrorMessage('Password does not fulfill the required complexity rules.');
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage('Password and confirmation do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        passwordConfirmation,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please check inputs.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/login');
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto select-none"
      style={{ backgroundColor: 'var(--win-desktop-teal)' }}
    >
      <div
        className="win95-window-frame w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-150 win95-font my-auto"
        role="dialog"
        aria-labelledby="reg-title"
      >
        {/* Title Bar */}
        <div className="win95-titlebar-active px-2 py-1 flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5 min-w-0">
            <Win95LogoIcon className="w-3.5 h-3.5 shrink-0" />
            <span id="reg-title" className="text-[12px] font-bold text-white truncate">
              New Analyst Registration — FraudOS 95
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
          {/* Header */}
          <div className="flex items-start gap-3 pb-3 border-b border-[#808080] mb-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <KeyLockIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[11px] text-black font-semibold leading-tight">
                Provision new investigator credentials for the Ethereum Fraud Detection &amp; Risk Intelligence Platform.
              </p>
              <p className="text-[10px] text-[#404040] mt-1 font-mono">
                Clearance: Analyst • Storage: MongoDB Atlas
              </p>
            </div>
          </div>

          {/* Error Alert Box */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-name" className="block text-[11px] font-bold text-black mb-1">
                  Analyst Full Name:
                </label>
                <RetroInput
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Vance"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-[11px] font-bold text-black mb-1">
                  Analyst Work Email:
                </label>
                <RetroInput
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.vance@security.org"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-password" className="block text-[11px] font-bold text-black mb-1">
                  Password:
                </label>
                <RetroInput
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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

              <div>
                <label htmlFor="reg-confirm" className="block text-[11px] font-bold text-black mb-1">
                  Confirm Password:
                </label>
                <RetroInput
                  id="reg-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••••••"
                  suffixElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="text-[#606060] hover:text-black p-0.5 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  }
                />
              </div>
            </div>

            {/* Password Policy Telemetry */}
            <div className="win95-sunken p-2 bg-[#F5F5F5] text-[10px]">
              <span className="font-bold text-[#000080] block mb-1">
                Password Security Verification:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                <span className={`flex items-center gap-1 ${hasMinLength ? 'text-[#008000] font-bold' : 'text-[#808080]'}`}>
                  <Check className="w-3 h-3" /> 8+ Characters
                </span>
                <span className={`flex items-center gap-1 ${hasUppercase ? 'text-[#008000] font-bold' : 'text-[#808080]'}`}>
                  <Check className="w-3 h-3" /> 1+ Uppercase
                </span>
                <span className={`flex items-center gap-1 ${hasLowercase ? 'text-[#008000] font-bold' : 'text-[#808080]'}`}>
                  <Check className="w-3 h-3" /> 1+ Lowercase
                </span>
                <span className={`flex items-center gap-1 ${hasNumber ? 'text-[#008000] font-bold' : 'text-[#808080]'}`}>
                  <Check className="w-3 h-3" /> 1+ Number
                </span>
                <span className={`flex items-center gap-1 ${hasSpecial ? 'text-[#008000] font-bold' : 'text-[#808080]'}`}>
                  <Check className="w-3 h-3" /> 1+ Special Symbol
                </span>
                <span className={`flex items-center gap-1 ${passwordsMatch ? 'text-[#008000] font-bold' : 'text-[#808080]'}`}>
                  <Check className="w-3 h-3" /> Passwords Match
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-4 pt-3 border-t border-[#808080] flex flex-wrap items-center justify-between gap-2">
              <Link
                to="/login"
                className="text-[11px] text-[#000080] hover:underline font-semibold"
              >
                Log On with Existing Account...
              </Link>

              <div className="flex items-center gap-2">
                <RetroButton
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="min-w-[80px]"
                >
                  {isSubmitting ? 'Registering...' : 'Create Account'}
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
          <span>Password Encryption: bcrypt (Salt Rounds: 10)</span>
          <span>Role: Analyst</span>
        </div>
      </div>
    </div>
  );
};
