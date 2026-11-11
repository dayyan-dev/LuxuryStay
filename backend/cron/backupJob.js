/**
 * Daily automated MongoDB backup (02:00) via mongodump.
 * Only runs when BACKUP_ENABLED=true is set in the environment —
 * on hosts without mongodump or a persistent disk (e.g. Render free
 * tier) leave it unset and rely on Atlas continuous backups instead.
 */
const cron = require('node-cron');

let running = false;

const start = () => {
  if (process.env.BACKUP_ENABLED !== 'true' || process.env.NODE_ENV !== 'production') {
    console.log('[BACKUP-CRON] Disabled (set BACKUP_ENABLED=true with NODE_ENV=production to enable).');
    return;
  }
  if (!cron.validate('0 2 * * *')) {
    console.error('[BACKUP-CRON] Invalid schedule, job not started.');
    return;
  }
  cron.schedule('0 2 * * *', async () => {
    if (running) return;
    running = true;
    try {
      const { runBackup } = require('../scripts/backupDb');
      runBackup();
    } catch (err) {
      console.error('[BACKUP-CRON] Backup failed:', err.message);
    } finally {
      running = false;
    }
  });
  console.log('[BACKUP-CRON] Daily mongodump scheduled at 02:00.');
};

module.exports = { start };
