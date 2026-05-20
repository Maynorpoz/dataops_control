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
    encrypted_password TEXT NOT NULL,
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
    cpu             DECIMAL(5,2),
    memory          DECIMAL(5,2),
    connections     INTEGER,
    locks           INTEGER,
    deadlocks       INTEGER DEFAULT 0,
    disk_usage      DECIMAL(10,2),
    disk_total      DECIMAL(10,2),
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
    wait_time   INTEGER,
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
    parent_id       BIGINT REFERENCES backup_history(id),
    snapshot_label  snapshot_label,
    file_path       VARCHAR(500),
    file_size_mb    DECIMAL(10,2),
    file_hash       VARCHAR(128),
    duration_seconds INTEGER,
    status          backup_status DEFAULT 'PENDING',
    cloud_url       TEXT,
    restore_point   TIMESTAMPTZ,
    error_message   TEXT,
    rpo_minutes     INTEGER,
    rto_minutes     INTEGER,
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
    scenario        VARCHAR(50),
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

-- ─── ALERT_RULES ────────────────────────────────────────────
CREATE TABLE alert_rules (
    id              SERIAL PRIMARY KEY,
    rule_name       VARCHAR(100) UNIQUE NOT NULL,
    metric          VARCHAR(50) NOT NULL,
    operator        VARCHAR(10) NOT NULL,
    threshold       DECIMAL(10,2) NOT NULL,
    severity        alert_severity NOT NULL,
    action          VARCHAR(50) NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SEED: USUARIOS ─────────────────────────────────────────
-- Password: admin123 (bcrypt hash)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@dataops.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oDeOqSv1e', 'admin');

-- ─── SEED: REGLAS DE ALERTA ─────────────────────────────────
INSERT INTO alert_rules (rule_name, metric, operator, threshold, severity, action) VALUES
('CPU_HIGH',         'cpu',          '>',  85.0,  'WARNING',  'EMAIL'),
('DEADLOCK_CRITICAL','deadlocks',    '>',  3,     'CRITICAL', 'DASHBOARD'),
('DISK_CRITICAL',    'disk_usage',   '>',  90.0,  'CRITICAL', 'FLASH_UI'),
('REPLICATION_LAG',  'lag_seconds',  '>',  10.0,  'WARNING',  'DASHBOARD'),
('CONN_OVERLOAD',    'connections',  '>',  100,   'WARNING',  'DASHBOARD');
