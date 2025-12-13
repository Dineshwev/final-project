/**
 * 🗄️ DATABASE INITIALIZATION
 * 
 * Sets up PostgreSQL database for scan persistence
 * Creates schema, tables, indexes, triggers, and views
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import dbRepository from './repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  console.log('🗄️ Initializing database schema...');

  try {
    // Read schema file
    const schemaPath = join(__dirname, 'schema.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Executing ${statements.length} SQL statements...`);

    for (const statement of statements) {
      try {
        await dbRepository.pool.query(statement);
      } catch (error) {
        // Ignore "already exists" errors for CREATE statements
        if (!error.message.includes('already exists')) {
          console.error(`❌ Failed to execute statement: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
    }

    console.log('✅ Database schema initialized successfully!');

    // Test database health
    const health = await dbRepository.healthCheck();
    console.log('🏥 Database health check:', health);

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await dbRepository.close();
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database initialization failed:', error);
      process.exit(1);
    });
}

export default initializeDatabase;