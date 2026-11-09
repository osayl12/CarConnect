#!/usr/bin/env bash
# Weekly MongoDB backup for the Oracle VM. Dumps the database in MONGO_URI
# (from backend/.env) to a gzipped archive and keeps only the newest 4.
#
# Runs mongodump inside the official mongo Docker image, so nothing extra
# has to be installed on the VM.
#
# Cron (crontab -e), every Sunday at 03:00:
#   0 3 * * 0 bash $HOME/carconnect/scripts/backup-mongo.sh >> $HOME/mongo-backups/backup.log 2>&1
#
# Restore a backup (careful: --drop replaces the existing collections):
#   docker run --rm -i mongo:8.0 mongorestore --uri="<MONGO_URI>" --archive --gzip --drop < FILE

set -euo pipefail

ENV_FILE="${ENV_FILE:-$HOME/carconnect/backend/.env}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/mongo-backups}"
KEEP=4
IMAGE="mongo:8.0"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

# Only one backup at a time.
exec 9>"$BACKUP_DIR/.lock"
flock -n 9 || { log "Another backup is already running, skipping."; exit 1; }

# Read MONGO_URI without sourcing the file (the URI contains & and ? which
# the shell would misread). Strips optional quotes and Windows line endings.
MONGO_URI="$(grep -m1 '^MONGO_URI=' "$ENV_FILE" | cut -d= -f2- | tr -d '\r' | sed -E 's/^["'\'']//; s/["'\'']$//')"
if [ -z "$MONGO_URI" ]; then
  log "MONGO_URI not found in $ENV_FILE"
  exit 1
fi

# Hand the URI to mongodump through a private config file, so the password
# never appears in the process list or in this log.
CONFIG="$(mktemp)"
PARTIAL="$BACKUP_DIR/.in-progress.archive.gz"
trap 'rm -f "$CONFIG" "$PARTIAL"' EXIT
chmod 600 "$CONFIG"
printf 'uri: "%s"\n' "$MONGO_URI" > "$CONFIG"

STAMP="$(date '+%Y-%m-%d_%H%M')"
TARGET="$BACKUP_DIR/carconnect-$STAMP.archive.gz"

log "Starting backup -> $TARGET"
docker run --rm \
  --user "$(id -u):$(id -g)" \
  -v "$CONFIG:/tmp/mongodump.yml:ro" \
  "$IMAGE" \
  mongodump --config=/tmp/mongodump.yml --archive --gzip > "$PARTIAL"

if [ ! -s "$PARTIAL" ]; then
  log "Backup file is empty, keeping old backups untouched."
  exit 1
fi

mv "$PARTIAL" "$TARGET"
chmod 600 "$TARGET"
log "Backup finished ($(du -h "$TARGET" | cut -f1))."

# Delete everything except the newest $KEEP backups. Only reached when the
# new backup succeeded, so a failing week never eats the old ones.
ls -1t "$BACKUP_DIR"/carconnect-*.archive.gz | tail -n +$((KEEP + 1)) | while read -r old; do
  log "Removing old backup $old"
  rm -f -- "$old"
done

log "Done. Backups kept: $(ls -1 "$BACKUP_DIR"/carconnect-*.archive.gz | wc -l)"
