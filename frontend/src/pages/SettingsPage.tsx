import { Settings, Shield, Cog, Terminal, Boxes } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
        <Settings size={18} className="text-accent-cyan" /> Configuración
      </h1>

      <Card className="space-y-4">
        <h3 className="text-sm font-semibold font-display text-text-primary flex items-center gap-2">
          <Shield size={14} className="text-accent-cyan" /> Información de sesión
        </h3>
        <div className="space-y-2 text-sm font-body text-text-secondary">
          <div className="flex justify-between"><span className="text-text-muted">Usuario</span><span className="font-display">{user?.username}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">Email</span><span className="font-display">{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">Rol</span><span className="font-display">{user?.role}</span></div>
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-sm font-semibold font-display text-text-primary flex items-center gap-2">
          <Boxes size={14} className="text-accent-cyan" /> Stack técnico
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs font-body text-text-muted">
          {[
            'Backend: Node.js 20 + Express + TypeScript',
            'Frontend: React 18 + Vite + TailwindCSS',
            'Base de datos: PostgreSQL 16',
            'Caché: Redis 7',
            'Métricas: Prometheus + Grafana',
            'Tiempo real: Socket.IO',
            'Iconos: Lucide React',
            'Cifrado: AES-256-CBC',
          ].map((item) => (
            <div key={item} className="flex items-center gap-1.5 p-2 bg-bg-elevated rounded border border-bg-border">
              <Cog size={10} className="text-accent-cyan shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-2">
        <h3 className="text-sm font-semibold font-display text-text-primary flex items-center gap-2">
          <Terminal size={14} className="text-accent-cyan" /> URLs de servicios
        </h3>
        {[
          { label: 'Frontend',    url: 'http://localhost:80' },
          { label: 'API Backend', url: 'http://localhost:3000' },
          { label: 'Prometheus',  url: 'http://localhost:9090' },
          { label: 'Grafana',     url: 'http://localhost:3001' },
        ].map(({ label, url }) => (
          <div key={label} className="flex items-center justify-between p-2.5 bg-bg-elevated rounded border border-bg-border text-xs font-body">
            <span className="text-text-muted">{label}</span>
            <a href={url} target="_blank" rel="noopener" className="font-display text-accent-cyan hover:underline">{url}</a>
          </div>
        ))}
      </Card>
    </div>
  );
}
