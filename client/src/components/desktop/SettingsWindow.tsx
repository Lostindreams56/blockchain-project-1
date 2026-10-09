import React, { useState } from 'react';
import { RetroButton } from '../retro/RetroButton';
import { RetroStatusBar } from '../retro/RetroStatusBar';
import { feedback } from '../../utils/feedback';
import { useAuth } from '../../context/AuthContext';
import { Volume2, Smartphone, LogOut } from 'lucide-react';

interface SettingsWindowProps {
  onLogout: () => void;
}

export const SettingsWindow: React.FC<SettingsWindowProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<string>(feedback.getTheme());
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(feedback.isSoundEnabled());
  const [hapticsEnabled, setHapticsEnabledState] = useState<boolean>(feedback.isHapticsEnabled());
  const [testSuccess, setTestSuccess] = useState<boolean>(false);

  const handleThemeChange = (newTheme: string) => {
    feedback.setTheme(newTheme);
    setThemeState(newTheme);
    feedback.playClick();
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    feedback.setSoundEnabled(next);
    setSoundEnabledState(next);
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    feedback.setHapticsEnabled(next);
    setHapticsEnabledState(next);
  };

  const handleTestSound = () => {
    feedback.playSuccess();
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 1500);
  };

  return (
    <div className="flex flex-col h-full gap-2 win95-font">
      <div className="flex-1 win95-field-sunken bg-white p-3 overflow-y-auto space-y-4">
        {/* Theme Settings Group */}
        <fieldset className="win95-window-frame p-2.5 bg-[#F5F5F5]">
          <legend className="px-1 text-[11px] font-bold text-[#000080]">
            Desktop Color Scheme &amp; Theme
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
            {[
              { id: 'classic', label: 'Classic 95 Teal', color: '#008080' },
              { id: 'navy', label: '98 Cobalt Navy', color: '#003366' },
              { id: 'matrix', label: 'Terminal Matrix', color: '#0A1C0A' },
              { id: 'charcoal', label: 'Dark Charcoal', color: '#2D3748' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleThemeChange(t.id)}
                className={`win95-btn p-2 flex flex-col items-center gap-1.5 text-center ${
                  theme === t.id ? 'pressed font-bold' : ''
                }`}
              >
                <div
                  className="w-full h-5 border border-black"
                  style={{ backgroundColor: t.color }}
                />
                <span className="text-[11px]">{t.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Sensory Feedback Preferences */}
        <fieldset className="win95-window-frame p-2.5 bg-[#F5F5F5] space-y-3">
          <legend className="px-1 text-[11px] font-bold text-[#000080]">
            Audio &amp; Tactile Feedback Controls
          </legend>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#000080]" />
              <div>
                <label htmlFor="sound-toggle" className="text-[11px] font-bold text-black cursor-pointer">
                  Synthesized Retro Sound Effects
                </label>
                <p className="text-[10px] text-[#555]">
                  Uses Web Audio API in-memory oscillator (clicks, chimes, alerts). Defaults to OFF.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="sound-toggle"
                type="checkbox"
                checked={soundEnabled}
                onChange={handleToggleSound}
                className="win95-checkbox"
              />
              <RetroButton size="sm" onClick={handleTestSound} disabled={!soundEnabled}>
                {testSuccess ? 'Playing...' : 'Test Sound'}
              </RetroButton>
            </div>
          </div>

          {/* Haptic Toggle */}
          <div className="flex items-center justify-between border-t border-[#DFDFDF] pt-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#000080]" />
              <div>
                <label htmlFor="haptics-toggle" className="text-[11px] font-bold text-black cursor-pointer">
                  Mobile Tactile Haptics (navigator.vibrate)
                </label>
                <p className="text-[10px] text-[#555]">
                  Short vibration feedback for scan results on supported mobile devices.
                </p>
              </div>
            </div>
            <input
              id="haptics-toggle"
              type="checkbox"
              checked={hapticsEnabled}
              onChange={handleToggleHaptics}
              className="win95-checkbox"
            />
          </div>
        </fieldset>

        {/* Active Analyst Session Info */}
        {user && (
          <fieldset className="win95-window-frame p-2.5 bg-[#F5F5F5]">
            <legend className="px-1 text-[11px] font-bold text-[#000080]">
              Active Analyst Credentials
            </legend>
            <div className="text-[11px] space-y-1">
              <div>
                <span className="font-bold text-black">Analyst Name:</span> {user.name}
              </div>
              <div>
                <span className="font-bold text-black">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-bold text-black">Role / Security Clearance:</span>{' '}
                <span className="uppercase font-bold text-[#000080]">{user.role}</span>
              </div>
              <div className="pt-2">
                <RetroButton
                  variant="danger"
                  onClick={onLogout}
                  icon={<LogOut className="w-3.5 h-3.5" />}
                >
                  Terminate Analyst Session
                </RetroButton>
              </div>
            </div>
          </fieldset>
        )}
      </div>

      {/* Status Bar */}
      <RetroStatusBar message="Preferences synchronized with local storage" className="-mx-2 -mb-2" />
    </div>
  );
};
