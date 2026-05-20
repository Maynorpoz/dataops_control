import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AlertBanner } from './AlertBanner';
import { useSocket } from '../../hooks/useSocket';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  useSocket(); // Connect Socket.IO globally

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden font-body text-text-primary">
      <AlertBanner />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
