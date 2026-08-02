#!/usr/bin/env bash
set -Eeuo pipefail

BACKUP_DIR="${1:?Usage: rollback-production.sh /absolute/path/to/backup-directory}"
CONTAINER_NAME="${CONTAINER_NAME:-em-ai-learning}"
DATA_VOLUME="${DATA_VOLUME:-em-ai-learning-data}"
HOST_PORT="${HOST_PORT:-3010}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"
PUBLIC_URL="${PUBLIC_URL:-https://edesign.tairoh.com}"
AUTH_SECRET="${AUTH_SECRET:-}"
OPENAI_API_KEY="${OPENAI_API_KEY:-}"
MAILGUN_API_KEY="${MAILGUN_API_KEY:-}"
EMAIL_VERIFICATION_SECRET="${EMAIL_VERIFICATION_SECRET:-}"
MAILGUN_DOMAIN="${MAILGUN_DOMAIN:-auth.tairoh.com}"
MAILGUN_API_URL="${MAILGUN_API_URL:-https://api.mailgun.net}"
EMAIL_FROM_ADDRESS="${EMAIL_FROM_ADDRESS:-no-reply@auth.tairoh.com}"
EMAIL_FROM_NAME="${EMAIL_FROM_NAME:-EM PASS}"
EMAIL_REPLY_TO="${EMAIL_REPLY_TO:-support@tairoh.com}"
EMAIL_DELIVERY_MODE="${EMAIL_DELIVERY_MODE:-mailgun}"
EMAIL_CODE_TTL_MINUTES="${EMAIL_CODE_TTL_MINUTES:-10}"
EMAIL_RESEND_COOLDOWN_SECONDS="${EMAIL_RESEND_COOLDOWN_SECONDS:-60}"
EMAIL_MAX_ATTEMPTS="${EMAIL_MAX_ATTEMPTS:-5}"
EMAIL_MAX_SENDS_PER_HOUR="${EMAIL_MAX_SENDS_PER_HOUR:-5}"
PENDING_REGISTRATION_TTL_HOURS="${PENDING_REGISTRATION_TTL_HOURS:-24}"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "ERROR: backup directory does not exist." >&2
  exit 1
fi
if ! docker volume inspect "$DATA_VOLUME" >/dev/null 2>&1; then
  echo "ERROR: production volume $DATA_VOLUME does not exist." >&2
  exit 1
fi
if ! command -v openssl >/dev/null; then
  echo "ERROR: openssl is required." >&2
  exit 1
fi

ARCHIVE_PATH="$(find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'em-ai-learning-before-*.tar.gz' -o -name 'em-ai-learning-before-834-*.tar.gz' \) -print -quit)"
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

container_env_value() {
  local key="$1"
  if ! docker inspect "$CONTAINER_NAME" >/dev/null 2>&1; then
    return 0
  fi
  docker inspect "$CONTAINER_NAME" --format '{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null \
    | awk -v key="$key" 'index($0, key "=") == 1 { print substr($0, length(key) + 2); exit }'
}

container_auth_secret="$(container_env_value AUTH_SECRET || true)"
container_openai_api_key="$(container_env_value OPENAI_API_KEY || true)"
for key in MAILGUN_API_KEY EMAIL_VERIFICATION_SECRET MAILGUN_DOMAIN MAILGUN_API_URL EMAIL_FROM_ADDRESS EMAIL_FROM_NAME EMAIL_REPLY_TO EMAIL_DELIVERY_MODE EMAIL_CODE_TTL_MINUTES EMAIL_RESEND_COOLDOWN_SECONDS EMAIL_MAX_ATTEMPTS EMAIL_MAX_SENDS_PER_HOUR PENDING_REGISTRATION_TTL_HOURS; do
  value="$(container_env_value "$key" || true)"
  if [ -n "$value" ]; then printf -v "$key" '%s' "$value"; fi
done
AUTH_SECRET_SOURCE="generated-random"
if [ -n "$container_auth_secret" ]; then
  AUTH_SECRET="$container_auth_secret"
  AUTH_SECRET_SOURCE="existing-container"
elif [ -n "$AUTH_SECRET" ]; then
  AUTH_SECRET_SOURCE="environment"
else
  AUTH_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
fi
if [ "${#AUTH_SECRET}" -lt 32 ]; then
  echo "ERROR: AUTH_SECRET from ${AUTH_SECRET_SOURCE} is shorter than 32 characters." >&2
  exit 1
fi

OPENAI_API_KEY_SOURCE="unset"
if [ -n "$container_openai_api_key" ]; then
  OPENAI_API_KEY="$container_openai_api_key"
  OPENAI_API_KEY_SOURCE="existing-container"
elif [ -n "$OPENAI_API_KEY" ]; then
  OPENAI_API_KEY_SOURCE="environment"
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
  -e MAILGUN_API_KEY="$MAILGUN_API_KEY" -e EMAIL_VERIFICATION_SECRET="$EMAIL_VERIFICATION_SECRET" \
  -e MAILGUN_DOMAIN="$MAILGUN_DOMAIN" -e MAILGUN_API_URL="$MAILGUN_API_URL" -e EMAIL_FROM_ADDRESS="$EMAIL_FROM_ADDRESS" -e EMAIL_FROM_NAME="$EMAIL_FROM_NAME" -e EMAIL_REPLY_TO="$EMAIL_REPLY_TO" -e EMAIL_DELIVERY_MODE="$EMAIL_DELIVERY_MODE" -e EMAIL_CODE_TTL_MINUTES="$EMAIL_CODE_TTL_MINUTES" -e EMAIL_RESEND_COOLDOWN_SECONDS="$EMAIL_RESEND_COOLDOWN_SECONDS" -e EMAIL_MAX_ATTEMPTS="$EMAIL_MAX_ATTEMPTS" -e EMAIL_MAX_SENDS_PER_HOUR="$EMAIL_MAX_SENDS_PER_HOUR" -e PENDING_REGISTRATION_TTL_HOURS="$PENDING_REGISTRATION_TTL_HOURS" \
  -e SEED_ON_START=false \
  -e SEED_TEST_USERS=false \
  -v "${DATA_VOLUME}:/data" \
  "$OLD_IMAGE_ID" >/dev/null

for _ in $(seq 1 30); do
  if curl -fsS --max-time 5 "http://127.0.0.1:${HOST_PORT}" >/dev/null 2>&1; then
    curl -fsS --max-time 20 "$PUBLIC_URL" >/dev/null
    echo "ROLLBACK_RESULT status=success backup=${ARCHIVE_PATH} restored_image=${OLD_IMAGE_REFERENCE} restored_image_id=${OLD_IMAGE_ID} auth_secret_source=${AUTH_SECRET_SOURCE} openai_api_key_source=${OPENAI_API_KEY_SOURCE}"
    exit 0
  fi
  sleep 2
done

docker logs --tail 200 "$CONTAINER_NAME" || true
echo "ROLLBACK_RESULT status=failed backup=${ARCHIVE_PATH} restored_image=${OLD_IMAGE_REFERENCE}" >&2
exit 1
