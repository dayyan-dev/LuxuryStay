/**
 * ============================================================
 * MongoDB BACKUP SCRIPT — mongodump based
 * ============================================================
 * Manual use:
 *   node scripts/backupDb.js
 *
 * Scheduled use (see cron/backupJob.js):
 *   Runs daily at 02:00 when BACKUP_ENABLED=true.
 *
 * Environment variables:
 *   MONGO_URI / MONGODB_URI  — connection string (required)
 *   BACKUP_DIR               — where dumps go (default: <repo>/backups, gitignored)
 *   BACKUP_RETENTION_DAYS    — delete dumps older than N days (default: 7)
 *
 * Restoration (see docs/BACKUP_RESTORE.md):
 *   mongorestore --uri="<MONGO_URI>" --drop --nsInclude="dbname.*" <dump-dir>/<dbname>
 *
 * NOTE: On managed hosts (Render/Heroku) there is no persistent disk
 * guarantee — use Atlas continuous backups for production, and keep this
 * script for on-demand/manual dumps.
 * ============================================================
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '7', 10);
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', '..', 'backups');

if (!MONGO_URI) {
  console.error('[BACKUP] ERROR: MONGO_URI / MONGODB_URI is not set. Aborting.');
  process.exit(1);
}

// Never log credentials — mask password in any output
const maskedUri = MONGO_URI.replace(/:\/\/([^:]+):[^@]+@/, '://$1:****@');

const extractDbName = () => {
  try {
    const u = new URL(MONGO_URI.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://'));
    return (u.pathname || '/').replace(/^\//, '').split('?')[0] || 'hotel_db';
  } catch {
    return 'hotel_db';
  }
};

const runBackup = () => {
  const dbName = extractDbName();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetDir = path.join(BACKUP_DIR, `${dbName}_${stamp}`);

  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  console.log(`[BACKUP] Starting mongodump of "${dbName}" → ${targetDir}`);

  try {
    execSync(`mongodump --uri="${MONGO_URI}" --db="${dbName}" --out="${targetDir}"`, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    console.log(`[BACKUP] SUCCESS: ${targetDir}`);

    // Retention: prune old dumps
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    for (const dir of fs.readdirSync(BACKUP_DIR)) {
      const full = path.join(BACKUP_DIR, dir);
      const dirTime = fs.statSync(full).mtimeMs;
      if (dirTime < cutoff) {
        fs.rmSync(full, { recursive: true, force: true });
        console.log(`[BACKUP] Pruned old dump: ${dir}`);
      }
    }
    return targetDir;
  } catch (err) {
    console.error('[BACKUP] FAILED:', err.message);
    process.exitCode = 1;
    return null;
  }
};

if (require.main === module) runBackup();
module.exports = { runBackup };
