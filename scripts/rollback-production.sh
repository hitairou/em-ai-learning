#!/usr/bin/env bash
set -Eeuo pipefail

BACKUP_DIR="${1:?Usage: rollback-production.sh /absolute/path/to/backup-directory}"
CONTAINER_NAME="${CONTAINER_NAME:-em-ai-learning}"
DATA_VOLUME="${DATA_VOLUME:-em-ai-learning-data}"
HOST_PORT="${HOST_PORT:-3010}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"
PUBLIC_URL="${PUBLIC_URL:-https://edesign.tairoh.com}"
AUTH_SECRET="${AUTH_SECRET:?AUTH_SECRET is required}"
OPENAI_API_KEY="${OPENAI_API_KEY:?OPENAI_API_KEY is required}"

if [ "${#AUTH_SECRET}" -lt 32 ]; then
  echo "ERROR: AUTH_SECRET must contain at least 32 characters." >&2
  exit 1
fi
if [ ! -d "$BACKUP_DIR" ]; then
  echo "ERROR: backup directory does not exist." >&2
  exit 1
fi
if ! docker volume inspect "$DATA_VOLUME" >/dev/null 2>&1; then
  echo "ERROR: production volume $DATA_VOLUME does not exist." >&2
  exit 1
fi

ARCHIVE_PATH="$(find "$BACKUP_DIR" -maxdepth 1 -type f -name 'em-ai-learning-before-834-*.tar.gz' -print -quit)"
OLD_IMAGE_ID="$(cat "${BACKUP_DIR}/old-image-id.txt")"
OLD_IMAGE_REFERENCE="$(cat "${BACKUP_DIR}/old-image-reference.txt")"
if [ -z "$ARCHIVE_PATH" ] || [ ! -s "$ARCHIVE_PATH" ]; then
  echo "ERROR: backup archive is missing or empty." >&2
  exit 1
fi
tar -tzf "$ARCHIVE_PATH" >/dev/null
tar -tzf "$ARCHIVE_PATH" | grep -qx './prod.db'
tar -tzf "$ARCHIVE_PATH" | grep -qx './uploads/'
if ! docker image inspect "$OLD_IMAGE_ID" >/dev/null 2>&1; then
  echo "ERROR: exact old image ID is not available locally: $OLD_IMAGE_ID" >&2
  exit 1
fi

ARCHIVE_NAME="$(basename "$ARCHIVE_PATH")"
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker run --rm --user 0:0 \
  -v "${DATA_VOLUME}:/data" \
  -v "${BACKUP_DIR}:/backup:ro" \
  --entrypoint sh "$OLD_IMAGE_ID" \
  -c "find /data -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + && tar -C /data -xzf /backup/${ARCHIVE_NAME}"

docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p "127.0.0.1:${HOST_PORT}:${CONTAINER_PORT}" \
  -e NODE_ENV=production \
  -e DATABASE_URL=file:/data/prod.db \
  -e UPLOAD_DIR=/data/uploads \
  -e AUTH_SECRET="$AUTH_SECRET" \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -e SEED_ON_START=false \
  -e SEED_TEST_USERS=false \
  -v "${DATA_VOLUME}:/data" \
  "$OLD_IMAGE_ID" >/dev/null

for _ in $(seq 1 30); do
  if curl -fsS --max-time 5 "http://127.0.0.1:${HOST_PORT}" >/dev/null 2>&1; then
    curl -fsS --max-time 20 "$PUBLIC_URL" >/dev/null
    echo "ROLLBACK_RESULT status=success backup=${ARCHIVE_PATH} restored_image=${OLD_IMAGE_REFERENCE} restored_image_id=${OLD_IMAGE_ID}"
    exit 0
  fi
  sleep 2
done

docker logs --tail 200 "$CONTAINER_NAME" || true
echo "ROLLBACK_RESULT status=failed backup=${ARCHIVE_PATH} restored_image=${OLD_IMAGE_REFERENCE}" >&2
exit 1
