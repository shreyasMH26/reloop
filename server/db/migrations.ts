import { Pool, PoolClient } from 'pg';
import fs from 'fs';
import path from 'path';

export interface Migration {
  id: number;
  name: string;
  run: (client: PoolClient) => Promise<void>;
}

export async function runMigrations(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const { rows } = await client.query('SELECT version FROM schema_migrations ORDER BY version ASC');
    const appliedVersions = new Set(rows.map((r) => r.version));

    // Migration 1: Base Relational Schema
    if (!appliedVersions.has(1)) {
      console.log('🔄 [ReLoop Migration] Applying migration 001_base_schema.sql...');
      const schemaSqlPath = path.resolve(process.cwd(), 'server/db/schema.sql');
      const schemaSql = fs.readFileSync(schemaSqlPath, 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(schemaSql);
        await client.query('INSERT INTO schema_migrations (version, name) VALUES ($1, $2)', [
          1,
          '001_base_schema',
        ]);
        await client.query('COMMIT');
        console.log('✅ [ReLoop Migration] 001_base_schema applied successfully.');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    } else {
      console.log('✨ [ReLoop DB] PostgreSQL schema is up to date (version 1).');
    }
  } finally {
    client.release();
  }
}
