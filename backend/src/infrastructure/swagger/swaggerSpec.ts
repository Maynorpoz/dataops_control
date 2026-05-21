import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DataOps Control Center API',
      version: '1.0.0',
      description: 'API REST para el sistema de control y monitoreo de bases de datos DataOps.',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // ── AUTH ──────────────────────────────────────────────────
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'admin' },
            password: { type: 'string', example: 'admin123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id:       { type: 'integer' },
                username: { type: 'string' },
                email:    { type: 'string' },
                role:     { type: 'string' },
              },
            },
          },
        },
        // ── CONNECTIONS ───────────────────────────────────────────
        Connection: {
          type: 'object',
          properties: {
            id:                { type: 'integer' },
            nombre:            { type: 'string' },
            motor:             { type: 'string', enum: ['PostgreSQL', 'SQLServer', 'Oracle'] },
            host:              { type: 'string' },
            port:              { type: 'integer' },
            database_name:     { type: 'string' },
            user_name:         { type: 'string' },
            status:            { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ERROR'] },
            health_status:     { type: 'string', enum: ['HEALTHY', 'WARNING', 'CRITICAL'] },
            last_checked_at:   { type: 'string', format: 'date-time', nullable: true },
            created_at:        { type: 'string', format: 'date-time' },
            updated_at:        { type: 'string', format: 'date-time' },
          },
        },
        ConnectionInput: {
          type: 'object',
          required: ['nombre', 'motor', 'host', 'port', 'database_name', 'user_name', 'password'],
          properties: {
            nombre:        { type: 'string', example: 'Mi Postgres' },
            motor:         { type: 'string', enum: ['PostgreSQL', 'SQLServer', 'Oracle'] },
            host:          { type: 'string', example: 'localhost' },
            port:          { type: 'integer', example: 5432 },
            database_name: { type: 'string', example: 'mydb' },
            user_name:     { type: 'string', example: 'postgres' },
            password:      { type: 'string', example: 'secret' },
          },
        },
        // ── METRICS ───────────────────────────────────────────────
        DbMetric: {
          type: 'object',
          properties: {
            id:            { type: 'integer' },
            db_id:         { type: 'integer' },
            cpu:           { type: 'number' },
            memory:        { type: 'number' },
            connections:   { type: 'integer' },
            locks:         { type: 'integer' },
            deadlocks:     { type: 'integer' },
            disk_usage:    { type: 'number' },
            disk_total:    { type: 'number' },
            health_status: { type: 'string', enum: ['HEALTHY', 'WARNING', 'CRITICAL'] },
            capture_time:  { type: 'string', format: 'date-time' },
          },
        },
        // ── QUERIES ───────────────────────────────────────────────
        QueryLog: {
          type: 'object',
          properties: {
            id:             { type: 'integer' },
            db_id:          { type: 'integer' },
            query_text:     { type: 'string' },
            duration_ms:    { type: 'integer' },
            rows_returned:  { type: 'integer', nullable: true },
            index_used:     { type: 'string', nullable: true },
            execution_plan: { type: 'object', nullable: true },
            classification: { type: 'string', enum: ['FAST', 'MEDIUM', 'SLOW', 'CRITICAL'] },
            created_at:     { type: 'string', format: 'date-time' },
          },
        },
        // ── BACKUP ────────────────────────────────────────────────
        BackupHistory: {
          type: 'object',
          properties: {
            id:               { type: 'integer' },
            db_id:            { type: 'integer' },
            backup_type:      { type: 'string', enum: ['FULL', 'DIFF', 'INC', 'SNAPSHOT'] },
            parent_id:        { type: 'integer', nullable: true },
            snapshot_label:   { type: 'string', enum: ['PRE_DEPLOY', 'PRE_TEST', 'PRE_IMPORT'], nullable: true },
            file_path:        { type: 'string', nullable: true },
            file_size_mb:     { type: 'number', nullable: true },
            file_hash:        { type: 'string', nullable: true },
            duration_seconds: { type: 'integer', nullable: true },
            status:           { type: 'string', enum: ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED'] },
            cloud_url:        { type: 'string', nullable: true },
            rpo_minutes:      { type: 'integer', nullable: true },
            rto_minutes:      { type: 'integer', nullable: true },
            sla_met:          { type: 'boolean', nullable: true },
            created_at:       { type: 'string', format: 'date-time' },
          },
        },
        // ── REPLICATION ───────────────────────────────────────────
        ReplicationLag: {
          type: 'object',
          properties: {
            id:             { type: 'integer' },
            primary_db_id:  { type: 'integer' },
            replica_db_id:  { type: 'integer' },
            lag_seconds:    { type: 'number' },
            scenario:       { type: 'string' },
            health_status:  { type: 'string', enum: ['HEALTHY', 'WARNING', 'CRITICAL'] },
            measured_at:    { type: 'string', format: 'date-time' },
          },
        },
        // ── ALERTS ────────────────────────────────────────────────
        AlertLog: {
          type: 'object',
          properties: {
            id:               { type: 'integer' },
            db_id:            { type: 'integer', nullable: true },
            rule_name:        { type: 'string' },
            condition_value:  { type: 'number', nullable: true },
            threshold_value:  { type: 'number', nullable: true },
            severity:         { type: 'string', enum: ['INFO', 'WARNING', 'CRITICAL'] },
            status:           { type: 'string', enum: ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'] },
            message:          { type: 'string' },
            acknowledged_at:  { type: 'string', format: 'date-time', nullable: true },
            resolved_at:      { type: 'string', format: 'date-time', nullable: true },
            created_at:       { type: 'string', format: 'date-time' },
          },
        },
        AlertRule: {
          type: 'object',
          properties: {
            id:         { type: 'integer' },
            rule_name:  { type: 'string' },
            metric:     { type: 'string' },
            operator:   { type: 'string' },
            threshold:  { type: 'number' },
            severity:   { type: 'string', enum: ['INFO', 'WARNING', 'CRITICAL'] },
            action:     { type: 'string' },
            is_active:  { type: 'boolean' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        // ── CONCURRENCY ───────────────────────────────────────────
        TxLog: {
          type: 'object',
          properties: {
            id:         { type: 'integer' },
            db_id:      { type: 'integer' },
            session_id: { type: 'string' },
            operacion:  { type: 'string', enum: ['INSERT', 'UPDATE', 'DELETE', 'SELECT'] },
            inicio:     { type: 'string', format: 'date-time' },
            fin:        { type: 'string', format: 'date-time', nullable: true },
            wait_time:  { type: 'integer', nullable: true },
            lock_type:  { type: 'string', enum: ['SHARED', 'EXCLUSIVE', 'DEADLOCK', 'TIMEOUT'], nullable: true },
            resolved:   { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      // ── AUTH ────────────────────────────────────────────────────
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Iniciar sesión',
          security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
          responses: {
            200: { description: 'Login exitoso', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
            400: { description: 'Campos requeridos faltantes', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Credenciales inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            429: { description: 'Demasiados intentos de login' },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Cerrar sesión',
          responses: {
            200: { description: 'Sesión cerrada', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          },
        },
      },
      '/api/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Renovar access token usando refresh token (cookie)',
          security: [],
          responses: {
            200: { description: 'Token renovado', content: { 'application/json': { schema: { type: 'object', properties: { accessToken: { type: 'string' } } } } } },
            401: { description: 'Refresh token inválido o expirado' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Obtener usuario autenticado',
          responses: {
            200: { description: 'Datos del usuario', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse/properties/user' } } } },
            401: { description: 'No autorizado' },
          },
        },
      },
      // ── CONNECTIONS ─────────────────────────────────────────────
      '/api/connections': {
        get: {
          tags: ['Connections'],
          summary: 'Listar todas las conexiones',
          responses: {
            200: { description: 'Lista de conexiones', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Connection' } } } } },
          },
        },
        post: {
          tags: ['Connections'],
          summary: 'Crear una nueva conexión',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ConnectionInput' } } } },
          responses: {
            201: { description: 'Conexión creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Connection' } } } },
          },
        },
      },
      '/api/connections/{id}': {
        get: {
          tags: ['Connections'],
          summary: 'Obtener una conexión por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Conexión encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Connection' } } } },
            404: { description: 'No encontrada' },
          },
        },
        put: {
          tags: ['Connections'],
          summary: 'Actualizar una conexión',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ConnectionInput' } } } },
          responses: {
            200: { description: 'Conexión actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Connection' } } } },
          },
        },
        delete: {
          tags: ['Connections'],
          summary: 'Eliminar una conexión',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Eliminada correctamente' },
            404: { description: 'No encontrada' },
          },
        },
      },
      '/api/connections/{id}/test': {
        post: {
          tags: ['Connections'],
          summary: 'Probar conectividad de una conexión',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Resultado del test', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } } },
          },
        },
      },
      // ── METRICS ─────────────────────────────────────────────────
      '/api/metrics/dashboard': {
        get: {
          tags: ['Metrics'],
          summary: 'Obtener métricas del dashboard (todas las conexiones)',
          responses: {
            200: { description: 'Métricas del dashboard', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/DbMetric' } } } } },
          },
        },
      },
      '/api/metrics/{dbId}/history': {
        get: {
          tags: ['Metrics'],
          summary: 'Historial de métricas de una conexión',
          parameters: [
            { name: 'dbId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          ],
          responses: {
            200: { description: 'Historial de métricas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/DbMetric' } } } } },
          },
        },
      },
      // ── QUERIES ─────────────────────────────────────────────────
      '/api/queries': {
        get: {
          tags: ['Queries'],
          summary: 'Listar query logs con paginación',
          parameters: [
            { name: 'page',           in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'pageSize',       in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'classification', in: 'query', schema: { type: 'string', enum: ['FAST', 'MEDIUM', 'SLOW', 'CRITICAL'] } },
          ],
          responses: {
            200: { description: 'Lista de queries', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/QueryLog' } } } } },
          },
        },
      },
      '/api/queries/top-slow': {
        get: {
          tags: ['Queries'],
          summary: 'Top N queries más lentas',
          parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }],
          responses: {
            200: { description: 'Top slow queries', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/QueryLog' } } } } },
          },
        },
      },
      '/api/queries/capture/{dbId}': {
        post: {
          tags: ['Queries'],
          summary: 'Capturar queries activas de una conexión',
          parameters: [{ name: 'dbId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Cantidad de queries capturadas', content: { 'application/json': { schema: { type: 'object', properties: { captured: { type: 'integer' } } } } } },
          },
        },
      },
      '/api/queries/{id}/plan': {
        get: {
          tags: ['Queries'],
          summary: 'Obtener plan de ejecución de una query',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Plan de ejecución', content: { 'application/json': { schema: { type: 'object' } } } },
            404: { description: 'Query no encontrada' },
          },
        },
      },
      // ── CONCURRENCY ─────────────────────────────────────────────
      '/api/concurrency/simulate': {
        post: {
          tags: ['Concurrency'],
          summary: 'Simular carga concurrente en una conexión',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['connectionId'],
                  properties: {
                    connectionId:    { type: 'integer', example: 1 },
                    concurrentUsers: { type: 'integer', default: 100 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Resultado de simulación' },
            400: { description: 'connectionId requerido' },
          },
        },
      },
      '/api/concurrency/logs': {
        get: {
          tags: ['Concurrency'],
          summary: 'Listar logs de transacciones (últimas 200)',
          responses: {
            200: { description: 'Transaction logs', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/TxLog' } } } } },
          },
        },
      },
      '/api/concurrency/stats': {
        get: {
          tags: ['Concurrency'],
          summary: 'Estadísticas de concurrencia',
          responses: {
            200: {
              description: 'Stats',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      total:       { type: 'integer' },
                      deadlocks:   { type: 'integer' },
                      resolved:    { type: 'integer' },
                      avg_wait_ms: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // ── BACKUP ──────────────────────────────────────────────────
      '/api/backup/history': {
        get: {
          tags: ['Backup'],
          summary: 'Historial de backups (últimas 100)',
          responses: {
            200: { description: 'Lista de backups', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/BackupHistory' } } } } },
          },
        },
      },
      '/api/backup/sla': {
        get: {
          tags: ['Backup'],
          summary: 'Métricas SLA de backup (RPO/RTO)',
          responses: {
            200: {
              description: 'SLA metrics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      sla_met:   { type: 'integer' },
                      sla_missed: { type: 'integer' },
                      avg_rpo:   { type: 'number' },
                      avg_rto:   { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/backup/full/{dbId}': {
        post: {
          tags: ['Backup'],
          summary: 'Ejecutar backup FULL',
          parameters: [{ name: 'dbId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Backup iniciado' } },
        },
      },
      '/api/backup/diff/{dbId}': {
        post: {
          tags: ['Backup'],
          summary: 'Ejecutar backup DIFF (diferencial)',
          parameters: [{ name: 'dbId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Backup iniciado' } },
        },
      },
      '/api/backup/incremental/{dbId}': {
        post: {
          tags: ['Backup'],
          summary: 'Ejecutar backup INCREMENTAL',
          parameters: [{ name: 'dbId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Backup iniciado' } },
        },
      },
      '/api/backup/tree/{dbId}': {
        get: {
          tags: ['Backup'],
          summary: 'Árbol jerárquico de backups de una conexión',
          parameters: [{ name: 'dbId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Árbol de backups' } },
        },
      },
      '/api/backup/snapshot/{dbId}': {
        post: {
          tags: ['Backup'],
          summary: 'Crear snapshot con etiqueta',
          parameters: [{ name: 'dbId', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['label'],
                  properties: { label: { type: 'string', enum: ['PRE_DEPLOY', 'PRE_TEST', 'PRE_IMPORT'] } },
                },
              },
            },
          },
          responses: {
            200: { description: 'Snapshot creado' },
            400: { description: 'Label inválido' },
          },
        },
      },
      '/api/backup/simulate-disaster': {
        post: {
          tags: ['Backup'],
          summary: 'Simular escenario de desastre (RPO/RTO)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['connectionId'],
                  properties: { connectionId: { type: 'integer' } },
                },
              },
            },
          },
          responses: {
            200: { description: 'Resultado de simulación de desastre' },
            404: { description: 'Conexión no encontrada' },
          },
        },
      },
      '/api/backup/restore/{id}': {
        post: {
          tags: ['Backup'],
          summary: 'Restaurar un backup por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Restauración iniciada' } },
        },
      },
      // ── REPLICATION ─────────────────────────────────────────────
      '/api/replication/status': {
        get: {
          tags: ['Replication'],
          summary: 'Estado actual de replicación',
          responses: {
            200: { description: 'Estado de replicación', content: { 'application/json': { schema: { $ref: '#/components/schemas/ReplicationLag' } } } },
          },
        },
      },
      '/api/replication/lag/history': {
        get: {
          tags: ['Replication'],
          summary: 'Historial de lag de replicación (últimas 100)',
          responses: {
            200: { description: 'Historial de lag', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ReplicationLag' } } } } },
          },
        },
      },
      '/api/replication/stress/{scenario}': {
        post: {
          tags: ['Replication'],
          summary: 'Simular escenario de carga en replicación',
          parameters: [{
            name: 'scenario',
            in: 'path',
            required: true,
            schema: { type: 'string', enum: ['NORMAL_LOAD', 'MEDIUM_LOAD', 'HIGH_LOAD'] },
          }],
          responses: {
            200: { description: 'Escenario ejecutado' },
            400: { description: 'Escenario inválido' },
          },
        },
      },
      // ── ALERTS ──────────────────────────────────────────────────
      '/api/alerts': {
        get: {
          tags: ['Alerts'],
          summary: 'Listar todas las alertas (últimas 200)',
          responses: {
            200: { description: 'Lista de alertas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/AlertLog' } } } } },
          },
        },
      },
      '/api/alerts/open': {
        get: {
          tags: ['Alerts'],
          summary: 'Listar alertas abiertas',
          responses: {
            200: { description: 'Alertas abiertas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/AlertLog' } } } } },
          },
        },
      },
      '/api/alerts/rules': {
        get: {
          tags: ['Alerts'],
          summary: 'Obtener reglas de alerta',
          responses: {
            200: { description: 'Reglas de alerta', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/AlertRule' } } } } },
          },
        },
        put: {
          tags: ['Alerts'],
          summary: 'Actualizar reglas de alerta (hot-reload)',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/AlertRule' } } } },
          },
          responses: { 200: { description: 'Reglas actualizadas' } },
        },
      },
      '/api/alerts/{id}/acknowledge': {
        put: {
          tags: ['Alerts'],
          summary: 'Marcar alerta como reconocida',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Alerta reconocida' } },
        },
      },
      '/api/alerts/{id}/resolve': {
        put: {
          tags: ['Alerts'],
          summary: 'Marcar alerta como resuelta',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Alerta resuelta' } },
        },
      },
      // ── HEALTH ──────────────────────────────────────────────────
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check del sistema',
          security: [],
          responses: {
            200: {
              description: 'Sistema saludable',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status:    { type: 'string', example: 'ok' },
                      timestamp: { type: 'string', format: 'date-time' },
                      database:  { type: 'string', example: 'ok' },
                      redis:     { type: 'string', example: 'ok' },
                    },
                  },
                },
              },
            },
            503: { description: 'Algún servicio no disponible' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
