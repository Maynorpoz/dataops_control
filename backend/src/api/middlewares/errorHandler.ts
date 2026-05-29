import { Request, Response, NextFunction } from 'express';

// Map PostgreSQL error codes to safe, user-friendly messages
const PG_CODES: Record<string, string> = {
  '23503': 'No se puede eliminar el registro porque existen dependencias asociadas.',
  '23505': 'Ya existe un registro con ese valor. Verifica los campos únicos.',
  '23502': 'Un campo obligatorio está vacío. Revisa los datos enviados.',
  '42P01': 'La tabla o recurso solicitado no existe en la base de datos.',
  '42703': 'Columna no encontrada. Verifica el nombre del campo.',
  '40P01': 'Deadlock detectado y resuelto automáticamente por el motor.',
  '08003': 'La conexión con la base de datos está cerrada.',
  '08006': 'Fallo en la conexión remota con el servidor de base de datos.',
  '28P01': 'Credenciales de autenticación inválidas para la base de datos externa.',
  '3D000': 'La base de datos especificada no existe en el servidor remoto.',
  'ECONNREFUSED': 'No se pudo conectar con el servidor de base de datos externo.',
  'ETIMEDOUT':    'Tiempo de espera agotado al conectar con el servidor externo.',
};

// Oracle thin mode error codes
const ORACLE_ERRORS: Record<number, string> = {
  1017: 'Credenciales de Oracle inválidas (usuario o contraseña incorrectos).',
  12541: 'No hay listener disponible en el host Oracle especificado.',
  12505: 'El SERVICE_NAME especificado no existe en Oracle.',
  1033: 'Oracle se está iniciando — intenta más tarde.',
};

function sanitizeMessage(err: any): string {
  // PostgreSQL errors
  const pgCode = err.code as string;
  if (pgCode && PG_CODES[pgCode]) return PG_CODES[pgCode];

  // Oracle errors (oracledb wraps them with errorNum)
  const oraNum = err.errorNum as number;
  if (oraNum && ORACLE_ERRORS[oraNum]) return ORACLE_ERRORS[oraNum];

  // Node.js network errors
  if (err.code === 'ECONNREFUSED') return PG_CODES['ECONNREFUSED'];
  if (err.code === 'ETIMEDOUT')    return PG_CODES['ETIMEDOUT'];

  // Validation / business logic errors (explicitly thrown with status < 500)
  const status = err.status || 500;
  if (status === 404) return 'Recurso no encontrado.';
  if (status === 400) return err.message || 'Datos de entrada inválidos.';
  if (status === 401) return 'No autorizado. Inicia sesión nuevamente.';
  if (status === 403) return 'No tienes permisos para realizar esta acción.';

  // Generic 500 — never expose internal details
  return 'Error interno del servidor. Revisa los logs del sistema para más detalles.';
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = (err as any).status || 500;
  const pgCode = (err as any).code;

  console.error(`[Error] ${req.method} ${req.path}: [${pgCode || status}] ${err.message}`);

  res.status(status).json({
    error: sanitizeMessage(err),
    code:  pgCode || undefined,
    path:  req.path,
    timestamp: new Date().toISOString(),
  });
}
