import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { createApp } from './app';
import { AlertEngine } from './infrastructure/alerts/AlertEngine';
import { DashboardNotifier } from './infrastructure/alerts/DashboardNotifier';
import { startHealthCheckWorker } from './infrastructure/workers/HealthCheckWorker';
import { startBackupSchedulerWorker } from './infrastructure/workers/BackupSchedulerWorker';
import { startReplicationMonitorWorker } from './infrastructure/workers/ReplicationMonitorWorker';
import { getPool } from './infrastructure/database/PostgresConnection';

const PORT = parseInt(process.env.PORT || '3000');

async function bootstrap() {
  // Verify DB connection
  console.log('[Bootstrap] Connecting to database...');
  await getPool().query('SELECT 1');
  console.log('[Bootstrap] Database connected');

  // Initialize alert engine rules
  await AlertEngine.initialize();

  const app = createApp();
  const httpServer = createServer(app);

  // Socket.IO setup
  const io = new SocketServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  DashboardNotifier.setIo(io);

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  // Start background workers
  startHealthCheckWorker();
  startBackupSchedulerWorker();
  startReplicationMonitorWorker();

  httpServer.listen(PORT, () => {
    console.log(`[Server] DataOps Control Center running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`[Server] Received ${signal} — shutting down gracefully...`);
    httpServer.close(async () => {
      await getPool().end();
      console.log('[Server] Shutdown complete');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal error:', err);
  process.exit(1);
});
