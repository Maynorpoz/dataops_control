import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { MetricsPage } from './pages/MetricsPage';
import { SlowQueryPage } from './pages/SlowQueryPage';
import { ConcurrencyPage } from './pages/ConcurrencyPage';
import { BackupPage } from './pages/BackupPage';
import { ReplicationPage } from './pages/ReplicationPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Spinner } from './components/ui/Spinner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center min-h-screen bg-bg-primary"><Spinner size={32} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AlertProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"   element={<DashboardPage />} />
              <Route path="connections" element={<ConnectionsPage />} />
              <Route path="metrics"     element={<MetricsPage />} />
              <Route path="queries"     element={<SlowQueryPage />} />
              <Route path="concurrency" element={<ConcurrencyPage />} />
              <Route path="backup"      element={<BackupPage />} />
              <Route path="replication" element={<ReplicationPage />} />
              <Route path="alerts"      element={<AlertsPage />} />
              <Route path="settings"    element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
