import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './infrastructure/swagger/swaggerSpec';

import { apiRateLimiter } from './api/middlewares/rateLimiter';
import { errorHandler } from './api/middlewares/errorHandler';

import authRoutes       from './api/routes/auth.routes';
import connectionsRoutes from './api/routes/connections.routes';
import metricsRoutes    from './api/routes/metrics.routes';
import queriesRoutes    from './api/routes/queries.routes';
import concurrencyRoutes from './api/routes/concurrency.routes';
import backupRoutes     from './api/routes/backup.routes';
import replicationRoutes from './api/routes/replication.routes';
import alertsRoutes     from './api/routes/alerts.routes';
import healthRoutes     from './api/routes/health.routes';

import { register } from './infrastructure/prometheus/MetricsExporter';

export function createApp() {
  const app = express();

  app.use(helmet());
  const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ['http://localhost', 'http://localhost:80'];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }));
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());
  app.use(apiRateLimiter);

  // Routes
  app.use('/api/auth',        authRoutes);
  app.use('/api/connections', connectionsRoutes);
  app.use('/api/metrics',     metricsRoutes);
  app.use('/api/queries',     queriesRoutes);
  app.use('/api/concurrency', concurrencyRoutes);
  app.use('/api/backup',      backupRoutes);
  app.use('/api/replication', replicationRoutes);
  app.use('/api/alerts',      alertsRoutes);
  app.use('/health',          healthRoutes);

  // Swagger UI — sin autenticación
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'DataOps API Docs',
    swaggerOptions: { persistAuthorization: true },
  }));

  // Prometheus metrics endpoint — no auth
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  app.use(errorHandler);

  return app;
}
