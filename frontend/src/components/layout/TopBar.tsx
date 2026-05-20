import { useLocation } from 'react-router-dom';
import { Bell, BellRing, ChevronRight, UserCheck, Boxes } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAlerts } from '../../hooks/useAlerts';
import { useNavigate } from 'react-router-dom';

const BREADCRUMBS: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/connections': 'Conexiones',
  '/metrics':     'Métricas',
  '/queries':     'Slow Query Analyzer',
  '/concurrency': 'Simulador de Concurrencia',
  '/backup':      'Backup & Recovery',
  '/replication': 'Replicación Distribuida',
  '/alerts':      'Motor de Alertas',
  '/settings':    'Configuración',
};

export function TopBar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { alerts } = useAlerts();
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;

  const pageName = BREADCRUMBS[location.pathname] || 'DataOps';

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-bg-border bg-bg-surface shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-body">
        <Boxes size={16} className="text-accent-cyan" />
        <span className="text-text-muted">DataOps</span>
        <ChevronRight size={14} className="text-text-muted" />
        <span className="text-text-primary font-medium">{pageName}</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Alert bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          {criticalCount > 0 ? (
            <BellRing size={18} className="text-red-400 animate-pulse-slow" />
          ) : (
            <Bell size={18} />
          )}
          {criticalCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {criticalCount}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-2 text-sm font-body">
          <div className="w-7 h-7 rounded-full bg-accent-cyan/20 border border-accent-cyan/30 flex items-center justify-center">
            <UserCheck size={14} className="text-accent-cyan" />
          </div>
          <span className="text-text-secondary">{user?.username}</span>
        </div>
      </div>
    </header>
  );
}
