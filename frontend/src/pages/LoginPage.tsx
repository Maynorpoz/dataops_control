import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Eye, EyeOff, LogIn, Boxes } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '../components/ui/Spinner';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch {
      setError('Credenciales inválidas. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Boxes size={32} className="text-accent-cyan" />
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">DataOps</h1>
            <p className="text-xs text-text-muted font-body">Control Center</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-bg-surface border border-bg-border rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <KeyRound size={18} className="text-accent-cyan" />
            <h2 className="font-display text-base font-semibold text-text-primary">Iniciar sesión</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-display text-text-muted mb-1.5">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-bg-elevated border border-bg-border rounded-lg px-3 py-2.5 text-sm text-text-primary font-body placeholder-text-muted focus:outline-none focus:border-accent-cyan/60 transition-colors"
                placeholder="admin"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-display text-text-muted mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-bg-elevated border border-bg-border rounded-lg px-3 py-2.5 pr-10 text-sm text-text-primary font-body placeholder-text-muted focus:outline-none focus:border-accent-cyan/60 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-body">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-accent-cyan/20 hover:bg-accent-cyan/30 border border-accent-cyan/40 text-accent-cyan font-display text-sm font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? <Spinner size={16} /> : <LogIn size={16} />}
              {loading ? 'Autenticando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-xs text-text-muted mt-6 font-body">
            Demo: <span className="font-display text-accent-cyan">admin / admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
