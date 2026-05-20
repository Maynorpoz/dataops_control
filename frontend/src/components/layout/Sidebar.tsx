import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Database, Activity, Search, Zap,
  Archive, GitBranch, Bell, Settings, LogOut, ChevronLeft, ChevronRight, Boxes,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Tooltip } from '../ui/Tooltip';

const NAV_ITEMS = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/connections',  icon: Database,         label: 'Conexiones' },
  { to: '/metrics',      icon: Activity,         label: 'Métricas' },
  { to: '/queries',      icon: Search,           label: 'Slow Queries' },
  { to: '/concurrency',  icon: Zap,              label: 'Concurrencia' },
  { to: '/backup',       icon: Archive,          label: 'Backup & Recovery' },
  { to: '/replication',  icon: GitBranch,        label: 'Replicación' },
  { to: '/alerts',       icon: Bell,             label: 'Alertas' },
  { to: '/settings',     icon: Settings,         label: 'Configuración' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { logout } = useAuth();

  return (
    <aside className={clsx(
      'flex flex-col bg-bg-surface border-r border-bg-border transition-all duration-300 shrink-0',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-bg-border">
        <Boxes size={22} className="text-accent-cyan shrink-0" />
        {!collapsed && (
          <span className="font-display text-sm font-bold text-text-primary tracking-wider">DataOps</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          collapsed ? (
            <Tooltip key={to} content={label}>
              <NavLink
                to={to}
                className={({ isActive }) => clsx(
                  'flex items-center justify-center p-2.5 rounded-lg transition-colors w-full',
                  isActive
                    ? 'bg-accent-cyan/15 text-accent-cyan'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
                )}
              >
                <Icon size={18} />
              </NavLink>
            </Tooltip>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-body',
                isActive
                  ? 'bg-accent-cyan/15 text-accent-cyan font-medium'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
              )}
            >
              <Icon size={16} className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          )
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="border-t border-bg-border p-2 space-y-1">
        <button
          onClick={() => logout()}
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors font-body',
            collapsed && 'justify-center'
          )}
        >
          <LogOut size={16} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>

        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
