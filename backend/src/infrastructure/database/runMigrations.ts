import fs from 'fs';
import path from 'path';
import { query } from './PostgresConnection';

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(100) PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  for (const file of files) {
    const version = file.replace('.sql', '');
    const applied = await query('SELECT version FROM schema_migrations WHERE version = $1', [version]);
    if (applied.length > 0) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await query(sql);
    await query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
    console.log(`[Migration] Applied: ${version}`);
  }

  console.log('[Migration] All migrations applied.');
}

runMigrations().catch((err) => {
  console.error('[Migration] Error:', err);
  process.exit(1);
});
