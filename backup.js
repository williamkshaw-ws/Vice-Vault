const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const backupsDir = path.join(__dirname, 'backups');

if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFilename = `backup-${timestamp}.tar.gz`;
const backupPath = path.join(backupsDir, backupFilename);

console.log(`Creating backup: ${backupFilename}...`);

try {
  // Create a tarball of the project directory, excluding node_modules, .git, dist, and the backups folder itself
  const command = `tar -czf ${backupPath} --exclude='node_modules' --exclude='.git' --exclude='dist' --exclude='.env' --exclude='backups' .`;
  execSync(command, { stdio: 'inherit' });
  console.log(`✅ Backup successfully created at: ${backupPath}`);
} catch (error) {
  console.error(`❌ Backup failed:`, error.message);
  process.exit(1);
}
