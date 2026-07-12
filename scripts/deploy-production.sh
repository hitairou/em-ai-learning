#!/usr/bin/env bash
set -Eeuo pipefail

CONTAINER_NAME="${CONTAINER_NAME:-em-ai-learning}"
DATA_VOLUME="${DATA_VOLUME:-em-ai-learning-data}"
HOST_PORT="${HOST_PORT:-3010}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"
PUBLIC_URL="${PUBLIC_URL:-https://edesign.tairoh.com}"
BACKUP_ROOT="${BACKUP_ROOT:-${HOME}/em-ai-learning-backups}"
GHCR_USERNAME="${GHCR_USERNAME:-hitairou}"
NEW_IMAGE="${NEW_IMAGE:?NEW_IMAGE is required}"
GHCR_READ_TOKEN="${GHCR_READ_TOKEN:?GHCR_READ_TOKEN is required}"
AUTH_SECRET="${AUTH_SECRET:?AUTH_SECRET is required}"
OPENAI_API_KEY="${OPENAI_API_KEY:?OPENAI_API_KEY is required}"

if [ "${#AUTH_SECRET}" -lt 32 ]; then
  echo "ERROR: AUTH_SECRET must contain at least 32 characters." >&2
  exit 1
fi
if ! command -v docker >/dev/null || ! command -v curl >/dev/null || ! command -v tar >/dev/null; then
  echo "ERROR: docker, curl, and tar are required." >&2
  exit 1
fi
if ! docker inspect "$CONTAINER_NAME" >/dev/null 2>&1; then
  echo "ERROR: production container $CONTAINER_NAME does not exist." >&2
  exit 1
fi
if ! docker volume inspect "$DATA_VOLUME" >/dev/null 2>&1; then
  echo "ERROR: production volume $DATA_VOLUME does not exist." >&2
  exit 1
fi

mkdir -p "$BACKUP_ROOT"
AVAILABLE_KB="$(df -Pk "$BACKUP_ROOT" | awk 'NR==2 {print $4}')"
if [ "${AVAILABLE_KB:-0}" -lt 1048576 ]; then
  echo "ERROR: less than 1 GiB is available for backup and deployment." >&2
  exit 1
fi

printf '%s' "$GHCR_READ_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin >/dev/null
docker pull "$NEW_IMAGE" >/dev/null

STAMP="$(date -u +%Y%m%d-%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/em-ai-learning-before-834-${STAMP}"
ARCHIVE_NAME="em-ai-learning-before-834-${STAMP}.tar.gz"
ARCHIVE_PATH="${BACKUP_DIR}/${ARCHIVE_NAME}"
OLD_CONTAINER_NAME="${CONTAINER_NAME}-before-834-${STAMP}"
OLD_IMAGE_REFERENCE="$(docker inspect "$CONTAINER_NAME" --format '{{.Config.Image}}')"
OLD_IMAGE_ID="$(docker inspect "$CONTAINER_NAME" --format '{{.Image}}')"
NEW_IMAGE_DIGEST="$(docker image inspect "$NEW_IMAGE" --format '{{index .RepoDigests 0}}' 2>/dev/null || true)"
BACKUP_READY=0
OLD_RENAMED=0

mkdir -p "$BACKUP_DIR"
docker inspect "$CONTAINER_NAME" --format '{{json .HostConfig.RestartPolicy}}' > "${BACKUP_DIR}/restart-policy.json"
docker inspect "$CONTAINER_NAME" --format '{{json .HostConfig.PortBindings}}' > "${BACKUP_DIR}/port-bindings.json"
docker inspect "$CONTAINER_NAME" --format '{{json .Mounts}}' > "${BACKUP_DIR}/mounts.json"
docker volume inspect "$DATA_VOLUME" > "${BACKUP_DIR}/volume-inspect.json"
printf '%s\n' "$OLD_IMAGE_REFERENCE" > "${BACKUP_DIR}/old-image-reference.txt"
printf '%s\n' "$OLD_IMAGE_ID" > "${BACKUP_DIR}/old-image-id.txt"
printf '%s\n' "$NEW_IMAGE" > "${BACKUP_DIR}/new-image-reference.txt"
printf '%s\n' "$NEW_IMAGE_DIGEST" > "${BACKUP_DIR}/new-image-digest.txt"

rollback() {
  local failure_code=$?
  trap - ERR
  set +e
  echo "ROLLBACK: deployment failed; restoring the previous container and volume." >&2
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
  if [ "$BACKUP_READY" -eq 1 ]; then
    docker run --rm --user 0:0 \
      -v "${DATA_VOLUME}:/data" \
      -v "${BACKUP_DIR}:/backup:ro" \
      --entrypoint sh "$NEW_IMAGE" \
      -c "find /data -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + && tar -C /data -xzf /backup/${ARCHIVE_NAME}"
  fi
  if [ "$OLD_RENAMED" -eq 1 ]; then
    docker rename "$OLD_CONTAINER_NAME" "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker start "$CONTAINER_NAME" >/dev/null 2>&1 || true
  fi
  for _ in $(seq 1 30); do
    if curl -fsS --max-time 5 "http://127.0.0.1:${HOST_PORT}" >/dev/null 2>&1; then
      echo "ROLLBACK_RESULT status=restored backup=${ARCHIVE_PATH} old_image=${OLD_IMAGE_REFERENCE}"
      docker logout ghcr.io >/dev/null 2>&1 || true
      exit "$failure_code"
    fi
    sleep 2
  done
  echo "ROLLBACK_RESULT status=failed backup=${ARCHIVE_PATH} old_image=${OLD_IMAGE_REFERENCE}" >&2
  docker logout ghcr.io >/dev/null 2>&1 || true
  exit "$failure_code"
}
trap rollback ERR

docker stop "$CONTAINER_NAME" >/dev/null
docker rename "$CONTAINER_NAME" "$OLD_CONTAINER_NAME"
OLD_RENAMED=1

docker run --rm --user 0:0 \
  -v "${DATA_VOLUME}:/data:ro" \
  -v "${BACKUP_DIR}:/backup" \
  --entrypoint sh "$NEW_IMAGE" \
  -c "tar -C /data -czf /backup/${ARCHIVE_NAME} ."
BACKUP_READY=1

test -s "$ARCHIVE_PATH"
tar -tzf "$ARCHIVE_PATH" > "${BACKUP_DIR}/archive-contents.txt"
grep -qx './prod.db' "${BACKUP_DIR}/archive-contents.txt"
grep -qx './uploads/' "${BACKUP_DIR}/archive-contents.txt"

docker run --rm \
  -e DATABASE_URL=file:/data/prod.db \
  -e UPLOAD_DIR=/data/uploads \
  -v "${DATA_VOLUME}:/data" \
  "$NEW_IMAGE" node scripts/production-state.mjs > "${BACKUP_DIR}/before-state.json"

docker run --rm --name "${CONTAINER_NAME}-prepare-${STAMP}" \
  -e NODE_ENV=production \
  -e DATABASE_URL=file:/data/prod.db \
  -e UPLOAD_DIR=/data/uploads \
  -e ADMIN_BOOTSTRAP_EMAIL="${ADMIN_BOOTSTRAP_EMAIL:-}" \
  -e ADMIN_BOOTSTRAP_PASSWORD="${ADMIN_BOOTSTRAP_PASSWORD:-}" \
  -e ADMIN_BOOTSTRAP_NAME="${ADMIN_BOOTSTRAP_NAME:-Administrator}" \
  -v "${DATA_VOLUME}:/data" \
  "$NEW_IMAGE" sh -c '
    node node_modules/prisma/build/index.js migrate deploy &&
    node scripts/import-questions.mjs &&
    node scripts/apply-review-state.mjs &&
    node scripts/ensure-admin.mjs &&
    node scripts/import-questions.mjs --verify-production
  '

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
  "$NEW_IMAGE" >/dev/null

for _ in $(seq 1 45); do
  if curl -fsS --max-time 5 "http://127.0.0.1:${HOST_PORT}/api/health" >/dev/null 2>&1 \
    && curl -fsS --max-time 5 "http://127.0.0.1:${HOST_PORT}" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
curl -fsS --max-time 10 "http://127.0.0.1:${HOST_PORT}/api/health" >/dev/null
curl -fsS --max-time 10 "http://127.0.0.1:${HOST_PORT}" >/dev/null
curl -fsS --max-time 20 "${PUBLIC_URL}/api/health" >/dev/null
curl -fsS --max-time 20 "$PUBLIC_URL" >/dev/null

test "$(docker inspect "$CONTAINER_NAME" --format '{{.State.Running}}')" = "true"
test "$(docker inspect "$CONTAINER_NAME" --format '{{.HostConfig.RestartPolicy.Name}}')" = "unless-stopped"
docker exec "$CONTAINER_NAME" node scripts/import-questions.mjs --verify-production
docker run --rm \
  -e DATABASE_URL=file:/data/prod.db \
  -e UPLOAD_DIR=/data/uploads \
  -v "${DATA_VOLUME}:/data" \
  -v "${BACKUP_DIR}:/backup:ro" \
  "$NEW_IMAGE" node scripts/production-state.mjs --compare /backup/before-state.json \
  | tee "${BACKUP_DIR}/after-state-comparison.json"

if docker logs "$CONTAINER_NAME" 2>&1 | grep -Eqi 'migration failed|question import.*failed|PrismaClient.*Error'; then
  echo "ERROR: deployment logs contain a migration, import, or Prisma error." >&2
  false
fi

BACKUP_SIZE="$(stat -c '%s' "$ARCHIVE_PATH")"
docker rm "$OLD_CONTAINER_NAME" >/dev/null
OLD_RENAMED=0
trap - ERR
docker logout ghcr.io >/dev/null 2>&1 || true
echo "DEPLOY_RESULT status=success backup=${ARCHIVE_PATH} backup_size=${BACKUP_SIZE} old_image=${OLD_IMAGE_REFERENCE} old_image_id=${OLD_IMAGE_ID} new_image=${NEW_IMAGE} new_digest=${NEW_IMAGE_DIGEST}"
