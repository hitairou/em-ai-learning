#!/usr/bin/env bash
set -Eeuo pipefail

CONTAINER_NAME="${CONTAINER_NAME:-em-ai-learning}"
DATA_VOLUME="${DATA_VOLUME:-em-ai-learning-data}"
HOST_PORT="${HOST_PORT:-3010}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"
PUBLIC_URL="${PUBLIC_URL:-https://edesign.tairoh.com}"
BACKUP_ROOT="${BACKUP_ROOT:-${HOME}/em-ai-learning-backups}"
GHCR_USERNAME="${GHCR_USERNAME:-hitairou}"
NEW_IMAGE="${NEW_IMAGE:-${IMAGE:-}}"
GHCR_READ_TOKEN="${GHCR_READ_TOKEN:-}"
GHCR_FALLBACK_TOKEN="${GHCR_FALLBACK_TOKEN:-${GITHUB_TOKEN:-}}"
AUTH_SECRET="${AUTH_SECRET:-}"
OPENAI_API_KEY="${OPENAI_API_KEY:-}"
ADMIN_BOOTSTRAP_EMAIL="${ADMIN_BOOTSTRAP_EMAIL:-}"
ADMIN_BOOTSTRAP_PASSWORD="${ADMIN_BOOTSTRAP_PASSWORD:-}"
ADMIN_BOOTSTRAP_NAME="${ADMIN_BOOTSTRAP_NAME:-Administrator}"

if [ -z "$NEW_IMAGE" ]; then
  echo "ERROR: NEW_IMAGE is required." >&2
  exit 1
fi
if ! command -v docker >/dev/null || ! command -v curl >/dev/null || ! command -v tar >/dev/null || ! command -v openssl >/dev/null; then
  echo "ERROR: docker, curl, tar, and openssl are required." >&2
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

container_env_value() {
  local key="$1"
  docker inspect "$CONTAINER_NAME" --format '{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null \
    | awk -v key="$key" 'index($0, key "=") == 1 { print substr($0, length(key) + 2); exit }'
}

present_label() {
  if [ -n "${1:-}" ]; then printf 'present'; else printf 'absent'; fi
}

container_auth_secret="$(container_env_value AUTH_SECRET || true)"
container_openai_api_key="$(container_env_value OPENAI_API_KEY || true)"
container_auth_present="$(present_label "$container_auth_secret")"
container_openai_present="$(present_label "$container_openai_api_key")"

AUTH_SECRET_SOURCE="generated-random"
GENERATED_AUTH_SECRET=0
if [ -n "$container_auth_secret" ]; then
  AUTH_SECRET="$container_auth_secret"
  AUTH_SECRET_SOURCE="existing-container"
elif [ -n "$AUTH_SECRET" ]; then
  AUTH_SECRET_SOURCE="github-secret"
else
  AUTH_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
  GENERATED_AUTH_SECRET=1
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
  OPENAI_API_KEY_SOURCE="github-secret"
fi

GHCR_AUTH_SOURCE="existing-docker-credentials"
GHCR_LOGIN_OK=0
if [ -n "$GHCR_READ_TOKEN" ]; then
  if printf '%s' "$GHCR_READ_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin >/dev/null 2>&1; then
    GHCR_AUTH_SOURCE="GHCR_READ_TOKEN"
    GHCR_LOGIN_OK=1
  else
    echo "WARN: GHCR_READ_TOKEN login failed; trying GitHub Actions token." >&2
  fi
else
  echo "INFO: GHCR_READ_TOKEN is not set; trying GitHub Actions token." >&2
fi
if [ "$GHCR_LOGIN_OK" -ne 1 ] && [ -n "$GHCR_FALLBACK_TOKEN" ]; then
  if printf '%s' "$GHCR_FALLBACK_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin >/dev/null 2>&1; then
    GHCR_AUTH_SOURCE="github-token"
    GHCR_LOGIN_OK=1
  else
    echo "WARN: GitHub Actions token login failed; trying existing Docker credentials." >&2
  fi
fi
if ! docker pull "$NEW_IMAGE" >/dev/null; then
  echo "ERROR: docker pull failed for $NEW_IMAGE." >&2
  exit 1
fi

STAMP="$(date -u +%Y%m%d-%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/em-ai-learning-before-${STAMP}"
ARCHIVE_NAME="em-ai-learning-before-${STAMP}.tar.gz"
ARCHIVE_PATH="${BACKUP_DIR}/${ARCHIVE_NAME}"
OLD_CONTAINER_NAME="${CONTAINER_NAME}-before-${STAMP}"
PREPARE_NAME="${CONTAINER_NAME}-prepare-${STAMP}"
CANDIDATE_NAME="${CONTAINER_NAME}-candidate-${STAMP}"
CANDIDATE_PORT="${CANDIDATE_PORT:-$((HOST_PORT + 1000))}"
OLD_IMAGE_REFERENCE="$(docker inspect "$CONTAINER_NAME" --format '{{.Config.Image}}')"
OLD_IMAGE_ID="$(docker inspect "$CONTAINER_NAME" --format '{{.Image}}')"
NEW_IMAGE_DIGEST="$(docker image inspect "$NEW_IMAGE" --format '{{index .RepoDigests 0}}' 2>/dev/null || true)"
BACKUP_READY=0
OLD_RENAMED=0

mkdir -p "$BACKUP_DIR"
printf '%s\n' "$AUTH_SECRET_SOURCE" > "${BACKUP_DIR}/auth-secret-source.txt"
printf '%s\n' "$OPENAI_API_KEY_SOURCE" > "${BACKUP_DIR}/openai-api-key-source.txt"
printf '%s\n' "$GHCR_AUTH_SOURCE" > "${BACKUP_DIR}/ghcr-auth-source.txt"
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
  docker rm -f "$CANDIDATE_NAME" "$PREPARE_NAME" "$CONTAINER_NAME" >/dev/null 2>&1 || true
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

run_state() {
  docker run --rm \
    -e DATABASE_URL=file:/data/prod.db \
    -e UPLOAD_DIR=/data/uploads \
    -v "${DATA_VOLUME}:/data" \
    -v "${BACKUP_DIR}:/backup:ro" \
    "$NEW_IMAGE" node scripts/production-state.mjs "$@"
}

check_html_assets() {
  local base_url="$1"
  local html="$2"
  local css_path
  local js_path
  css_path="$(printf '%s' "$html" | grep -Eo '/_next/static/[^"]+\.css[^"]*' | head -n 1 | sed 's/&amp;/\&/g' || true)"
  js_path="$(printf '%s' "$html" | grep -Eo '/_next/static/[^"]+\.js[^"]*' | head -n 1 | sed 's/&amp;/\&/g' || true)"
  if [ -z "$css_path" ] || [ -z "$js_path" ]; then
    echo "ERROR: Next.js CSS or JavaScript asset link was not found in HTML." >&2
    return 1
  fi
  curl -fsS --max-time 10 "${base_url}${css_path}" >/tmp/em-ai-learning-css-${STAMP}.txt
  curl -fsS --max-time 10 "${base_url}${js_path}" >/dev/null
  if ! grep -qi 'katex' "/tmp/em-ai-learning-css-${STAMP}.txt"; then
    echo "ERROR: KaTeX CSS was not found in the fetched stylesheet." >&2
    return 1
  fi
}

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

run_state > "${BACKUP_DIR}/before-state.json"
BEFORE_STATE_SUMMARY="$(run_state --summary)"
BEFORE_ADMIN_COUNT="$(run_state --field adminCount)"
echo "PRECHECK_RESULT container=${CONTAINER_NAME} running_before_stop=true volume=${DATA_VOLUME} old_image=${OLD_IMAGE_REFERENCE} self_hosted_runner=${RUNNER_NAME:-unknown} auth_secret_in_container=${container_auth_present} openai_api_key_in_container=${container_openai_present} ${BEFORE_STATE_SUMMARY}"

ADMIN_BOOTSTRAP_SOURCE="skipped-existing-admin"
ADMIN_BOOTSTRAP_FILE="none"
SKIP_ADMIN_BOOTSTRAP="true"
if [ "$BEFORE_ADMIN_COUNT" -lt 1 ]; then
  SKIP_ADMIN_BOOTSTRAP="false"
  if [ -n "$ADMIN_BOOTSTRAP_EMAIL" ] && [ -n "$ADMIN_BOOTSTRAP_PASSWORD" ]; then
    ADMIN_BOOTSTRAP_SOURCE="github-secret-or-env"
  else
    ADMIN_BOOTSTRAP_SOURCE="generated-random"
    ADMIN_BOOTSTRAP_EMAIL="bootstrap-admin-${STAMP}@em-ai-learning.local"
    ADMIN_BOOTSTRAP_PASSWORD="A1$(openssl rand -base64 36 | tr -d '\n')z9"
    ADMIN_BOOTSTRAP_FILE="${BACKUP_ROOT}/bootstrap-admin-${STAMP}.txt"
    umask 077
    {
      printf 'created_at_utc=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
      printf 'email=%s\n' "$ADMIN_BOOTSTRAP_EMAIL"
      printf 'password=%s\n' "$ADMIN_BOOTSTRAP_PASSWORD"
    } > "$ADMIN_BOOTSTRAP_FILE"
    chmod 600 "$ADMIN_BOOTSTRAP_FILE"
  fi
fi
printf '%s\n' "$ADMIN_BOOTSTRAP_SOURCE" > "${BACKUP_DIR}/admin-bootstrap-source.txt"
printf '%s\n' "$ADMIN_BOOTSTRAP_FILE" > "${BACKUP_DIR}/admin-bootstrap-file.txt"

docker rm -f "$PREPARE_NAME" "$CANDIDATE_NAME" >/dev/null 2>&1 || true
docker run --rm --name "$PREPARE_NAME" \
  -e NODE_ENV=production \
  -e DATABASE_URL=file:/data/prod.db \
  -e UPLOAD_DIR=/data/uploads \
  -e ADMIN_BOOTSTRAP_EMAIL="$ADMIN_BOOTSTRAP_EMAIL" \
  -e ADMIN_BOOTSTRAP_PASSWORD="$ADMIN_BOOTSTRAP_PASSWORD" \
  -e ADMIN_BOOTSTRAP_NAME="$ADMIN_BOOTSTRAP_NAME" \
  -e SKIP_ADMIN_BOOTSTRAP="$SKIP_ADMIN_BOOTSTRAP" \
  -v "${DATA_VOLUME}:/data" \
  "$NEW_IMAGE" sh -c '
    node node_modules/prisma/build/index.js migrate deploy &&
    node scripts/import-questions.mjs &&
    node scripts/import-questions.mjs &&
    node scripts/apply-review-state.mjs &&
    if [ "$SKIP_ADMIN_BOOTSTRAP" = "true" ]; then
      printf "%s\n" "{\"adminBootstrap\":\"skipped_existing_admin\"}"
    else
      node scripts/ensure-admin.mjs
    fi &&
    node scripts/import-questions.mjs --verify-production
  '

docker run -d \
  --name "$CANDIDATE_NAME" \
  -p "127.0.0.1:${CANDIDATE_PORT}:${CONTAINER_PORT}" \
  -e NODE_ENV=production \
  -e DATABASE_URL=file:/data/prod.db \
  -e UPLOAD_DIR=/data/uploads \
  -e AUTH_SECRET="$AUTH_SECRET" \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -e SEED_ON_START=false \
  -e SEED_TEST_USERS=false \
  -v "${DATA_VOLUME}:/data" \
  "$NEW_IMAGE" >/dev/null

candidate_ready=false
for _ in $(seq 1 45); do
  if curl -fsS --max-time 5 "http://127.0.0.1:${CANDIDATE_PORT}/api/health" >/dev/null 2>&1 \
    && curl -fsS --max-time 5 "http://127.0.0.1:${CANDIDATE_PORT}" >/dev/null 2>&1; then
    candidate_ready=true
    break
  fi
  sleep 2
done
if [ "$candidate_ready" != "true" ]; then
  docker logs --tail 200 "$CANDIDATE_NAME" || true
  false
fi
CANDIDATE_ROOT_HTML="$(curl -fsS --max-time 10 "http://127.0.0.1:${CANDIDATE_PORT}")"
check_html_assets "http://127.0.0.1:${CANDIDATE_PORT}" "$CANDIDATE_ROOT_HTML"
if docker logs "$CANDIDATE_NAME" 2>&1 | grep -Eqi 'migration failed|question import.*failed|PrismaClient.*Error'; then
  echo "ERROR: candidate logs contain a migration, import, or Prisma error." >&2
  false
fi

docker rm -f "$CANDIDATE_NAME" >/dev/null

run_state --compare /backup/before-state.json \
  | tee "${BACKUP_DIR}/after-state-comparison.json"

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

production_ready=false
for _ in $(seq 1 45); do
  if curl -fsS --max-time 5 "http://127.0.0.1:${HOST_PORT}/api/health" >/dev/null 2>&1 \
    && curl -fsS --max-time 5 "http://127.0.0.1:${HOST_PORT}" >/dev/null 2>&1; then
    production_ready=true
    break
  fi
  sleep 2
done
if [ "$production_ready" != "true" ]; then
  docker logs --tail 200 "$CONTAINER_NAME" || true
  false
fi

curl -fsS --max-time 10 "http://127.0.0.1:${HOST_PORT}/api/health" >/dev/null
PRODUCTION_ROOT_HTML="$(curl -fsS --max-time 10 "http://127.0.0.1:${HOST_PORT}")"
check_html_assets "http://127.0.0.1:${HOST_PORT}" "$PRODUCTION_ROOT_HTML"
curl -fsS --max-time 20 "${PUBLIC_URL}/api/health" >/dev/null
PUBLIC_ROOT_HTML="$(curl -fsS --max-time 20 "$PUBLIC_URL")"
check_html_assets "$PUBLIC_URL" "$PUBLIC_ROOT_HTML"

test "$(docker inspect "$CONTAINER_NAME" --format '{{.State.Running}}')" = "true"
test "$(docker inspect "$CONTAINER_NAME" --format '{{.HostConfig.RestartPolicy.Name}}')" = "unless-stopped"
docker exec "$CONTAINER_NAME" node scripts/import-questions.mjs --verify-production

if docker logs "$CONTAINER_NAME" 2>&1 | grep -Eqi 'migration failed|question import.*failed|PrismaClient.*Error'; then
  echo "ERROR: production logs contain a migration, import, or Prisma error." >&2
  false
fi

BACKUP_SIZE="$(stat -c '%s' "$ARCHIVE_PATH")"
AFTER_STATE_SUMMARY="$(docker exec "$CONTAINER_NAME" node scripts/production-state.mjs --summary)"
docker rm "$OLD_CONTAINER_NAME" >/dev/null
OLD_RENAMED=0
trap - ERR
docker logout ghcr.io >/dev/null 2>&1 || true
rm -f "/tmp/em-ai-learning-css-${STAMP}.txt" >/dev/null 2>&1 || true
echo "POSTCHECK_RESULT ${AFTER_STATE_SUMMARY}"
echo "DEPLOY_RESULT status=success backup=${ARCHIVE_PATH} backup_size=${BACKUP_SIZE} old_image=${OLD_IMAGE_REFERENCE} old_image_id=${OLD_IMAGE_ID} new_image=${NEW_IMAGE} new_digest=${NEW_IMAGE_DIGEST} ghcr_auth_source=${GHCR_AUTH_SOURCE} auth_secret_source=${AUTH_SECRET_SOURCE} openai_api_key_source=${OPENAI_API_KEY_SOURCE} generated_auth_secret=${GENERATED_AUTH_SECRET} admin_bootstrap_source=${ADMIN_BOOTSTRAP_SOURCE} admin_bootstrap_file=${ADMIN_BOOTSTRAP_FILE} rollback_executed=false candidate_port=${CANDIDATE_PORT}"
