# Production deployment

Production deployment uses the two existing GitHub Actions workflows.

1. `docker-publish.yml` builds `main` and the immutable merge commit SHA tag.
2. `deploy-to-server.yml` is dispatched with the 40-character merge commit SHA and `self-hosted` transport.
3. SSH transport is used only when the self-hosted runner is unavailable.

The deployment script operates only on these resources:

- container: `em-ai-learning`
- volume: `em-ai-learning-data`
- bind address: `127.0.0.1:3010`
- image: `ghcr.io/hitairou/em-ai-learning:<commit-sha>`

## Deployment sequence

`scripts/deploy-production.sh` validates required secrets and disk space, pulls the immutable image, stops and renames the current container, backs up the complete volume, applies migrations, imports the 834 canonical questions, applies the review-state manifest, verifies production invariants, starts the new container, and checks internal and public health endpoints.

The backup is stored under:

```text
$HOME/em-ai-learning-backups/em-ai-learning-before-834-YYYYMMDD-HHMMSS/
```

The directory contains the volume archive, archive listing, old and new image references, image IDs or digests, sanitized container configuration, and before/after count comparisons. It does not contain environment variables or secret values outside the encrypted database contents.

## Automatic rollback

Migration, import, verification, startup, internal health, public health, or preservation-check failure triggers automatic rollback. The failed new container is removed, the named volume is restored from the archive, the renamed old container is restored to its original name, and `http://127.0.0.1:3010` must return HTTP 200.

## Manual rollback

Run this on the production host with the same production secrets in the environment:

```bash
AUTH_SECRET='...' OPENAI_API_KEY='...' \
  bash scripts/rollback-production.sh \
  "$HOME/em-ai-learning-backups/em-ai-learning-before-834-YYYYMMDD-HHMMSS"
```

The script restores the exact old local image ID, `prod.db`, SQLite sidecar files, uploads, and the remaining volume contents. It recreates only the `em-ai-learning` container with the established port, restart policy, database URL, upload directory, and volume.

Do not remove the old local Docker image or the backup directory until the deployment has been manually accepted.
