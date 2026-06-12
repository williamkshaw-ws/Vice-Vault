#!/bin/bash

# Create backups directory if it doesn't exist
mkdir -p backups

# Find the most recently modified backup to determine the next index (0-9)
LATEST=$(ls -1t backups/backup-[0-9].zip 2>/dev/null | head -n 1)

if [ -z "$LATEST" ]; then
    NEXT_INDEX=0
else
    # Extract the number from the filename (e.g. backups/backup-4.zip -> 4)
    CURRENT_INDEX=$(echo "$LATEST" | sed -n 's/.*backup-\([0-9]\)\.zip/\1/p')
    NEXT_INDEX=$(( (CURRENT_INDEX + 1) % 10 ))
fi

TARGET="backups/backup-${NEXT_INDEX}.zip"

echo "Creating rolling backup: $TARGET..."

# Remove existing one if it exists to cleanly overwrite it
rm -f "$TARGET"

# Zip the project, excluding dependencies, git, build artifacts, env, and existing backups
zip -q -r "$TARGET" . \
  -x "*/node_modules/*" \
  -x "*/.git/*" \
  -x "*/dist/*" \
  -x "*/backups/*" \
  -x ".env" \
  -x "service-account.json" \
  -x "data/users.json" \
  -x "data/users_data/*" \
  -x "Vice-Vault-Backup-*.zip"

if [ $? -eq 0 ]; then
  echo "✅ Backup successfully created at: $TARGET"
  echo "Oldest backup in the rotation was overwritten (if index looped)."
else
  echo "❌ Backup failed."
  exit 1
fi
