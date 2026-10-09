import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Windows 95 Desktop Workstation Container
 * Replaces modern web navbar/footer with an authentic, immersive full-screen operating system canvas.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div
      className="min-h-screen w-full relative overflow-hidden win95-font"
      style={{ backgroundColor: 'var(--win-desktop-teal)' }}
    >
      {children}
    </div>
  );
};
