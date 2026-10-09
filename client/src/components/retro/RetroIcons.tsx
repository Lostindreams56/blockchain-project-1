import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Authentic 16x16 / 32x32 pixel-style SVG icons for Windows 95 aesthetics
 */

export const Win95LogoIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 16 16" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Red pane */}
    <rect x="2" y="2" width="5" height="5" fill="#FF0000" />
    <rect x="2" y="2" width="5" height="1" fill="#FFAAAA" />
    {/* Green pane */}
    <rect x="9" y="2" width="5" height="5" fill="#00AA00" />
    <rect x="9" y="2" width="5" height="1" fill="#AAFFAA" />
    {/* Blue pane */}
    <rect x="2" y="9" width="5" height="5" fill="#0000AA" />
    <rect x="2" y="9" width="5" height="1" fill="#5555FF" />
    {/* Yellow pane */}
    <rect x="9" y="9" width="5" height="5" fill="#FFAA00" />
    <rect x="9" y="9" width="5" height="1" fill="#FFFF55" />
  </svg>
);

export const ComputerIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* CRT Monitor */}
    <rect x="3" y="3" width="26" height="20" fill="#C0C0C0" stroke="#000000" strokeWidth="1" />
    <rect x="4" y="4" width="24" height="1" fill="#FFFFFF" />
    <rect x="4" y="4" width="1" height="18" fill="#FFFFFF" />
    {/* CRT Screen */}
    <rect x="6" y="6" width="20" height="14" fill="#008080" stroke="#000000" strokeWidth="1" />
    <rect x="8" y="8" width="16" height="10" fill="#000080" />
    <rect x="10" y="10" width="10" height="2" fill="#FFFFFF" opacity="0.6" />
    {/* Monitor Stand */}
    <rect x="12" y="23" width="8" height="3" fill="#808080" />
    <rect x="8" y="26" width="16" height="3" fill="#C0C0C0" stroke="#000000" strokeWidth="1" />
  </svg>
);

export const ShieldScannerIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shield Base */}
    <path
      d="M16 2 L28 6 V16 C28 23 21 28 16 30 C11 28 4 23 4 16 V6 L16 2 Z"
      fill="#C0C0C0"
      stroke="#000000"
      strokeWidth="1"
    />
    {/* Shield Inner Inset */}
    <path
      d="M16 5 L25 8 V16 C25 21 19 25 16 27 C13 25 7 21 7 16 V8 L16 5 Z"
      fill="#000080"
    />
    {/* Magnifying Glass Overlaid */}
    <circle cx="15" cy="14" r="6" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
    <circle cx="15" cy="14" r="4" fill="#1084D0" />
    <line x1="19" y1="18" x2="25" y2="24" stroke="#FFAA00" strokeWidth="3" strokeLinecap="square" />
    <line x1="19" y1="18" x2="25" y2="24" stroke="#000000" strokeWidth="1" strokeLinecap="square" />
  </svg>
);

export const WalletExplorerIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wallet Body */}
    <rect x="3" y="8" width="26" height="18" fill="#8B4513" stroke="#000000" strokeWidth="1" />
    <rect x="4" y="9" width="24" height="2" fill="#D2B48C" />
    {/* Ethereum Diamond Logo */}
    <path d="M14 11 L19 19 L14 22 L9 19 Z" fill="#627EEA" stroke="#FFFFFF" strokeWidth="0.8" />
    <path d="M14 11 L14 22 L19 19 Z" fill="#4B63B6" />
    {/* Wallet Flap */}
    <rect x="20" y="14" width="9" height="7" fill="#5C2E0B" stroke="#000000" strokeWidth="1" />
    <circle cx="23" cy="17.5" r="1.5" fill="#FFD700" stroke="#000000" strokeWidth="0.5" />
  </svg>
);

export const ModelCpuIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Chip Base */}
    <rect x="6" y="6" width="20" height="20" fill="#2E8B57" stroke="#000000" strokeWidth="1" />
    <rect x="10" y="10" width="12" height="12" fill="#1E293B" stroke="#FFD700" strokeWidth="1" />
    {/* Pins */}
    {[8, 12, 16, 20].map((pos) => (
      <React.Fragment key={pos}>
        <rect x={pos} y="2" width="2" height="4" fill="#C0C0C0" stroke="#000000" strokeWidth="0.5" />
        <rect x={pos} y="26" width="2" height="4" fill="#C0C0C0" stroke="#000000" strokeWidth="0.5" />
        <rect x="2" y={pos} width="4" height="2" fill="#C0C0C0" stroke="#000000" strokeWidth="0.5" />
        <rect x="26" y={pos} width="4" height="2" fill="#C0C0C0" stroke="#000000" strokeWidth="0.5" />
      </React.Fragment>
    ))}
    {/* XGBoost text mark */}
    <text x="16" y="18" fill="#FFFFFF" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
      XGB
    </text>
  </svg>
);

export const FolderReportsIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Folder Back Tab */}
    <path d="M4 6 L12 6 L15 9 L28 9 L28 26 L4 26 Z" fill="#DAA520" stroke="#000000" strokeWidth="1" />
    {/* Folder Sheet / Document inside */}
    <rect x="7" y="10" width="18" height="13" fill="#FFFFFF" stroke="#000000" strokeWidth="0.5" />
    <line x1="9" y1="13" x2="21" y2="13" stroke="#000080" strokeWidth="1" />
    <line x1="9" y1="16" x2="19" y2="16" stroke="#000080" strokeWidth="1" />
    {/* Folder Front */}
    <path d="M3 13 L29 13 L27 27 L5 27 Z" fill="#FFD700" stroke="#000000" strokeWidth="1" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Sliders / Control Panel Box */}
    <rect x="4" y="5" width="24" height="22" fill="#C0C0C0" stroke="#000000" strokeWidth="1" />
    <rect x="5" y="6" width="22" height="1" fill="#FFFFFF" />
    {/* Sliders */}
    <line x1="9" y1="9" x2="9" y2="23" stroke="#404040" strokeWidth="1.5" />
    <rect x="7" y="14" width="5" height="3" fill="#000080" stroke="#000000" strokeWidth="0.5" />

    <line x1="16" y1="9" x2="16" y2="23" stroke="#404040" strokeWidth="1.5" />
    <rect x="14" y="11" width="5" height="3" fill="#000080" stroke="#000000" strokeWidth="0.5" />

    <line x1="23" y1="9" x2="23" y2="23" stroke="#404040" strokeWidth="1.5" />
    <rect x="21" y="18" width="5" height="3" fill="#000080" stroke="#000000" strokeWidth="0.5" />
  </svg>
);

export const HelpBookIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Book Base */}
    <rect x="6" y="5" width="20" height="23" fill="#008080" stroke="#000000" strokeWidth="1" />
    <rect x="8" y="7" width="16" height="19" fill="#FFFFFF" />
    <circle cx="16" cy="15" r="5" fill="#000080" />
    <text x="16" y="19" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
      ?
    </text>
  </svg>
);

export const RecycleBinIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Bin Body */}
    <path d="M7 10 L10 27 L22 27 L25 10 Z" fill="#C0C0C0" stroke="#000000" strokeWidth="1" />
    <rect x="5" y="7" width="22" height="3" fill="#808080" stroke="#000000" strokeWidth="1" />
    {/* Recurse arrows */}
    <circle cx="16" cy="18" r="4" fill="none" stroke="#008000" strokeWidth="1.5" strokeDasharray="5 2" />
  </svg>
);

export const KeyLockIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Padlock Body */}
    <rect x="8" y="13" width="16" height="15" fill="#DAA520" stroke="#000000" strokeWidth="1" />
    <rect x="9" y="14" width="14" height="1" fill="#FFFFAA" />
    {/* Shackle */}
    <path d="M11 13 V8 C11 5.5 13 4 16 4 C19 4 21 5.5 21 8 V13" fill="none" stroke="#808080" strokeWidth="2.5" />
    {/* Keyhole */}
    <circle cx="16" cy="19" r="2" fill="#000000" />
    <polygon points="15,20 17,20 16.5,24 15.5,24" fill="#000000" />
  </svg>
);

export const WarningAlertIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="16,3 29,28 3,28" fill="#FFFF00" stroke="#000000" strokeWidth="1.5" />
    <line x1="16" y1="12" x2="16" y2="20" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="16" cy="24" r="1.5" fill="#000000" />
  </svg>
);

export const InfoBalloonIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="13" fill="#FFFFFF" stroke="#000080" strokeWidth="2" />
    <circle cx="16" cy="16" r="11" fill="#1084D0" />
    <circle cx="16" cy="10" r="1.5" fill="#FFFFFF" />
    <rect x="15" y="13" width="2.5" height="9" fill="#FFFFFF" />
  </svg>
);
