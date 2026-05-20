# 🚀 PROMPT MAESTRO — CLAUDE CODE
## DataOps Control Center — Plataforma Empresarial de Monitoreo de Bases de Datos

---

## 🎯 ROL Y MISIÓN

Actúa como un **Arquitecto de Software Principal de Nivel Élite** e **Ingeniero DevOps Senior**. Tu misión es implementar el **DataOps Control Center** desde cero: una plataforma empresarial de nivel producción para monitoreo, gestión y recuperación inteligente de bases de datos. El sistema debe ser completamente modular, seguro, con tipado estricto en TypeScript y desplegable localmente con un solo comando (`docker compose up --build`).

---

## 🛠️ STACK TECNOLÓGICO DEFINITIVO (NO NEGOCIABLE)

### Decisiones técnicas justificadas críticamente:

**Backend — Node.js 20 LTS + Express + TypeScript**
- Justificación: Ecosistema maduro para operaciones I/O-intensivas (conexiones BD concurrentes), `async/await` nativo, drivers robustos para los 3 motores objetivo (`pg`, `mssql`, `oracledb`). Menor overhead de contenedor vs Java/Spring. Integración directa con Redis via `ioredis`. Workers con `node-cron` y `bull` para jobs de background.

**Frontend — React 18 + TypeScript + Vite + TailwindCSS**
- Justificación: React 18 con Concurrent Mode para actualizaciones en tiempo real sin bloqueo. Vite para HMR ultrarrápido en desarrollo y bundles optimizados en producción. Tailwind para utility-first sin CSS-in-JS overhead.
- **ICONOGRAFÍA OBLIGATORIA**: `lucide-react` EXCLUSIVAMENTE. Zero iconos genéricos, zero SVGs inline sin semántica. Cada elemento de UI, cada sección, cada métrica, cada estado de alerta debe llevar su ícono de Lucide correspondiente.
- **Charts**: `recharts` para gráficos de línea temporal y `react-circular-progressbar` para KPIs circulares.
- **Tiempo real**: `socket.io-client` para feeds de métricas en vivo.

**Infraestructura Fija:**
- Base de datos de metadatos: `PostgreSQL 16`
- Caché + Blacklist JWT: `Redis 7`
- Métricas operativas: `Prometheus + Grafana`
- Motores objetivo simulados: `postgres-target`, `mssql-target`

---

## 📁 ESTRUCTURA COMPLETA DE DIRECTORIOS

Genera EXACTAMENTE esta estructura. No omitas ningún archivo:

```
dataops-control-center/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   │
│   └── src/
│       ├── main.ts                          # Entry point + graceful shutdown
│       ├── app.ts                           # Express app + middleware config
│       │
│       ├── domain/                          # Capa de Dominio (Entidades + Contratos)
│       │   ├── entities/
│       │   │   ├── User.ts
│       │   │   ├── Connection.ts
│       │   │   ├── DbMetric.ts
│       │   │   ├── QueryLog.ts
│       │   │   ├── TxLog.ts
│       │   │   ├── BackupHistory.ts
│       │   │   ├── AlertLog.ts
│       │   │   └── ReplicationLag.ts
│       │   │
│       │   └── interfaces/
│       │       ├── IDatabaseEngine.ts       # Strategy Pattern interface
│       │       ├── IBackupStrategy.ts
│       │       ├── IAlertObserver.ts        # Observer Pattern interface
│       │       ├── ICacheService.ts
│       │       └── IHealthCheckService.ts
│       │
│       ├── application/                     # Casos de Uso (Lógica de Aplicación)
│       │   ├── auth/
│       │   │   ├── LoginUseCase.ts
│       │   │   ├── LogoutUseCase.ts
│       │   │   └── RefreshTokenUseCase.ts
│       │   ├── connections/
│       │   │   ├── CreateConnectionUseCase.ts
│       │   │   ├── UpdateConnectionUseCase.ts
│       │   │   ├── DeleteConnectionUseCase.ts
│       │   │   └── TestConnectionUseCase.ts
│       │   ├── metrics/
│       │   │   ├── CollectMetricsUseCase.ts
│       │   │   └── GetDashboardMetricsUseCase.ts
│       │   ├── queries/
│       │   │   ├── CaptureSlowQueryUseCase.ts
│       │   │   └── GetQueryLogsUseCase.ts
│       │   ├── concurrency/
│       │   │   ├── SimulateConcurrentLoadUseCase.ts
│       │   │   └── ResolveDeadlockUseCase.ts
│       │   ├── backup/
│       │   │   ├── ExecuteFullBackupUseCase.ts
│       │   │   ├── ExecuteDiffBackupUseCase.ts
│       │   │   ├── ExecuteIncrementalBackupUseCase.ts
│       │   │   ├── CreateSnapshotUseCase.ts
│       │   │   ├── RestoreSnapshotUseCase.ts
│       │   │   └── UploadBackupToCloudUseCase.ts
│       │   ├── replication/
│       │   │   └── MeasureReplicationLagUseCase.ts
│       │   └── alerts/
│       │       ├── EvaluateAlertRulesUseCase.ts
│       │       └── UpdateAlertThresholdsUseCase.ts
│       │
│       ├── infrastructure/                  # Implementaciones concretas
│       │   ├── database/
│       │   │   ├── PostgresConnection.ts    # Conexión pool al app-db (metadatos)
│       │   │   └── migrations/
│       │   │       ├── 001_create_users.sql
│       │   │       ├── 002_create_connections.sql
│       │   │       ├── 003_create_db_metrics.sql
│       │   │       ├── 004_create_query_log.sql
│       │   │       ├── 005_create_tx_log.sql
│       │   │       ├── 006_create_backup_history.sql
│       │   │       ├── 007_create_alert_log.sql
│       │   │       ├── 008_create_replication_lag.sql
│       │   │       └── 009_seed_data.sql
│       │   │
│       │   ├── engines/                     # Strategy Pattern — Motores BD
│       │   │   ├── PostgreSQLEngine.ts      # Implementa IDatabaseEngine
│       │   │   ├── SQLServerEngine.ts       # Implementa IDatabaseEngine
│       │   │   ├── OracleEngine.ts          # Implementa IDatabaseEngine (simulado)
│       │   │   └── EngineFactory.ts         # Factory que retorna la estrategia correcta
│       │   │
│       │   ├── cache/
│       │   │   └── RedisService.ts          # ICacheService impl + CACHE HIT/MISS logs
│       │   │
│       │   ├── crypto/
│       │   │   └── AES256Service.ts         # Cifrado AES-256-CBC para credenciales
│       │   │
│       │   ├── storage/
│       │   │   ├── S3StorageService.ts      # AWS S3 multipart upload + hash SHA256
│       │   │   └── AzureBlobService.ts      # Azure Blob Storage streaming
│       │   │
│       │   ├── workers/                     # Background jobs
│       │   │   ├── HealthCheckWorker.ts     # Cron cada 60s exactos
│       │   │   ├── BackupSchedulerWorker.ts # Full diario, Diff cada 6h, Inc cada 1h
│       │   │   ├── CloudUploadWorker.ts     # Upload async no-bloqueante
│       │   │   └── ReplicationMonitorWorker.ts
│       │   │
│       │   ├── alerts/                      # Observer Pattern
│       │   │   ├── AlertEngine.ts           # Subject — evalúa reglas en memoria
│       │   │   ├── DashboardNotifier.ts     # Observer — emit via Socket.IO
│       │   │   ├── EmailSimulator.ts        # Observer — simula envío email
│       │   │   └── AlertRulesConfig.ts      # JSON configurable en caliente
│       │   │
│       │   └── prometheus/
│       │       └── MetricsExporter.ts       # Expone /metrics para Prometheus scraping
│       │
│       └── api/                             # Capa de API REST
│           ├── middlewares/
│           │   ├── authMiddleware.ts        # JWT verify + Redis blacklist check
│           │   ├── errorHandler.ts          # Global exception handler
│           │   ├── rateLimiter.ts
│           │   └── cacheMiddleware.ts       # Redis cache interceptor genérico
│           │
│           ├── routes/
│           │   ├── auth.routes.ts
│           │   ├── connections.routes.ts
│           │   ├── metrics.routes.ts
│           │   ├── queries.routes.ts
│           │   ├── concurrency.routes.ts
│           │   ├── backup.routes.ts
│           │   ├── replication.routes.ts
│           │   ├── alerts.routes.ts
│           │   └── health.routes.ts
│           │
│           └── controllers/
│               ├── AuthController.ts
│               ├── ConnectionsController.ts
│               ├── MetricsController.ts
│               ├── QueriesController.ts
│               ├── ConcurrencyController.ts
│               ├── BackupController.ts
│               ├── ReplicationController.ts
│               └── AlertsController.ts
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── index.html
│   │
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                          # Router principal + providers
│       │
│       ├── types/                           # TypeScript interfaces globales
│       │   └── index.ts
│       │
│       ├── context/
│       │   ├── AuthContext.tsx              # JWT state global
│       │   └── AlertContext.tsx             # Alertas en tiempo real
│       │
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useSocket.ts                 # Socket.IO hook
│       │   ├── useMetrics.ts
│       │   └── useAlerts.ts
│       │
│       ├── services/                        # HTTP layer (axios + interceptors)
│       │   ├── api.ts                       # Axios instance + Bearer interceptor + 401 redirect
│       │   ├── authService.ts
│       │   ├── connectionsService.ts
│       │   ├── metricsService.ts
│       │   ├── backupService.ts
│       │   ├── alertsService.ts
│       │   └── replicationService.ts
│       │
│       ├── pages/                           # Patrón Contenedor (lógica)
│       │   ├── LoginPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── ConnectionsPage.tsx
│       │   ├── MetricsPage.tsx
│       │   ├── SlowQueryPage.tsx
│       │   ├── ConcurrencyPage.tsx
│       │   ├── BackupPage.tsx
│       │   ├── ReplicationPage.tsx
│       │   ├── AlertsPage.tsx
│       │   └── SettingsPage.tsx
│       │
│       └── components/                      # Patrón Presentador (UI pura)
│           ├── layout/
│           │   ├── AppShell.tsx             # Layout principal dark theme
│           │   ├── Sidebar.tsx              # Nav con íconos Lucide
│           │   ├── TopBar.tsx
│           │   └── AlertBanner.tsx
│           │
│           ├── dashboard/
│           │   ├── StatusCard.tsx           # Healthy/Warning/Critical con íconos
│           │   ├── MetricGauge.tsx          # CPU, RAM, Disco circular
│           │   ├── ConnectionsChart.tsx     # Recharts LineChart tiempo real
│           │   ├── DeadlockAlert.tsx
│           │   └── SLAIndicator.tsx
│           │
│           ├── connections/
│           │   ├── ConnectionForm.tsx       # CRUD formulario
│           │   ├── ConnectionCard.tsx       # Card con estado + íconos motor
│           │   └── ConnectionTable.tsx
│           │
│           ├── queries/
│           │   ├── QueryClassificationBadge.tsx  # Fast/Medium/Slow/Critical
│           │   ├── SlowQueryTable.tsx
│           │   └── ExecutionPlanViewer.tsx
│           │
│           ├── backup/
│           │   ├── BackupTreeView.tsx        # FULL→DIFF→INC jerarquía visual
│           │   ├── BackupHistoryTable.tsx
│           │   ├── SnapshotCard.tsx          # PRE_DEPLOY, PRE_TEST, PRE_IMPORT
│           │   ├── RPORTOIndicator.tsx
│           │   └── CloudUploadStatus.tsx
│           │
│           ├── replication/
│           │   ├── LagGauge.tsx              # Velocímetro visual del lag
│           │   └── ReplicationTopology.tsx
│           │
│           ├── alerts/
│           │   ├── AlertFeed.tsx             # Feed en tiempo real
│           │   ├── AlertRuleEditor.tsx       # Editor JSON en caliente
│           │   └── AlertHistoryTable.tsx
│           │
│           └── ui/                          # Primitivos UI reutilizables
│               ├── Badge.tsx
│               ├── Card.tsx
│               ├── DataTable.tsx
│               ├── Modal.tsx
│               ├── Spinner.tsx
│               └── Tooltip.tsx
│
├── prometheus/
│   ├── prometheus.yml
│   └── alerts.yml
│
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── prometheus.yml
│   │   └── dashboards/
│   │       ├── dashboard.yml
│   │       └── dataops-overview.json
│   └── Dockerfile
│
└── scripts/
    ├── init-db.sql                          # Script completo DDL + DML seed
    ├── init-target-postgres.sql             # Tablas en postgres-target
    └── wait-for-it.sh
```

---

## 🗄️ ESQUEMA DE BASE DE DATOS COMPLETO

Implementa EXACTAMENTE este DDL en `scripts/init-db.sql`:

```sql
-- =============================================================
-- DataOps Control Center — Schema DDL + Seed Data
-- Base de datos: app-db (PostgreSQL 16)
-- =============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── ENUMS ──────────────────────────────────────────────────
CREATE TYPE engine_type AS ENUM ('PostgreSQL', 'SQLServer', 'Oracle');
CREATE TYPE conn_status AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR');
CREATE TYPE health_status AS ENUM ('HEALTHY', 'WARNING', 'CRITICAL');
CREATE TYPE backup_type AS ENUM ('FULL', 'DIFF', 'INC', 'SNAPSHOT');
CREATE TYPE backup_status AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');
CREATE TYPE alert_severity AS ENUM ('INFO', 'WARNING', 'CRITICAL');
CREATE TYPE alert_status AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');
CREATE TYPE query_class AS ENUM ('FAST', 'MEDIUM', 'SLOW', 'CRITICAL');
CREATE TYPE lock_type AS ENUM ('SHARED', 'EXCLUSIVE', 'DEADLOCK', 'TIMEOUT');
CREATE TYPE snapshot_label AS ENUM ('PRE_DEPLOY', 'PRE_TEST', 'PRE_IMPORT');

-- ─── USERS ──────────────────────────────────────────────────
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role        VARCHAR(20) DEFAULT 'admin',
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CONNECTIONS ────────────────────────────────────────────
CREATE TABLE connections (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    motor           engine_type NOT NULL,
    host            VARCHAR(255) NOT NULL,
    port            INTEGER NOT NULL,
    database_name   VARCHAR(100) NOT NULL,
    user_name       VARCHAR(100) NOT NULL,
    encrypted_password TEXT NOT NULL,      -- AES-256-CBC cifrado, NUNCA texto plano
    status          conn_status DEFAULT 'ACTIVE',
    health_status   health_status DEFAULT 'HEALTHY',
    last_checked_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DB_METRICS ─────────────────────────────────────────────
CREATE TABLE db_metrics (
    id              BIGSERIAL PRIMARY KEY,
    db_id           INTEGER REFERENCES connections(id) ON DELETE CASCADE,
    cpu             DECIMAL(5,2),          -- % CPU
    memory          DECIMAL(5,2),          -- % RAM
    connections     INTEGER,               -- Conexiones activas
    locks           INTEGER,               -- Bloqueos activos
    deadlocks       INTEGER DEFAULT 0,     -- Interbloqueos
    disk_usage      DECIMAL(10,2),         -- MB usados
    disk_total      DECIMAL(10,2),         -- MB totales
    health_status   health_status DEFAULT 'HEALTHY',
    capture_time    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_db_metrics_db_id_time ON db_metrics(db_id, capture_time DESC);

-- ─── QUERY_LOG ──────────────────────────────────────────────
CREATE TABLE query_log (
    id              BIGSERIAL PRIMARY KEY,
    db_id           INTEGER REFERENCES connections(id) ON DELETE CASCADE,
    query_text      TEXT NOT NULL,
    duration_ms     INTEGER NOT NULL,
    rows_returned   INTEGER,
    index_used      VARCHAR(255),
    execution_plan  JSONB,
    classification  query_class NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_query_log_duration ON query_log(duration_ms DESC);
CREATE INDEX idx_query_log_class ON query_log(classification);

-- ─── TX_LOG ─────────────────────────────────────────────────
CREATE TABLE tx_log (
    id          BIGSERIAL PRIMARY KEY,
    db_id       INTEGER REFERENCES connections(id) ON DELETE CASCADE,
    session_id  VARCHAR(100) NOT NULL,
    operacion   VARCHAR(10) CHECK (operacion IN ('INSERT','UPDATE','DELETE','SELECT')),
    inicio      TIMESTAMPTZ NOT NULL,
    fin         TIMESTAMPTZ,
    wait_time   INTEGER,                   -- ms
    lock_type   lock_type,
    resolved    BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tx_log_deadlock ON tx_log(lock_type) WHERE lock_type = 'DEADLOCK';

-- ─── BACKUP_HISTORY ─────────────────────────────────────────
CREATE TABLE backup_history (
    id              BIGSERIAL PRIMARY KEY,
    db_id           INTEGER REFERENCES connections(id) ON DELETE CASCADE,
    backup_type     backup_type NOT NULL,
    parent_id       BIGINT REFERENCES backup_history(id),  -- Para cadena DIFF/INC
    snapshot_label  snapshot_label,
    file_path       VARCHAR(500),
    file_size_mb    DECIMAL(10,2),
    file_hash       VARCHAR(128),                          -- SHA256
    duration_seconds INTEGER,
    status          backup_status DEFAULT 'PENDING',
    cloud_url       TEXT,                                  -- URL S3/Azure post-upload
    restore_point   TIMESTAMPTZ,
    error_message   TEXT,
    rpo_minutes     INTEGER,                               -- Calculado
    rto_minutes     INTEGER,                               -- Calculado
    sla_met         BOOLEAN,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_backup_history_db_type ON backup_history(db_id, backup_type);

-- ─── REPLICATION_LAG ────────────────────────────────────────
CREATE TABLE replication_lag (
    id              BIGSERIAL PRIMARY KEY,
    primary_db_id   INTEGER REFERENCES connections(id),
    replica_db_id   INTEGER REFERENCES connections(id),
    lag_seconds     DECIMAL(10,3),
    scenario        VARCHAR(50),           -- 'NORMAL_LOAD', 'MEDIUM_LOAD', 'HIGH_LOAD'
    health_status   health_status DEFAULT 'HEALTHY',
    measured_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_replication_lag_time ON replication_lag(measured_at DESC);

-- ─── ALERT_LOG ──────────────────────────────────────────────
CREATE TABLE alert_log (
    id              BIGSERIAL PRIMARY KEY,
    db_id           INTEGER REFERENCES connections(id),
    rule_name       VARCHAR(100) NOT NULL,
    condition_value DECIMAL(10,2),
    threshold_value DECIMAL(10,2),
    severity        alert_severity NOT NULL,
    status          alert_status DEFAULT 'OPEN',
    message         TEXT NOT NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_alert_log_status ON alert_log(status);
CREATE INDEX idx_alert_log_severity ON alert_log(severity);

-- ─── ALERT_RULES (configuración dinámica en BD) ─────────────
CREATE TABLE alert_rules (
    id              SERIAL PRIMARY KEY,
    rule_name       VARCHAR(100) UNIQUE NOT NULL,
    metric          VARCHAR(50) NOT NULL,
    operator        VARCHAR(10) NOT NULL,    -- '>', '<', '>=', '<='
    threshold       DECIMAL(10,2) NOT NULL,
    severity        alert_severity NOT NULL,
    action          VARCHAR(50) NOT NULL,    -- 'EMAIL', 'DASHBOARD', 'FLASH_UI'
    is_active       BOOLEAN DEFAULT TRUE,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SEED: USUARIOS ─────────────────────────────────────────
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@dataops.local', '$2b$12$placeholder_will_be_hashed_on_init', 'admin');

-- ─── SEED: REGLAS DE ALERTA (JSON configurable desde API) ───
INSERT INTO alert_rules (rule_name, metric, operator, threshold, severity, action) VALUES
('CPU_HIGH',         'cpu',          '>',  85.0,  'WARNING',  'EMAIL'),
('DEADLOCK_CRITICAL','deadlocks',    '>',  3,     'CRITICAL', 'DASHBOARD'),
('DISK_CRITICAL',    'disk_usage',   '>',  90.0,  'CRITICAL', 'FLASH_UI'),
('REPLICATION_LAG',  'lag_seconds',  '>',  10.0,  'WARNING',  'DASHBOARD'),
('CONN_OVERLOAD',    'connections',  '>',  100,   'WARNING',  'DASHBOARD');
```

**Script para postgres-target** (`scripts/init-target-postgres.sql`):

```sql
-- Base de datos objetivo simulada (postgres-target)
-- Se simularán operaciones sobre esta BD para métricas
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    total DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100),
    operation VARCHAR(10),
    old_data JSONB,
    new_data JSONB,
    performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data para simulaciones de carga
INSERT INTO products (name, price, stock, category)
SELECT
    'Product_' || i,
    (RANDOM() * 1000)::DECIMAL(10,2),
    (RANDOM() * 500)::INTEGER,
    CASE (i % 5) WHEN 0 THEN 'Electronics' WHEN 1 THEN 'Clothing'
                  WHEN 2 THEN 'Food' WHEN 3 THEN 'Books' ELSE 'Tools' END
FROM generate_series(1, 10000) i;
```

---

## 🔐 MÓDULO 1: AUTENTICACIÓN Y SEGURIDAD

### `src/infrastructure/crypto/AES256Service.ts`

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes en hex
const IV_LENGTH = 16;

export class AES256Service {
  static encrypt(plainText: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  static decrypt(encryptedText: string): string {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }
}
```

### `src/api/middlewares/authMiddleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RedisService } from '../../infrastructure/cache/RedisService';

export interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export const authMiddleware = async (
  req: AuthRequest, res: Response, next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token ausente o mal formado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Verificar blacklist en Redis
  const isBlacklisted = await RedisService.get(`blacklist:${token}`);
  if (isBlacklisted) {
    res.status(401).json({ error: 'Token invalidado (sesión cerrada)' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
```

### Auth endpoints a implementar:

- `POST /api/auth/login` — Genera Access Token (15min) + Refresh Token en cookie `HttpOnly, Secure, SameSite=Strict` (7d)
- `POST /api/auth/logout` — Agrega Access Token a Redis blacklist con TTL = tiempo restante del token
- `POST /api/auth/refresh` — Lee cookie, valida Refresh Token, emite nuevo Access Token
- `GET  /api/auth/me` — Devuelve datos del usuario autenticado (requiere `authMiddleware`)

---

## 🔌 MÓDULO 2: GESTIÓN DE CONEXIONES + HEALTH CHECK

### Strategy Pattern — `src/domain/interfaces/IDatabaseEngine.ts`

```typescript
export interface TelemetryData {
  cpu: number;            // porcentaje 0-100
  memory: number;         // porcentaje 0-100
  activeConnections: number;
  activeLocks: number;
  deadlocks: number;
  diskUsageMB: number;
  diskTotalMB: number;
}

export interface SlowQuery {
  queryText: string;
  durationMs: number;
  rowsReturned: number;
  indexUsed: string | null;
  executionPlan: object;
}

export interface IDatabaseEngine {
  readonly engineType: 'PostgreSQL' | 'SQLServer' | 'Oracle';
  testConnection(): Promise<boolean>;
  collectTelemetry(): Promise<TelemetryData>;
  getSlowQueries(thresholdMs: number): Promise<SlowQuery[]>;
  executeQuery(sql: string): Promise<any[]>;
  killSession(sessionId: string): Promise<void>;
  measureReplicationLag(): Promise<number>;
}
```

### `src/infrastructure/engines/PostgreSQLEngine.ts` (implementación completa)

Implementa `IDatabaseEngine` usando el driver `pg` con pool de conexiones. Para `collectTelemetry()` usa estas queries reales de PostgreSQL:

```sql
-- CPU simulado desde pg_stat_bgwriter + random para demo
-- Conexiones activas
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
-- Bloqueos
SELECT count(*) FROM pg_locks WHERE granted = false;
-- Deadlocks desde estadísticas
SELECT deadlocks FROM pg_stat_database WHERE datname = current_database();
-- Uso de disco
SELECT pg_database_size(current_database()) / 1048576.0 as size_mb;
```

Para CPU y RAM (no disponibles en PostgreSQL nativo), genera valores **realistas simulados** con variación basada en tiempo y carga del sistema, documentando explícitamente que son simulados.

### `src/infrastructure/workers/HealthCheckWorker.ts`

```typescript
import cron from 'node-cron';
import { EngineFactory } from '../engines/EngineFactory';
import { AlertEngine } from '../alerts/AlertEngine';

// CRÍTICO: Exactamente cada 60 segundos, no 1 minuto relativo
cron.schedule('*/1 * * * *', async () => {
  console.log(`[HealthCheck] ${new Date().toISOString()} — Iniciando ciclo de telemetría`);
  
  const connections = await ConnectionRepository.findAllActive();
  
  await Promise.allSettled(
    connections.map(async (conn) => {
      const engine = EngineFactory.create(conn);
      const telemetry = await engine.collectTelemetry();
      
      // Clasificar health status
      const health = classifyHealth(telemetry);
      
      // Guardar en DB_METRICS
      await MetricsRepository.save({ ...telemetry, db_id: conn.id, health_status: health });
      
      // Evaluar reglas de alerta (asíncrono, no bloqueante)
      AlertEngine.evaluate(conn.id, telemetry).catch(console.error);
    })
  );
});

function classifyHealth(t: TelemetryData): 'HEALTHY' | 'WARNING' | 'CRITICAL' {
  if (t.cpu > 85 || t.memory > 85 || t.deadlocks > 3 || t.diskUsageMB / t.diskTotalMB > 0.9)
    return 'CRITICAL';
  if (t.cpu > 70 || t.memory > 70 || t.activeLocks > 5)
    return 'WARNING';
  return 'HEALTHY';
}
```

---

## 📊 MÓDULO 3: SLOW QUERY ANALYZER

### `src/api/routes/queries.routes.ts`

Endpoints:
- `GET /api/queries` — Lista queries con filtro por clasificación, paginación
- `GET /api/queries/top-slow?limit=10` — Top 10 más lentas (Redis cached, TTL 30s)
- `POST /api/queries/capture` — Fuerza captura manual en motor específico
- `GET /api/queries/:id/plan` — Devuelve plan de ejecución serializado

### `src/infrastructure/cache/RedisService.ts` (CACHE HIT/MISS logging obligatorio)

```typescript
import Redis from 'ioredis';

export class RedisService {
  private static client = new Redis({ host: process.env.REDIS_HOST, port: 6379 });

  static async getCached<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number): Promise<T> {
    const cached = await this.client.get(key);
    
    if (cached) {
      // ✅ CACHE HIT — log explícito para evidencia
      console.log(`[CACHE HIT] key="${key}" | response_time=~40ms | source=Redis`);
      return JSON.parse(cached) as T;
    }
    
    // ❌ CACHE MISS — ejecutar query real
    const startTime = Date.now();
    console.log(`[CACHE MISS] key="${key}" | fetching from database...`);
    
    const result = await fetchFn();
    const elapsed = Date.now() - startTime;
    
    console.log(`[CACHE MISS] key="${key}" | response_time=${elapsed}ms | caching for ${ttlSeconds}s`);
    await this.client.setex(key, ttlSeconds, JSON.stringify(result));
    
    return result;
  }

  // Para JWT Blacklist
  static async addToBlacklist(token: string, ttlSeconds: number): Promise<void> {
    await this.client.setex(`blacklist:${token}`, ttlSeconds, '1');
  }

  // Invalidación dirigida por evento
  static async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
      console.log(`[CACHE INVALIDATED] ${keys.length} keys matching "${pattern}"`);
    }
  }
}
```

**TTL Policy** (documentar en código):
- Dashboard metrics: 30 segundos
- Slow queries top-10: 30 segundos
- Connection list: 60 segundos
- Backup history: 120 segundos
- Alert rules: 300 segundos (5 min) — invalidar al actualizar

---

## ⚡ MÓDULO 4: SIMULADOR DE CONCURRENCIA EXTREMA

### `src/application/concurrency/SimulateConcurrentLoadUseCase.ts`

```typescript
import { Worker } from 'worker_threads';
import { Pool } from 'pg';

export interface ConcurrencyResult {
  totalTransactions: number;
  successCount: number;
  deadlockCount: number;
  resolvedDeadlocks: number;
  avgWaitTimeMs: number;
  duration: number;
}

export class SimulateConcurrentLoadUseCase {
  async execute(connectionId: number, concurrentUsers: number = 100): Promise<ConcurrencyResult> {
    // Mínimo 100 usuarios concurrentes como dice el requerimiento
    const users = Math.max(concurrentUsers, 100);
    
    // Usar Promise.all para simular verdadera concurrencia
    const batchSize = 20; // Batches de 20 para no saturar el pool
    const results: TransactionResult[] = [];
    
    for (let i = 0; i < users; i += batchSize) {
      const batch = Array.from({ length: Math.min(batchSize, users - i) }, (_, j) =>
        this.simulateUserSession(connectionId, `session_${i + j}`)
      );
      results.push(...await Promise.allSettled(batch));
    }
    
    // Detectar y resolver deadlocks
    const deadlocks = results.filter(r => r.status === 'rejected' && r.reason?.includes('deadlock'));
    for (const deadlock of deadlocks) {
      await this.resolveDeadlock(connectionId, deadlock.sessionId);
    }
    
    return this.aggregateResults(results);
  }
  
  private async simulateUserSession(dbId: number, sessionId: string): Promise<void> {
    const operations = this.getRandomMixedOperations();
    const start = Date.now();
    
    try {
      await this.executeTransaction(dbId, sessionId, operations);
    } finally {
      await TxLogRepository.save({
        db_id: dbId, session_id: sessionId,
        operacion: operations[0].type, inicio: new Date(start),
        fin: new Date(), wait_time: Date.now() - start
      });
    }
  }
  
  private async resolveDeadlock(dbId: number, sessionId: string): Promise<void> {
    // Matar la sesión bloqueada y liberar locks
    const engine = await EngineFactory.createById(dbId);
    await engine.killSession(sessionId);
    console.log(`[DEADLOCK RESOLVED] session=${sessionId} on db=${dbId}`);
  }
}
```

---

## 💾 MÓDULO 5: BACKUP, RECOVERY Y CLOUD UPLOAD

### `src/application/backup/ExecuteFullBackupUseCase.ts`

Genera backups REALES de postgres-target usando `pg_dump` via `child_process.exec`. Para mssql usa `BACKUP DATABASE` SQL. Para Oracle simula con export de datos.

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import fs from 'fs';

const execAsync = promisify(exec);

export class ExecuteFullBackupUseCase {
  async execute(connectionId: number): Promise<BackupHistory> {
    const conn = await ConnectionRepository.findById(connectionId);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = `/backups/${conn.nombre}_FULL_${timestamp}.pgdump`;
    
    const startTime = Date.now();
    
    try {
      // Ejecutar pg_dump real
      await execAsync(
        `pg_dump -h ${conn.host} -p ${conn.port} -U ${conn.user_name} -d ${conn.database_name} -F c -f ${filePath}`,
        { env: { ...process.env, PGPASSWORD: AES256Service.decrypt(conn.encrypted_password) } }
      );
      
      // Calcular hash SHA-256 del archivo
      const hash = await this.calculateFileHash(filePath);
      const stats = fs.statSync(filePath);
      const fileSizeMB = stats.size / (1024 * 1024);
      const duration = Math.floor((Date.now() - startTime) / 1000);
      
      // Guardar en BACKUP_HISTORY
      const backup = await BackupRepository.save({
        db_id: connectionId, backup_type: 'FULL',
        file_path: filePath, file_size_mb: fileSizeMB,
        file_hash: hash, duration_seconds: duration,
        status: 'SUCCESS', restore_point: new Date()
      });
      
      // Disparar cloud upload ASÍNCRONO (no bloqueante)
      CloudUploadWorker.enqueue(backup.id).catch(console.error);
      
      // Disparar invalidación de caché
      await RedisService.invalidatePattern('cache:backup:*');
      
      return backup;
    } catch (error) {
      await BackupRepository.save({ db_id: connectionId, backup_type: 'FULL', status: 'FAILED', error_message: String(error) });
      AlertEngine.fireBackupFailed(connectionId, String(error));
      throw error;
    }
  }
  
  private async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }
}
```

### Snapshots con disaster recovery:

```typescript
// POST /api/backup/snapshot — Crea snapshot con label obligatorio
// POST /api/backup/simulate-disaster — Ejecuta DROP TABLE accidental + mide RPO/RTO
// POST /api/backup/restore/:id — Restaura desde snapshot, mide tiempo real (RTO)

// RPO = tiempo desde último backup hasta el desastre
// RTO = tiempo que tarda la restauración completa
```

### `src/infrastructure/storage/S3StorageService.ts`

```typescript
import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

export class S3StorageService {
  private client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  });

  async uploadWithStreaming(localPath: string, s3Key: string): Promise<string> {
    const bucket = process.env.AWS_S3_BUCKET!;
    const fileStream = fs.createReadStream(localPath, { highWaterMark: 10 * 1024 * 1024 }); // 10MB chunks
    
    // Multipart upload para archivos grandes
    const createResp = await this.client.send(new CreateMultipartUploadCommand({ Bucket: bucket, Key: s3Key }));
    const uploadId = createResp.UploadId!;
    
    // ... implementar upload por partes
    
    return `https://${bucket}.s3.amazonaws.com/${s3Key}`;
  }
}
```

---

## 🔄 MÓDULO 6: REPLICACIÓN DISTRIBUIDA

### Configuración Docker de réplica PostgreSQL:

En `docker-compose.yml` incluir un contenedor `postgres-replica` configurado con:
- Primary: `postgres-target` con `wal_level=replica`, `max_wal_senders=3`
- Replica: `postgres-replica` con recovery config apuntando al primary

### `src/infrastructure/workers/ReplicationMonitorWorker.ts`

```typescript
// Mide lag cada 30s usando:
// En primary: SELECT pg_current_wal_lsn();
// En replica: SELECT pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn();
// Lag = EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))

// Escenarios simulados:
// NORMAL_LOAD: lag ~2s (normal)
// MEDIUM_LOAD: lag ~5s (warning)  
// HIGH_LOAD: lag ~20s (critical) — inyectar carga masiva para demostrarlo
```

---

## 🔔 MÓDULO 7: MOTOR DE ALERTAS (OBSERVER PATTERN)

### `src/infrastructure/alerts/AlertEngine.ts`

```typescript
import { EventEmitter } from 'events';
import { AlertRulesConfig } from './AlertRulesConfig';

class AlertEngineClass extends EventEmitter {
  // Carga reglas desde DB al iniciar + permite recarga en caliente
  private rules: AlertRule[] = [];

  async initialize(): Promise<void> {
    this.rules = await AlertRulesRepository.findAllActive();
    console.log(`[AlertEngine] Cargadas ${this.rules.length} reglas`);
  }

  // Recarga sin reiniciar — PUT /api/alerts/rules actualiza esto
  async reloadRules(): Promise<void> {
    this.rules = await AlertRulesRepository.findAllActive();
    console.log(`[AlertEngine] Reglas recargadas en caliente: ${this.rules.length} activas`);
  }

  async evaluate(dbId: number, metrics: TelemetryData): Promise<void> {
    for (const rule of this.rules.filter(r => r.is_active)) {
      const currentValue = metrics[rule.metric as keyof TelemetryData] as number;
      const triggered = this.applyOperator(currentValue, rule.operator, rule.threshold);
      
      if (triggered) {
        const alert = await AlertLogRepository.save({
          db_id: dbId, rule_name: rule.rule_name,
          condition_value: currentValue, threshold_value: rule.threshold,
          severity: rule.severity, status: 'OPEN',
          message: `${rule.rule_name}: valor actual ${currentValue} ${rule.operator} umbral ${rule.threshold}`
        });
        
        // Emitir evento — los observers reaccionan independientemente
        this.emit('alert', alert);
      }
    }
  }

  fireBackupFailed(dbId: number, error: string): void {
    this.emit('alert', { db_id: dbId, severity: 'CRITICAL', rule_name: 'BACKUP_FAILED', message: error });
  }
}

export const AlertEngine = new AlertEngineClass();

// Registrar observers
AlertEngine.on('alert', (alert) => DashboardNotifier.notify(alert));
AlertEngine.on('alert', (alert) => EmailSimulator.send(alert));
AlertEngine.on('alert', (alert) => AlertLogRepository.save(alert));
```

---

## 🎨 MÓDULO FRONTEND: DISEÑO UI/UX OBLIGATORIO

### Tema Visual (Dark Corporate — implementar en `tailwind.config.ts`)

```typescript
// Colors del tema
const theme = {
  // Fondos
  bg: {
    primary: '#0a0e1a',    // Fondo principal casi negro azulado
    surface: '#0f1629',    // Cards y paneles
    elevated: '#141d35',   // Hover states, modales
    border: '#1e2d4a',     // Bordes sutiles
  },
  // Acentos
  accent: {
    cyan: '#00d4ff',       // Acento principal — métricas saludables
    emerald: '#10b981',    // Success, Healthy
    amber: '#f59e0b',      // Warning
    red: '#ef4444',        // Critical, Error
    purple: '#8b5cf6',     // Información, neutral
  },
  // Texto
  text: {
    primary: '#e2e8f0',    // Texto principal
    secondary: '#94a3b8',  // Texto secundario
    muted: '#475569',      // Labels, placeholders
  }
}
```

### Typography (NO usar Inter/Roboto/Arial):
- **Display/Headings**: `JetBrains Mono` — alineado con el contexto DevOps/tech
- **Body/UI**: `IBM Plex Sans` — legible, corporativo sin ser genérico
- Import desde Google Fonts en `index.html`

### ICONOGRAFÍA LUCIDE-REACT — OBLIGATORIA Y EXHAUSTIVA

**REGLA CRÍTICA**: Cada elemento de UI que sea identificable debe tener un ícono de `lucide-react`. No SVGs inline genéricos. No emojis. No íconos de Font Awesome. Solo Lucide React.

Mapa de íconos por módulo (usa EXACTAMENTE estos):

```typescript
// ── SIDEBAR / NAVEGACIÓN ────────────────────────────────────
import {
  LayoutDashboard,    // Dashboard principal
  Database,           // Conexiones
  Activity,           // Métricas en tiempo real
  Search,             // Slow Query Analyzer
  Zap,                // Simulador de concurrencia
  Archive,            // Backup & Recovery
  GitBranch,          // Replicación
  Bell,               // Motor de alertas
  Settings,           // Configuración
  LogOut,             // Cerrar sesión
  ChevronLeft,        // Colapsar sidebar
  ChevronRight,       // Expandir sidebar
} from 'lucide-react';

// ── ESTADOS DE SALUD ────────────────────────────────────────
import {
  CheckCircle2,       // HEALTHY — verde
  AlertTriangle,      // WARNING — amarillo
  XCircle,            // CRITICAL — rojo
  Circle,             // UNKNOWN
  Wifi,               // Conectado
  WifiOff,            // Desconectado
} from 'lucide-react';

// ── MOTORES DE BASE DE DATOS ────────────────────────────────
import {
  Database,           // PostgreSQL (genérico)
  Server,             // SQL Server
  Cylinder,           // Oracle (simulado)
  HardDrive,          // Disco
  Cpu,                // CPU
  MemoryStick,        // RAM/Memoria
  Network,            // Conexiones activas
  Lock,               // Bloqueos
  Unlock,             // Desbloqueo/Resolución
} from 'lucide-react';

// ── MÉTRICAS Y TELEMETRÍA ────────────────────────────────────
import {
  TrendingUp,         // Métrica en ascenso
  TrendingDown,       // Métrica en descenso
  BarChart3,          // Gráficas de barras
  LineChart,          // Gráficas de línea
  Gauge,              // Medidor/Gauge
  Timer,              // Tiempo de respuesta
  Clock,              // Timestamps
  RefreshCw,          // Actualización / polling
  Loader2,            // Loading spinner animado
} from 'lucide-react';

// ── BACKUP Y RECOVERY ────────────────────────────────────────
import {
  Save,               // Guardar / Full backup
  GitCommit,          // Punto de restauración
  GitMerge,           // Árbol FULL→DIFF→INC
  Cloud,              // Upload a nube
  CloudUpload,        // Subiendo a cloud
  CloudCheck,         // Upload completado
  Download,           // Restaurar / Descargar
  FolderArchive,      // Repositorio de backups
  Tag,                // Snapshot label
  ShieldCheck,        // Integridad verificada (hash SHA256)
  Hash,               // Hash MD5/SHA256
  Calendar,           // Programación de backups
  Target,             // RPO/RTO objetivo
} from 'lucide-react';

// ── CONSULTAS Y RENDIMIENTO ─────────────────────────────────
import {
  Zap,                // Fast query
  Clock,              // Medium query
  AlertOctagon,       // Slow query
  Skull,              // Critical query
  FileCode,           // Execution plan
  FlaskConical,       // Test de carga
  Users,              // Usuarios concurrentes
  Swords,             // Deadlock detected
  Sword,              // Deadlock resolved
} from 'lucide-react';

// ── REPLICACIÓN ─────────────────────────────────────────────
import {
  GitBranch,          // Rama primary
  GitPullRequest,     // Sync replicación
  ArrowRightLeft,     // Lag de replicación
  Radio,              // Primary activo
  Satellite,          // Réplica conectada
} from 'lucide-react';

// ── ALERTAS ─────────────────────────────────────────────────
import {
  Bell,               // Alerta genérica
  BellRing,           // Alerta activa
  BellOff,            // Sin alertas
  AlertCircle,        // Warning
  AlertTriangle,      // Critical
  Flame,              // Critical urgente
  Mail,               // Email simulado
  MessageSquare,      // Notificación dashboard
  Siren,              // Alarma roja
} from 'lucide-react';

// ── AUTH Y SEGURIDAD ────────────────────────────────────────
import {
  KeyRound,           // Login
  Lock,               // Contraseña cifrada
  Shield,             // Seguridad / JWT
  Eye,                // Ver contraseña
  EyeOff,             // Ocultar contraseña
  LogIn,              // Login action
  LogOut,             // Logout action
  User,               // Usuario
  UserCheck,          // Admin
} from 'lucide-react';

// ── ACCIONES CRUD ────────────────────────────────────────────
import {
  Plus,               // Crear nuevo
  Pencil,             // Editar
  Trash2,             // Eliminar
  Copy,               // Duplicar
  ExternalLink,       // Ver detalle
  MoreVertical,       // Menú de acciones
  Check,              // Confirmar
  X,                  // Cancelar
  Search,             // Buscar
  Filter,             // Filtrar
  SortAsc,            // Ordenar ascendente
  SortDesc,           // Ordenar descendente
} from 'lucide-react';

// ── CLOUD / INFRAESTRUCTURA ──────────────────────────────────
import {
  CloudCog,           // Configuración cloud
  Boxes,              // Contenedores Docker
  Workflow,           // Pipeline
  Cog,                // Configuración
  ToggleLeft,         // Feature flag off
  ToggleRight,        // Feature flag on
  Terminal,           // Console/logs
} from 'lucide-react';
```

### Componente `StatusCard.tsx` — ejemplo de uso correcto de íconos:

```tsx
import { CheckCircle2, AlertTriangle, XCircle, Database, Cpu, MemoryStick, HardDrive, Network } from 'lucide-react';

type HealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL';

const STATUS_CONFIG = {
  HEALTHY:  { icon: CheckCircle2,   color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', label: 'Saludable' },
  WARNING:  { icon: AlertTriangle,  color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/30',   label: 'Advertencia' },
  CRITICAL: { icon: XCircle,        color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/30',     label: 'Crítico' },
};

export function StatusCard({ connection, metrics }: StatusCardProps) {
  const config = STATUS_CONFIG[connection.health_status];
  const StatusIcon = config.icon;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-5 backdrop-blur-sm transition-all hover:scale-[1.01]`}>
      {/* Header con ícono del motor */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <span className="font-mono text-sm font-semibold text-slate-200">{connection.nombre}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg} ${config.border} border`}>
          <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
          <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
        </div>
      </div>

      {/* Métricas con íconos */}
      <div className="grid grid-cols-2 gap-3">
        <MetricRow icon={Cpu} label="CPU" value={`${metrics.cpu}%`} warn={metrics.cpu > 70} critical={metrics.cpu > 85} />
        <MetricRow icon={MemoryStick} label="RAM" value={`${metrics.memory}%`} warn={metrics.memory > 70} critical={metrics.memory > 85} />
        <MetricRow icon={Network} label="Conexiones" value={metrics.connections} />
        <MetricRow icon={HardDrive} label="Disco" value={`${metrics.disk_usage}MB`} warn={metrics.disk_usage / metrics.disk_total > 0.7} critical={metrics.disk_usage / metrics.disk_total > 0.9} />
      </div>
    </div>
  );
}
```

### Dashboard Layout `AppShell.tsx`:

```tsx
// Layout tipo grid empresarial — NO usar sidebar fijo genérico
// Estructura:
// ┌─────────────────────────────────────────────┐
// │  TopBar: Logo | Breadcrumb | AlertBell | User │
// ├──────────┬──────────────────────────────────┤
// │ Sidebar  │  Main Content Area (scrollable)  │
// │ 240px    │  Grid de 12 columnas responsive  │
// │ colaps.  │                                  │
// └──────────┴──────────────────────────────────┘

// El sidebar muestra íconos + texto. En modo colapsado solo íconos con Tooltip.
// Cada sección del sidebar lleva su ícono de Lucide según el mapa arriba.
// El TopBar tiene:
//   - Logo "DataOps" con ícono <Boxes /> (contenedores)
//   - BreadCrumb con ícono <ChevronRight />
//   - AlertBell con badge rojo de conteo de alertas críticas abiertas
//   - Avatar usuario con <UserCheck /> y menú dropdown
```

### AlertBanner — Flash UI para alertas críticas:

```tsx
// Cuando disco > 90% o CRITICAL: mostrar banner animado en top del viewport
// Usar CSS animation para efecto "flash" rojo
// Incluir ícono <Flame /> + <Siren />
// Debe desaparecer con X (<X /> icon) o auto-dismiss en 30s
```

---

## 🐳 DOCKER COMPOSE COMPLETO

```yaml
# docker-compose.yml
version: '3.9'

networks:
  dataops-net:
    driver: bridge

volumes:
  app-db-data:
  redis-data:
  prometheus-data:
  grafana-data:
  backup-storage:

services:

  # ── BASE DE DATOS PRINCIPAL (Metadatos del sistema) ──────────
  app-db:
    image: postgres:16-alpine
    container_name: dataops-app-db
    environment:
      POSTGRES_DB: dataops_meta
      POSTGRES_USER: dataops_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - app-db-data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/01-init.sql
    ports:
      - "5432:5432"
    networks: [dataops-net]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dataops_admin -d dataops_meta"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ── REDIS (Caché + JWT Blacklist) ─────────────────────────────
  redis-cache:
    image: redis:7-alpine
    container_name: dataops-redis
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    networks: [dataops-net]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # ── POSTGRES TARGET (Motor objetivo principal) ────────────────
  postgres-target:
    image: postgres:16-alpine
    container_name: dataops-postgres-target
    environment:
      POSTGRES_DB: target_db
      POSTGRES_USER: target_admin
      POSTGRES_PASSWORD: ${POSTGRES_TARGET_PASSWORD}
      # Habilitar replicación
      POSTGRES_INITDB_ARGS: "--wal-level=replica"
    command: >
      postgres
        -c wal_level=replica
        -c max_wal_senders=3
        -c max_replication_slots=3
        -c hot_standby=on
        -c shared_preload_libraries='pg_stat_statements'
        -c pg_stat_statements.track=all
    volumes:
      - ./scripts/init-target-postgres.sql:/docker-entrypoint-initdb.d/01-target.sql
    ports:
      - "5433:5432"
    networks: [dataops-net]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U target_admin -d target_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ── POSTGRES REPLICA (Read replica simulada) ──────────────────
  postgres-replica:
    image: postgres:16-alpine
    container_name: dataops-postgres-replica
    environment:
      POSTGRES_DB: target_db
      POSTGRES_USER: target_admin
      POSTGRES_PASSWORD: ${POSTGRES_TARGET_PASSWORD}
      PGUSER: target_admin
      PGPASSWORD: ${POSTGRES_TARGET_PASSWORD}
    command: >
      bash -c "
        until pg_basebackup -h postgres-target -D /var/lib/postgresql/data -U target_admin -vP -W --no-password 2>/dev/null; do
          echo 'Waiting for primary...'
          sleep 2
        done
        touch /var/lib/postgresql/data/standby.signal
        echo 'primary_conninfo = host=postgres-target port=5432 user=target_admin password=${POSTGRES_TARGET_PASSWORD}' >> /var/lib/postgresql/data/postgresql.conf
        postgres
      "
    depends_on:
      postgres-target:
        condition: service_healthy
    ports:
      - "5434:5432"
    networks: [dataops-net]

  # ── SQL SERVER TARGET (Motor objetivo secundario) ─────────────
  mssql-target:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: dataops-mssql-target
    environment:
      ACCEPT_EULA: "Y"
      SA_PASSWORD: ${MSSQL_SA_PASSWORD}
      MSSQL_PID: Developer
    ports:
      - "1433:1433"
    networks: [dataops-net]
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P ${MSSQL_SA_PASSWORD} -Q 'SELECT 1' || exit 1"]
      interval: 15s
      timeout: 10s
      retries: 10

  # ── BACKEND API ────────────────────────────────────────────────
  backend-api:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: dataops-backend
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: app-db
      DB_PORT: 5432
      DB_NAME: dataops_meta
      DB_USER: dataops_admin
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis-cache
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 15m
      REFRESH_TOKEN_SECRET: ${REFRESH_TOKEN_SECRET}
      REFRESH_TOKEN_EXPIRES_IN: 7d
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
      POSTGRES_TARGET_HOST: postgres-target
      POSTGRES_TARGET_PORT: 5432
      MSSQL_TARGET_HOST: mssql-target
      MSSQL_TARGET_PORT: 1433
      MSSQL_SA_PASSWORD: ${MSSQL_SA_PASSWORD}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:-}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY:-}
      AWS_S3_BUCKET: ${AWS_S3_BUCKET:-dataops-backups-dev}
      AWS_REGION: ${AWS_REGION:-us-east-1}
      BACKUP_STORAGE_PATH: /backups
    volumes:
      - backup-storage:/backups
    ports:
      - "3000:3000"
    depends_on:
      app-db:
        condition: service_healthy
      redis-cache:
        condition: service_healthy
    networks: [dataops-net]
    restart: unless-stopped

  # ── FRONTEND APP ───────────────────────────────────────────────
  frontend-app:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: http://localhost:3000
        VITE_WS_URL: ws://localhost:3000
    container_name: dataops-frontend
    ports:
      - "80:80"
    depends_on: [backend-api]
    networks: [dataops-net]
    restart: unless-stopped

  # ── PROMETHEUS ─────────────────────────────────────────────────
  prometheus:
    image: prom/prometheus:latest
    container_name: dataops-prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
      - '--web.enable-lifecycle'        # Permite reload sin reiniciar
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./prometheus/alerts.yml:/etc/prometheus/alerts.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    networks: [dataops-net]

  # ── GRAFANA ────────────────────────────────────────────────────
  grafana:
    build:
      context: ./grafana
      dockerfile: Dockerfile
    container_name: dataops-grafana
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
      GF_INSTALL_PLUGINS: grafana-clock-panel,grafana-simple-json-datasource
      GF_AUTH_ANONYMOUS_ENABLED: "false"
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
      - grafana-data:/var/lib/grafana
    ports:
      - "3001:3000"
    depends_on: [prometheus]
    networks: [dataops-net]
```

### `prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts.yml"

scrape_configs:
  - job_name: 'dataops-backend'
    static_configs:
      - targets: ['backend-api:3000']
    metrics_path: '/metrics'

  - job_name: 'postgres-target'
    static_configs:
      - targets: ['postgres-target:5432']
    
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['backend-api:9100']
```

---

## 📦 PACKAGE.JSON — BACKEND

```json
{
  "name": "dataops-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "build": "tsc",
    "start": "node dist/main.js",
    "migrate": "tsx src/infrastructure/database/runMigrations.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "cookie-parser": "^1.4.6",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "pg": "^8.11.3",
    "ioredis": "^5.3.2",
    "mssql": "^10.0.1",
    "node-cron": "^3.0.3",
    "socket.io": "^4.6.1",
    "prom-client": "^15.1.0",
    "@aws-sdk/client-s3": "^3.450.0",
    "@azure/storage-blob": "^12.17.0",
    "multer": "^1.4.5-lts.1",
    "zod": "^3.22.4",
    "winston": "^3.11.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "typescript": "^5.3.2",
    "tsx": "^4.6.2",
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/pg": "^8.10.9",
    "@types/node-cron": "^3.0.11",
    "@types/cors": "^2.8.17",
    "@types/compression": "^1.7.5",
    "@types/cookie-parser": "^1.4.6",
    "@types/multer": "^1.4.11",
    "@types/mssql": "^9.1.4"
  }
}
```

### `package.json` — FRONTEND

```json
{
  "name": "dataops-frontend",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2",
    "socket.io-client": "^4.6.1",
    "lucide-react": "^0.294.0",
    "recharts": "^2.10.1",
    "react-circular-progressbar": "^2.1.0",
    "date-fns": "^3.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.2",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "vite": "^5.0.7"
  }
}
```

---

## 🔧 DOCKERFILES

### `backend/Dockerfile`:

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache postgresql-client

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
RUN mkdir -p /backups
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### `frontend/Dockerfile`:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ARG VITE_WS_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing — todas las rutas al index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy al backend API
    location /api {
        proxy_pass http://backend-api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket para Socket.IO
    location /socket.io {
        proxy_pass http://backend-api:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

---

## 📝 `.env.example`

```dotenv
# ── BASE DE DATOS ────────────────────────────────────────────
DB_PASSWORD=dataops_secure_pass_2024

# ── JWT ──────────────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_min_64_chars_here_replace_this
REFRESH_TOKEN_SECRET=your_refresh_token_secret_min_64_chars_here_replace_this

# ── CIFRADO AES-256 (32 bytes = 64 chars hex) ─────────────────
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# ── MOTORES OBJETIVO ─────────────────────────────────────────
POSTGRES_TARGET_PASSWORD=target_secure_pass_2024
MSSQL_SA_PASSWORD=DataOps@Strong1234!

# ── GRAFANA ───────────────────────────────────────────────────
GRAFANA_PASSWORD=grafana_admin_2024

# ── AWS S3 (opcional — dejar vacío para modo simulado local) ──
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=dataops-backups-dev
AWS_REGION=us-east-1

# ── AZURE BLOB (opcional — dejar vacío para modo simulado) ────
AZURE_STORAGE_CONNECTION_STRING=
AZURE_STORAGE_CONTAINER=dataops-backups
```

---

## 📋 APIS ENDPOINTS — ESPECIFICACIÓN COMPLETA

```
# AUTH
POST   /api/auth/login
POST   /api/auth/logout              [auth]
POST   /api/auth/refresh
GET    /api/auth/me                  [auth]

# CONNECTIONS (CRUD completo)
GET    /api/connections              [auth] [cache:60s]
POST   /api/connections              [auth]
GET    /api/connections/:id          [auth]
PUT    /api/connections/:id          [auth]
DELETE /api/connections/:id          [auth]
POST   /api/connections/:id/test     [auth]

# METRICS
GET    /api/metrics/dashboard        [auth] [cache:30s]
GET    /api/metrics/:dbId/history    [auth] [cache:30s]
GET    /api/metrics/realtime         [auth] [WebSocket]

# QUERIES
GET    /api/queries                  [auth] [cache:30s]
GET    /api/queries/top-slow         [auth] [cache:30s]
POST   /api/queries/capture/:dbId    [auth]
GET    /api/queries/:id/plan         [auth]

# CONCURRENCY
POST   /api/concurrency/simulate     [auth]
GET    /api/concurrency/logs         [auth]
GET    /api/concurrency/stats        [auth]

# BACKUP
GET    /api/backup/history           [auth] [cache:120s]
POST   /api/backup/full/:dbId        [auth]
POST   /api/backup/diff/:dbId        [auth]
POST   /api/backup/incremental/:dbId [auth]
GET    /api/backup/tree/:dbId        [auth]   # Jerarquía FULL→DIFF→INC
POST   /api/backup/snapshot/:dbId    [auth]   # Body: { label: 'PRE_DEPLOY' }
POST   /api/backup/simulate-disaster [auth]   # DROP TABLE + mide RPO/RTO
POST   /api/backup/restore/:id       [auth]
GET    /api/backup/sla               [auth]   # Dashboard SLA

# REPLICATION
GET    /api/replication/status       [auth] [cache:30s]
GET    /api/replication/lag/history  [auth]
POST   /api/replication/stress/:scenario [auth]  # NORMAL|MEDIUM|HIGH

# ALERTS
GET    /api/alerts                   [auth] [cache:30s]
GET    /api/alerts/open              [auth]
PUT    /api/alerts/:id/acknowledge   [auth]
PUT    /api/alerts/:id/resolve       [auth]
GET    /api/alerts/rules             [auth] [cache:300s]
PUT    /api/alerts/rules             [auth]  # Recarga en caliente — invalida caché

# PROMETHEUS
GET    /metrics                      # Sin auth — Prometheus scraping
GET    /health                       # Health check del servicio
```

---

## 🚀 INSTRUCCIONES DE IMPLEMENTACIÓN PARA CLAUDE CODE

### Orden de implementación (SEGUIR EN ESTE ORDEN EXACTO):

1. **Infraestructura base**: `docker-compose.yml`, `.env.example`, `scripts/init-db.sql`, `scripts/init-target-postgres.sql`

2. **Backend — Core**: `package.json`, `tsconfig.json`, `Dockerfile`

3. **Backend — Domain layer**: Todas las entities e interfaces (sin lógica, solo tipos)

4. **Backend — Infrastructure**:
   - `PostgresConnection.ts` (pool de conexiones al app-db)
   - `AES256Service.ts` (cifrado)
   - `RedisService.ts` (con CACHE HIT/MISS logging)
   - `EngineFactory.ts` + `PostgreSQLEngine.ts` + `SQLServerEngine.ts` + `OracleEngine.ts`

5. **Backend — Application + API**:
   - Auth (Login, Logout, Refresh, Middleware JWT+Blacklist)
   - Connections CRUD
   - HealthCheckWorker (cron cada 60s)
   - Metrics endpoints
   - AlertEngine (Observer) + AlertRules config
   - SlowQuery capture + Cache interceptor
   - Concurrency simulator
   - Backup system (Full, Diff, Inc, Snapshot, Restore, Cloud Upload)
   - Replication monitor
   - Prometheus exporter + Socket.IO server

6. **Frontend — Core**: `package.json`, `vite.config.ts`, `tailwind.config.ts`, `index.html` (con fonts JetBrains Mono + IBM Plex Sans de Google Fonts)

7. **Frontend — Services + Context**: `api.ts` (axios con interceptor Bearer+401), `AuthContext.tsx`, `AlertContext.tsx`

8. **Frontend — Components UI primitivos**: `Badge`, `Card`, `DataTable`, `Modal`, `Spinner`

9. **Frontend — Pages + Feature Components**: Dashboard → Connections → Metrics → Queries → Concurrency → Backup → Replication → Alerts → Settings

10. **Prometheus + Grafana**: configs de provisioning automático

11. **README.md**: Instrucciones completas de setup, variables de entorno, explicación de cada módulo

---

## ✅ CHECKLIST DE VALIDACIÓN OBLIGATORIA

Antes de dar el proyecto por completado, verifica TODOS estos puntos:

### Seguridad:
- [ ] Refresh Tokens en cookies `HttpOnly + Secure + SameSite=Strict`
- [ ] JWT invalidado en Redis al hacer logout (TTL = tiempo restante del token)
- [ ] Credenciales de BD cifradas con AES-256-CBC, NUNCA en texto plano en DB
- [ ] `authMiddleware` aplicado a TODAS las rutas privadas
- [ ] Variables sensibles SOLO en `.env`, nunca hardcodeadas

### Background Workers:
- [ ] HealthCheckWorker ejecuta EXACTAMENTE cada 60 segundos (cron `*/1 * * * *`)
- [ ] BackupSchedulerWorker con Full diario, Diff cada 6h, Inc cada 1h
- [ ] CloudUploadWorker asíncrono y NO bloqueante para las demás operaciones
- [ ] ReplicationMonitorWorker midiendo lag cada 30s

### Cache (Redis):
- [ ] Logs explícitos `[CACHE HIT]` y `[CACHE MISS]` con tiempos en consola
- [ ] TTLs por endpoint: metrics:30s, queries:30s, connections:60s, backups:120s, rules:300s
- [ ] Invalidación dirigida al modificar recursos (no borrado global)

### Backup:
- [ ] Backups FULL reales con `pg_dump` sobre `postgres-target`
- [ ] Hash SHA-256 calculado y guardado en `BACKUP_HISTORY`
- [ ] Cadena jerárquica `FULL → DIFF → INC` con `parent_id` correctamente enlazada
- [ ] Snapshots con labels obligatorios: `PRE_DEPLOY`, `PRE_TEST`, `PRE_IMPORT`
- [ ] Simulador de desastre: `DROP TABLE` + restauración + medición RPO/RTO
- [ ] Cloud upload asíncrono con URL guardada en `BACKUP_HISTORY.cloud_url`

### Concurrencia:
- [ ] Mínimo 100 usuarios concurrentes simulados
- [ ] Detección de deadlocks + resolución automática (kill session)
- [ ] Registro en `TX_LOG` con `lock_type = 'DEADLOCK'` y `resolved = TRUE`

### Replicación:
- [ ] `postgres-replica` configurada como standby real de `postgres-target`
- [ ] Lag medido con `pg_last_xact_replay_timestamp()`
- [ ] Tres escenarios: 2s / 5s / 20s con clasificación HEALTHY/WARNING/CRITICAL

### Alertas:
- [ ] Observer Pattern con EventEmitter (no polling, basado en eventos)
- [ ] Reglas recargables en caliente via `PUT /api/alerts/rules` (sin redeploy)
- [ ] Registro en `ALERT_LOG` con timestamp, condición, motor, estado
- [ ] Socket.IO emite alertas al frontend en tiempo real
- [ ] Todas las 5 reglas mínimas implementadas: CPU>85, Deadlocks>3, BackupFailed, Lag>10s, Disk>90%

### Frontend:
- [ ] ZERO íconos genéricos — 100% Lucide React en toda la UI
- [ ] Fuentes: JetBrains Mono (display) + IBM Plex Sans (body)
- [ ] Tema dark corporate con los colores especificados
- [ ] Interceptor axios: adjunta Bearer Token + redirige a /login en 401
- [ ] Socket.IO conectado para métricas y alertas en tiempo real
- [ ] Dashboard responsivo con grid de 12 columnas

### Docker:
- [ ] `docker compose up --build` levanta TODOS los servicios sin errores
- [ ] Health checks configurados correctamente en todos los servicios
- [ ] Grafana con provisioning automático del datasource Prometheus
- [ ] Volúmenes persistentes para app-db, redis, prometheus, grafana, backups

---

## 📚 README.md (generar completo)

El README debe incluir:
1. Badges de tecnologías usadas
2. Arquitectura (diagrama ASCII del stack)
3. Prerrequisitos (Docker 24+, docker-compose v2, 8GB RAM mínimo)
4. Quick Start: `git clone && cp .env.example .env && docker compose up --build`
5. URLs de acceso: Frontend (80), Backend API (3000), Prometheus (9090), Grafana (3001)
6. Credenciales por defecto para demo
7. Explicación de cada módulo y su endpoint principal
8. Cómo probar cada escenario: health check, backup completo, disaster recovery, concurrencia, replicación lag
9. Diagrama de la cadena de backup FULL→DIFF→INC

---

**FIN DEL PROMPT — Procede a implementar el sistema completo en el orden indicado.**
