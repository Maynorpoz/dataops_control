# DataOps Control Center

![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?logo=nodedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

Plataforma empresarial de monitoreo, gestión y recuperación inteligente de bases de datos.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE                       │
├─────────────┬──────────────┬────────────────────────────┤
│  Frontend   │  Backend API │  Bases de Datos            │
│  React 18   │  Node.js 20  │  app-db (PostgreSQL 16)    │
│  Vite       │  Express     │  redis-cache (Redis 7)     │
│  Tailwind   │  Socket.IO   │  postgres-target           │
│  Lucide     │  TypeScript  │  postgres-replica          │
│  port: 80   │  port: 3000  │  mssql-target              │
├─────────────┴──────────────┴────────────────────────────┤
│  Monitoring: Prometheus (9090) + Grafana (3001)         │
└─────────────────────────────────────────────────────────┘
```

### Cadena de Backup FULL → DIFF → INC

```
[FULL] ─────────────────────────────── parent_id: NULL
    └── [DIFF] ──────────────────────── parent_id: FULL.id
            ├── [INC] ─────────────── parent_id: DIFF.id
            ├── [INC] ─────────────── parent_id: DIFF.id
            └── [INC] ─────────────── parent_id: DIFF.id
[SNAPSHOT:PRE_DEPLOY] ──────────────── parent_id: NULL
```

---

## Prerrequisitos

- Docker Engine 24+
- Docker Compose v2
- 8 GB RAM mínimo
- 10 GB espacio en disco

---

## Quick Start

```bash
git clone <repo>
cd dataops_control
cp .env.example .env
docker compose up --build
```

El sistema tardará ~2-3 minutos en inicializar todas las dependencias.

---

## URLs de acceso

| Servicio     | URL                         | Credenciales         |
|--------------|-----------------------------|----------------------|
| Frontend     | http://localhost             | admin / admin123     |
| Backend API  | http://localhost:3000        | Bearer token JWT     |
| Prometheus   | http://localhost:9090        | —                    |
| Grafana      | http://localhost:3001        | admin / (GRAFANA_PASSWORD) |

---

## Variables de entorno

Copia `.env.example` a `.env` y configura:

| Variable           | Descripción                               |
|--------------------|-------------------------------------------|
| `DB_PASSWORD`      | Contraseña del app-db                     |
| `JWT_SECRET`       | Secreto JWT (mín. 64 chars)               |
| `REFRESH_TOKEN_SECRET` | Secreto refresh token               |
| `ENCRYPTION_KEY`   | Clave AES-256 (64 chars hex = 32 bytes)   |
| `POSTGRES_TARGET_PASSWORD` | Password del motor objetivo      |
| `MSSQL_SA_PASSWORD` | Password SA de SQL Server               |
| `GRAFANA_PASSWORD` | Password admin de Grafana                 |
| `AWS_ACCESS_KEY_ID` | Opcional — S3 cloud upload              |

---

## Módulos del sistema

### 1. Autenticación y Seguridad
- JWT Access Token (15min) + Refresh Token en cookie HttpOnly (7d)
- Blacklist en Redis al hacer logout
- Credenciales cifradas con AES-256-CBC en la BD

**Endpoint principal:** `POST /api/auth/login`

### 2. Gestión de Conexiones
- CRUD completo de conexiones a PostgreSQL, SQL Server y Oracle
- Test de conectividad en tiempo real
- Health check automático cada 60 segundos

**Endpoint principal:** `GET /api/connections`

### 3. Slow Query Analyzer
- Captura y clasifica queries: FAST / MEDIUM / SLOW / CRITICAL
- Top-10 queries más lentas con caché Redis (TTL 30s)
- Visualización de planes de ejecución

**Endpoint principal:** `GET /api/queries/top-slow`

### 4. Simulador de Concurrencia Extrema
- Simula ≥100 usuarios concurrentes con operaciones mixtas
- Detección y resolución automática de deadlocks
- Registro en TX_LOG con lock_type = 'DEADLOCK'

**Endpoint principal:** `POST /api/concurrency/simulate`

### 5. Backup & Recovery
- Backups FULL reales con `pg_dump` sobre postgres-target
- Cadena jerárquica FULL → DIFF → INC con parent_id
- Snapshots: PRE_DEPLOY, PRE_TEST, PRE_IMPORT
- Simulador de desastre: DROP TABLE + medición RPO/RTO
- Cloud upload asíncrono a S3 (o simulado si no hay credenciales)
- Hash SHA-256 verificado

**Endpoint principal:** `POST /api/backup/full/:dbId`

### 6. Replicación Distribuida
- postgres-replica como standby real de postgres-target
- Lag medido con pg_last_xact_replay_timestamp()
- Escenarios: NORMAL_LOAD (~2s) / MEDIUM_LOAD (~5s) / HIGH_LOAD (~20s)

**Endpoint principal:** `GET /api/replication/status`

### 7. Motor de Alertas (Observer Pattern)
- EventEmitter con 3 observers: DashboardNotifier, EmailSimulator, AlertLogRepository
- Reglas recargables en caliente via `PUT /api/alerts/rules` (sin redeploy)
- 5 reglas base: CPU>85%, Deadlocks>3, BackupFailed, Lag>10s, Connections>100
- Flash UI en frontend para alertas CRITICAL

**Endpoint principal:** `PUT /api/alerts/rules`

---

## Cómo probar cada escenario

### Health Check
```bash
# El HealthCheckWorker corre cada 60s automáticamente
# Para verificar manualmente:
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/metrics/dashboard
```

### Backup completo + verificación
```bash
# 1. Crear snapshot PRE_DEPLOY
curl -X POST http://localhost:3000/api/backup/snapshot/1 \
  -H "Authorization: Bearer <token>" \
  -d '{"label":"PRE_DEPLOY"}'

# 2. Simular desastre
curl -X POST http://localhost:3000/api/backup/simulate-disaster \
  -H "Authorization: Bearer <token>" \
  -d '{"connectionId":1}'

# 3. Restaurar desde snapshot (RTO medido)
curl -X POST http://localhost:3000/api/backup/restore/<backup_id> \
  -H "Authorization: Bearer <token>"
```

### Concurrencia + Deadlocks
```bash
curl -X POST http://localhost:3000/api/concurrency/simulate \
  -H "Authorization: Bearer <token>" \
  -d '{"connectionId":1,"concurrentUsers":200}'
```

### Lag de replicación
```bash
# Escenario de alta carga
curl -X POST http://localhost:3000/api/replication/stress/HIGH_LOAD \
  -H "Authorization: Bearer <token>"
```

### Alertas en tiempo real
```bash
# Actualizar regla en caliente (sin reiniciar)
curl -X PUT http://localhost:3000/api/alerts/rules \
  -H "Authorization: Bearer <token>" \
  -d '[{"rule_name":"CPU_HIGH","threshold":50}]'
```

---

## Cache TTL Policy

| Endpoint             | TTL      |
|----------------------|----------|
| Dashboard metrics    | 30s      |
| Slow queries top-10  | 30s      |
| Connection list      | 60s      |
| Backup history       | 120s     |
| Alert rules          | 300s     |

Los logs `[CACHE HIT]` y `[CACHE MISS]` son visibles en los logs del backend.

---

## Patrones de diseño implementados

- **Strategy Pattern**: `IDatabaseEngine` — cada motor (PostgreSQL, SQLServer, Oracle) como estrategia intercambiable
- **Observer Pattern**: `AlertEngine extends EventEmitter` — observers registrados: DashboardNotifier, EmailSimulator, AlertLogRepository
- **Factory Pattern**: `EngineFactory.create()` — retorna la estrategia correcta según el motor configurado
- **Repository Pattern**: Acceso a datos encapsulado en casos de uso
- **Container/Presenter**: Páginas (lógica) vs Componentes (UI pura)
