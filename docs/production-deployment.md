# Production deployment

Production deployment is handled by a single manual GitHub Actions run:

```bash
gh workflow run deploy-to-server.yml --ref main -R hitairou/em-ai-learning
```

The workflow must be run from `main`. It verifies the app, builds and pushes the amd64 image, then deploys it on the `ecorun-esprimo` self-hosted runner.

## Image tags

`deploy-to-server.yml` builds and pushes:

- `ghcr.io/hitairou/em-ai-learning:<GITHUB_SHA>-amd64`
- `ghcr.io/hitairou/em-ai-learning:main-amd64`

Deployment always uses the immutable `<GITHUB_SHA>-amd64` tag.

## Secret handling

`GHCR_READ_TOKEN` is optional. The deploy script tries GHCR authentication in this order:

1. `GHCR_READ_TOKEN`, when present
2. the GitHub Actions token
3. existing Docker credentials on the runner

Deployment only stops when `docker pull` for the immutable image fails.

`AUTH_SECRET` is required by the app, but it is inherited automatically. The deploy script uses:

1. the current `em-ai-learning` container value
2. the GitHub Actions `AUTH_SECRET` secret
3. a generated random value, only when no existing value is available

`OPENAI_API_KEY` is optional for deployment. The script uses the current container value first, then the GitHub Actions secret, then an empty value. When it is empty, derivation grading remains pending and does not write incorrect answer history.

Secret values are never printed by the deployment scripts. Logs include only source labels such as `existing-container`, `github-secret`, `github-token`, or `unset`.

## Deployment sequence

The deploy script operates only on:

- container: `em-ai-learning`
- volume: `em-ai-learning-data`
- bind address: `127.0.0.1:3010`
- candidate bind address: `127.0.0.1:4010`
- image: `ghcr.io/hitairou/em-ai-learning:<GITHUB_SHA>-amd64`
- backup directory: `$HOME/em-ai-learning-backups`

The sequence is:

1. capture current container secret presence and image metadata
2. pull the immutable image
3. stop and rename the current container
4. create a full volume backup
5. record production counts without secret values
6. apply migrations
7. import the 834 canonical questions twice
8. apply the review-state manifest
9. create an admin only if the production DB has zero admins
10. verify the production question invariants
11. start a candidate container on port `4010`
12. check candidate health, root HTML, JS, CSS, KaTeX CSS, and logs
13. remove the candidate container
14. start the production container on port `3010`
15. check internal and public health, root HTML, JS, CSS, KaTeX CSS, and logs
16. compare data counts against the pre-deploy snapshot

SQLite writes are not shared across simultaneously running production containers. The old container is stopped before migration and import; the candidate is removed before the final production container starts.

## Admin bootstrap

If at least one admin exists, no admin is created. If the database has zero admins, deployment uses `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` when available. If they are unavailable, it generates credentials and stores them in a `600` permission file:

```text
$HOME/em-ai-learning-backups/bootstrap-admin-YYYYMMDD-HHMMSS.txt
```

The path may be reported. The email and password values must not be printed in chat, logs, PRs, commits, or workflow summaries.

## Automatic rollback

Migration, import, DB verification, candidate health, public health, asset verification, data-preservation, or log checks trigger rollback. Rollback removes the failed container, restores the volume archive, renames and restarts the old container, then requires `http://127.0.0.1:3010` to return HTTP 200.

The backup directory contains the volume archive, archive listing, old and new image references, image IDs or digests, sanitized container configuration, secret source labels, and before/after count comparisons.

## Manual rollback

Run this on the production host:

```bash
bash scripts/rollback-production.sh \
  "$HOME/em-ai-learning-backups/em-ai-learning-before-YYYYMMDD-HHMMSS"
```

The rollback script reuses `AUTH_SECRET` and `OPENAI_API_KEY` from the current container when available. If `OPENAI_API_KEY` is unavailable, rollback still starts the app with an empty value.
