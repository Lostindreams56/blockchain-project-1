import React, { useState, useEffect } from 'react';
import { DesktopIcon } from './DesktopIcon';
import { Taskbar, TaskbarWindowItem } from './Taskbar';
import { StartMenu } from './StartMenu';
import { RetroWindow, WindowPosition, WindowSize } from '../retro/RetroWindow';
import { RetroDialog } from '../retro/RetroDialog';
import {
  ShieldScannerIcon,
  WalletExplorerIcon,
  ModelCpuIcon,
  FolderReportsIcon,
  SettingsIcon,
  HelpBookIcon,
  RecycleBinIcon,
} from '../retro/RetroIcons';
import { FraudScannerWindow } from './FraudScannerWindow';
import { WalletExplorerWindow } from './WalletExplorerWindow';
import { ModelStatusWindow } from './ModelStatusWindow';
import { InvestigationHistoryWindow } from './InvestigationHistoryWindow';
import { SettingsWindow } from './SettingsWindow';
import { AboutWindow } from './AboutWindow';
import { useAuth } from '../../context/AuthContext';
import { useApiHealth } from '../../hooks/useApiHealth';
import { useReadiness } from '../../hooks/useReadiness';
import { feedback } from '../../utils/feedback';

export type WindowId = 'scanner' | 'explorer' | 'model' | 'history' | 'settings' | 'about';

interface ManagedWindow {
  id: WindowId;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  defaultPosition: WindowPosition;
  defaultSize: WindowSize;
}

export const DesktopShell: React.FC = () => {
  const { user, logout } = useAuth();
  const { isSuccess: isApiHealthy } = useApiHealth();
  const { data: readiness } = useReadiness();
  const isDbReady = readiness?.database?.status === 'connected';

  // Windows configuration state
  const [windows, setWindows] = useState<Record<WindowId, ManagedWindow>>({
    scanner: {
      id: 'scanner',
      title: 'Ethereum Fraud Scanner',
      icon: <ShieldScannerIcon className="w-4 h-4" />,
      isOpen: true, // Main application opens by default
      isMinimized: false,
      isMaximized: false,
      zIndex: 100,
      defaultPosition: { x: 40, y: 30 },
      defaultSize: { width: 700, height: 530 },
    },
    explorer: {
      id: 'explorer',
      title: 'Wallet Explorer & Feature Signals',
      icon: <WalletExplorerIcon className="w-4 h-4" />,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 90,
      defaultPosition: { x: 90, y: 60 },
      defaultSize: { width: 680, height: 490 },
    },
    model: {
      id: 'model',
      title: 'Model Performance & Benchmark Telemetry',
      icon: <ModelCpuIcon className="w-4 h-4" />,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 90,
      defaultPosition: { x: 130, y: 80 },
      defaultSize: { width: 650, height: 510 },
    },
    history: {
      id: 'history',
      title: 'Investigation Reports & Forensic Dossiers',
      icon: <FolderReportsIcon className="w-4 h-4" />,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 90,
      defaultPosition: { x: 160, y: 100 },
      defaultSize: { width: 640, height: 450 },
    },
    settings: {
      id: 'settings',
      title: 'Control Panel & System Preferences',
      icon: <SettingsIcon className="w-4 h-4" />,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 90,
      defaultPosition: { x: 180, y: 120 },
      defaultSize: { width: 540, height: 420 },
    },
    about: {
      id: 'about',
      title: 'About Ethereum Fraud Intelligence 95',
      icon: <HelpBookIcon className="w-4 h-4" />,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 90,
      defaultPosition: { x: 220, y: 130 },
      defaultSize: { width: 500, height: 400 },
    },
  });

  const [activeWindowId, setActiveWindowId] = useState<string>('scanner');
  const [topZIndex, setTopZIndex] = useState<number>(101);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState<boolean>(false);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState<boolean>(false);
  const [recycleBinDialogOpen, setRecycleBinDialogOpen] = useState<boolean>(false);

  // Initialize theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', feedback.getTheme());
  }, []);

  const bringToFront = (id: WindowId) => {
    setWindows((prev) => {
      const target = prev[id];
      if (!target) return prev;
      const nextZ = topZIndex + 1;
      setTopZIndex(nextZ);
      setActiveWindowId(id);
      return {
        ...prev,
        [id]: {
          ...target,
          isOpen: true,
          isMinimized: false,
          zIndex: nextZ,
        },
      };
    });
  };

  const handleOpenWindow = (id: WindowId) => {
    feedback.playWindowOpen();
    bringToFront(id);
  };

  const handleMinimizeWindow = (id: WindowId) => {
    setWindows((prev) => {
      const target = prev[id];
      if (!target) return prev;
      return {
        ...prev,
        [id]: { ...target, isMinimized: true },
      };
    });
    // Set active window to the next visible top window
    const remainingOpen = (Object.values(windows) as ManagedWindow[]).filter(
      (w) => w.id !== id && w.isOpen && !w.isMinimized
    );
    if (remainingOpen.length > 0) {
      const nextTop = remainingOpen.reduce((max, w) => (w.zIndex > max.zIndex ? w : max));
      setActiveWindowId(nextTop.id);
    } else {
      setActiveWindowId('');
    }
  };

  const handleMaximizeWindow = (id: WindowId) => {
    setWindows((prev) => {
      const target = prev[id];
      if (!target) return prev;
      return {
        ...prev,
        [id]: { ...target, isMaximized: !target.isMaximized },
      };
    });
  };

  const handleCloseWindow = (id: WindowId) => {
    setWindows((prev) => {
      const target = prev[id];
      if (!target) return prev;
      return {
        ...prev,
        [id]: { ...target, isOpen: false, isMinimized: false },
      };
    });
  };

  const handleTaskbarWindowClick = (id: string) => {
    const target = windows[id as WindowId];
    if (!target) return;

    if (target.isMinimized) {
      bringToFront(id as WindowId);
    } else if (activeWindowId === id) {
      handleMinimizeWindow(id as WindowId);
    } else {
      bringToFront(id as WindowId);
    }
  };

  const handleDesktopClick = (e: React.MouseEvent) => {
    // Deselect desktop icon if clicked on empty desktop
    if ((e.target as HTMLElement).id === 'desktop-surface') {
      setSelectedIconId(null);
      setIsStartMenuOpen(false);
    }
  };

  const taskbarWindows: TaskbarWindowItem[] = Object.values(windows).map((w) => ({
    id: w.id,
    title: w.title,
    icon: w.icon,
    isOpen: w.isOpen,
    isMinimized: w.isMinimized,
    isActive: activeWindowId === w.id,
  }));

  return (
    <div
      id="desktop-surface"
      onClick={handleDesktopClick}
      className="fixed inset-0 overflow-hidden select-none"
      style={{ backgroundColor: 'var(--win-desktop-teal)' }}
    >
      {/* Desktop Shortcuts Column (Left Side) */}
      <div className="absolute top-3 left-3 flex flex-col gap-3 z-10">
        <DesktopIcon
          id="icon-scanner"
          label="Fraud Scanner"
          icon={<ShieldScannerIcon className="w-8 h-8" />}
          isSelected={selectedIconId === 'icon-scanner'}
          onSelect={() => setSelectedIconId('icon-scanner')}
          onOpen={() => handleOpenWindow('scanner')}
        />

        <DesktopIcon
          id="icon-explorer"
          label="Wallet Explorer"
          icon={<WalletExplorerIcon className="w-8 h-8" />}
          isSelected={selectedIconId === 'icon-explorer'}
          onSelect={() => setSelectedIconId('icon-explorer')}
          onOpen={() => handleOpenWindow('explorer')}
        />

        <DesktopIcon
          id="icon-model"
          label="Model Status"
          icon={<ModelCpuIcon className="w-8 h-8" />}
          isSelected={selectedIconId === 'icon-model'}
          onSelect={() => setSelectedIconId('icon-model')}
          onOpen={() => handleOpenWindow('model')}
        />

        <DesktopIcon
          id="icon-history"
          label="Investigation Reports"
          icon={<FolderReportsIcon className="w-8 h-8" />}
          isSelected={selectedIconId === 'icon-history'}
          onSelect={() => setSelectedIconId('icon-history')}
          onOpen={() => handleOpenWindow('history')}
        />

        <DesktopIcon
          id="icon-settings"
          label="Settings"
          icon={<SettingsIcon className="w-8 h-8" />}
          isSelected={selectedIconId === 'icon-settings'}
          onSelect={() => setSelectedIconId('icon-settings')}
          onOpen={() => handleOpenWindow('settings')}
        />

        <DesktopIcon
          id="icon-about"
          label="About System"
          icon={<HelpBookIcon className="w-8 h-8" />}
          isSelected={selectedIconId === 'icon-about'}
          onSelect={() => setSelectedIconId('icon-about')}
          onOpen={() => handleOpenWindow('about')}
        />

        <DesktopIcon
          id="icon-recycle"
          label="Recycle Bin"
          icon={<RecycleBinIcon className="w-8 h-8" />}
          isSelected={selectedIconId === 'icon-recycle'}
          onSelect={() => setSelectedIconId('icon-recycle')}
          onOpen={() => setRecycleBinDialogOpen(true)}
        />
      </div>

      {/* Application Windows */}
      {/* 1. Fraud Scanner Window */}
      <RetroWindow
        id="scanner"
        title={windows.scanner.title}
        icon={windows.scanner.icon}
        isOpen={windows.scanner.isOpen}
        isMinimized={windows.scanner.isMinimized}
        isMaximized={windows.scanner.isMaximized}
        isActive={activeWindowId === 'scanner'}
        zIndex={windows.scanner.zIndex}
        defaultPosition={windows.scanner.defaultPosition}
        defaultSize={windows.scanner.defaultSize}
        onFocus={() => bringToFront('scanner')}
        onMinimize={() => handleMinimizeWindow('scanner')}
        onMaximize={() => handleMaximizeWindow('scanner')}
        onClose={() => handleCloseWindow('scanner')}
      >
        <FraudScannerWindow
          onOpenModelStatus={() => handleOpenWindow('model')}
          isApiHealthy={isApiHealthy}
        />
      </RetroWindow>

      {/* 2. Wallet Explorer Window */}
      <RetroWindow
        id="explorer"
        title={windows.explorer.title}
        icon={windows.explorer.icon}
        isOpen={windows.explorer.isOpen}
        isMinimized={windows.explorer.isMinimized}
        isMaximized={windows.explorer.isMaximized}
        isActive={activeWindowId === 'explorer'}
        zIndex={windows.explorer.zIndex}
        defaultPosition={windows.explorer.defaultPosition}
        defaultSize={windows.explorer.defaultSize}
        onFocus={() => bringToFront('explorer')}
        onMinimize={() => handleMinimizeWindow('explorer')}
        onMaximize={() => handleMaximizeWindow('explorer')}
        onClose={() => handleCloseWindow('explorer')}
      >
        <WalletExplorerWindow />
      </RetroWindow>

      {/* 3. Model Status Window */}
      <RetroWindow
        id="model"
        title={windows.model.title}
        icon={windows.model.icon}
        isOpen={windows.model.isOpen}
        isMinimized={windows.model.isMinimized}
        isMaximized={windows.model.isMaximized}
        isActive={activeWindowId === 'model'}
        zIndex={windows.model.zIndex}
        defaultPosition={windows.model.defaultPosition}
        defaultSize={windows.model.defaultSize}
        onFocus={() => bringToFront('model')}
        onMinimize={() => handleMinimizeWindow('model')}
        onMaximize={() => handleMaximizeWindow('model')}
        onClose={() => handleCloseWindow('model')}
      >
        <ModelStatusWindow />
      </RetroWindow>

      {/* 4. Investigation Reports Window */}
      <RetroWindow
        id="history"
        title={windows.history.title}
        icon={windows.history.icon}
        isOpen={windows.history.isOpen}
        isMinimized={windows.history.isMinimized}
        isMaximized={windows.history.isMaximized}
        isActive={activeWindowId === 'history'}
        zIndex={windows.history.zIndex}
        defaultPosition={windows.history.defaultPosition}
        defaultSize={windows.history.defaultSize}
        onFocus={() => bringToFront('history')}
        onMinimize={() => handleMinimizeWindow('history')}
        onMaximize={() => handleMaximizeWindow('history')}
        onClose={() => handleCloseWindow('history')}
      >
        <InvestigationHistoryWindow />
      </RetroWindow>

      {/* 5. Settings Window */}
      <RetroWindow
        id="settings"
        title={windows.settings.title}
        icon={windows.settings.icon}
        isOpen={windows.settings.isOpen}
        isMinimized={windows.settings.isMinimized}
        isMaximized={windows.settings.isMaximized}
        isActive={activeWindowId === 'settings'}
        zIndex={windows.settings.zIndex}
        defaultPosition={windows.settings.defaultPosition}
        defaultSize={windows.settings.defaultSize}
        onFocus={() => bringToFront('settings')}
        onMinimize={() => handleMinimizeWindow('settings')}
        onMaximize={() => handleMaximizeWindow('settings')}
        onClose={() => handleCloseWindow('settings')}
      >
        <SettingsWindow onLogout={() => setLogoutDialogOpen(true)} />
      </RetroWindow>

      {/* 6. About Window */}
      <RetroWindow
        id="about"
        title={windows.about.title}
        icon={windows.about.icon}
        isOpen={windows.about.isOpen}
        isMinimized={windows.about.isMinimized}
        isMaximized={windows.about.isMaximized}
        isActive={activeWindowId === 'about'}
        zIndex={windows.about.zIndex}
        defaultPosition={windows.about.defaultPosition}
        defaultSize={windows.about.defaultSize}
        onFocus={() => bringToFront('about')}
        onMinimize={() => handleMinimizeWindow('about')}
        onMaximize={() => handleMaximizeWindow('about')}
        onClose={() => handleCloseWindow('about')}
      >
        <AboutWindow />
      </RetroWindow>

      {/* Start Menu Overlay */}
      <StartMenu
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
        onOpenWindow={(id) => handleOpenWindow(id as WindowId)}
        onLogout={() => setLogoutDialogOpen(true)}
        userName={user?.name || 'Analyst'}
      />

      {/* Taskbar Pinned at Bottom */}
      <Taskbar
        windows={taskbarWindows}
        isStartMenuOpen={isStartMenuOpen}
        onToggleStartMenu={() => setIsStartMenuOpen(!isStartMenuOpen)}
        onWindowClick={handleTaskbarWindowClick}
        isApiHealthy={isApiHealthy}
        isDbReady={isDbReady}
      />

      {/* Log Off Confirmation Dialog */}
      <RetroDialog
        isOpen={logoutDialogOpen}
        title="Log Off FraudOS 95"
        message={`Are you sure you want to terminate analyst session for ${user?.email || 'this analyst'}?`}
        detail="Logging off will revoke your active session tokens and securely clear session cookies."
        type="question"
        confirmLabel="Log Off"
        cancelLabel="Cancel"
        onConfirm={async () => {
          setLogoutDialogOpen(false);
          await logout();
        }}
        onCancel={() => setLogoutDialogOpen(false)}
      />

      {/* Recycle Bin Dialog */}
      <RetroDialog
        isOpen={recycleBinDialogOpen}
        title="Recycle Bin"
        message="The Recycle Bin is empty."
        detail="No deleted investigation dossiers or model checkpoints are present."
        type="info"
        confirmLabel="OK"
        onConfirm={() => setRecycleBinDialogOpen(false)}
      />
    </div>
  );
};
