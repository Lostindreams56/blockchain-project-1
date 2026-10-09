import React, { useState } from 'react';
import { RetroButton } from '../retro/RetroButton';
import { RetroStatusBar } from '../retro/RetroStatusBar';
import { Win95LogoIcon, ComputerIcon } from '../retro/RetroIcons';
import { feedback } from '../../utils/feedback';

export const AboutWindow: React.FC = () => {
  const [easterEggOpen, setEasterEggOpen] = useState(false);

  return (
    <div className="flex flex-col h-full gap-2 win95-font">
      <div className="flex-1 win95-field-sunken bg-white p-4 overflow-y-auto space-y-4">
        {/* Banner */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#808080]">
          <ComputerIcon className="w-12 h-12 shrink-0" />
          <div>
            <div className="flex items-center gap-1.5">
              <Win95LogoIcon className="w-4 h-4 shrink-0" />
              <h2 className="text-[14px] font-bold text-black">
                Ethereum Fraud Intelligence 95
              </h2>
            </div>
            <div className="text-[11px] text-[#555]">
              Version 1.0.0 (Stage 3 Production ML Pipeline)
            </div>
            <div className="text-[10px] text-[#000080] font-semibold mt-0.5">
              Retro Desktop Workstation Architecture
            </div>
          </div>
        </div>

        {/* Technology Stack Specifications */}
        <div className="text-[11px] space-y-1.5">
          <div className="font-bold text-[#000080]">System Components &amp; Architecture:</div>
          <ul className="list-disc pl-5 space-y-1 text-[#333]">
            <li>
              <strong>Frontend Client:</strong> React 18 + TypeScript + Vite + Tailwind CSS with authentic Windows 95 bevel engine.
            </li>
            <li>
              <strong>API Gateway:</strong> Node.js LTS + Express + TypeScript with Helmet, rate limiters, and structured Pino logging.
            </li>
            <li>
              <strong>Database:</strong> MongoDB Atlas with Mongoose ODM for session and forensic case management.
            </li>
            <li>
              <strong>Machine Learning Service:</strong> Python XGBoost Classifier pipeline serialized with Joblib, calibrated decision threshold (0.62), and TreeSHAP explainability.
            </li>
          </ul>
        </div>

        {/* Forensic & Legal Disclaimer */}
        <div className="win95-sunken p-2.5 bg-[#FFFFAA] text-[11px] text-black">
          <div className="font-bold text-[#804000] mb-1">
            Forensic Scope &amp; Limitations Notice:
          </div>
          <p className="leading-snug">
            This platform uses supervised machine learning to score behavioral anomalies based on
            labeled Ethereum historical data. A valid address checksum establishes syntax format
            only and does not imply security or solvency. Live analysis requires indexed
            historical transactions.
          </p>
        </div>

        {/* Retro Easter Egg Button */}
        <div className="pt-2 flex justify-between items-center">
          <RetroButton
            size="sm"
            onClick={() => {
              feedback.playClick();
              setEasterEggOpen(!easterEggOpen);
            }}
          >
            {easterEggOpen ? 'Hide System Specs' : 'View Hardware Specs (Easter Egg)'}
          </RetroButton>
          <span className="text-[10px] text-[#808080]">Copyright © 2026</span>
        </div>

        {/* Easter Egg Content */}
        {easterEggOpen && (
          <div className="win95-window-frame p-2 bg-[#F0F0F0] text-[10px] win95-mono space-y-0.5 text-black animate-in fade-in">
            <div className="font-bold text-[#000080]">=== HARDWARE CONFIGURATION ===</div>
            <div>CPU: Intel 80486DX2-66 MHz with Math Coprocessor</div>
            <div>RAM: 16,384 KB (640K Conventional Base Memory)</div>
            <div>GRAPHICS: S3 Trio64V+ PCI (1024x768 @ 256 Colors)</div>
            <div>AUDIO: Sound Blaster 16 ASP (Synthesized Web Audio)</div>
            <div>MODEM: USRobotics Sportster 28.8k Data/Fax Modem</div>
            <div>OS BUILD: Microsoft Windows 95 4.00.950 B (OSR2)</div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <RetroStatusBar message="System information verified" className="-mx-2 -mb-2" />
    </div>
  );
};
