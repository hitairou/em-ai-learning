import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function text(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("deploy workflow is a one-shot main deployment with immutable amd64 tags", async () => {
  const workflow = await text(".github/workflows/deploy-to-server.yml");

  assert.match(workflow, /workflow_dispatch:\s*\n\s*\n/);
  assert.doesNotMatch(workflow, /github\.event\.inputs|transport:|Immutable 40-character commit SHA image tag/);
  assert.match(workflow, /Require main branch/);
  assert.match(workflow, /packages: write/);
  assert.match(workflow, /\$\{GITHUB_SHA\}-amd64/);
  assert.match(workflow, /main-amd64/);
  assert.match(workflow, /GHCR_FALLBACK_TOKEN: \$\{\{ github\.token \}\}/);
});

test("production deploy script treats GHCR and app feature secrets as optional", async () => {
  const script = await text("scripts/deploy-production.sh");

  assert.doesNotMatch(script, /GHCR_READ_TOKEN="\$\{GHCR_READ_TOKEN:\?/);
  assert.doesNotMatch(script, /OPENAI_API_KEY="\$\{OPENAI_API_KEY:\?/);
  assert.doesNotMatch(script, /^\s*\[ -n "\$GHCR_READ_TOKEN" \]\s*$/m);
  assert.doesNotMatch(script, /^\s*\[ -n "\$OPENAI_API_KEY" \]\s*$/m);
  assert.match(script, /container_env_value AUTH_SECRET/);
  assert.match(script, /AUTH_SECRET_SOURCE="existing-container"/);
  assert.match(script, /OPENAI_API_KEY_SOURCE="existing-container"/);
  assert.match(script, /GHCR_AUTH_SOURCE="github-token"/);
  assert.match(script, /GHCR_AUTH_SOURCE="existing-docker-credentials"/);
  assert.match(script, /docker pull "\$NEW_IMAGE"/);
});

test("production deploy preserves admins and writes generated bootstrap credentials only to a file", async () => {
  const script = await text("scripts/deploy-production.sh");

  assert.match(script, /BEFORE_ADMIN_COUNT="\$\(run_state --field adminCount\)"/);
  assert.match(script, /SKIP_ADMIN_BOOTSTRAP="true"/);
  assert.match(script, /ADMIN_BOOTSTRAP_SOURCE="generated-random"/);
  assert.match(script, /bootstrap-admin-\$\{STAMP\}\.txt/);
  assert.match(script, /chmod 600 "\$ADMIN_BOOTSTRAP_FILE"/);
  assert.doesNotMatch(script, /Admin123!/);
});

test("manual rollback can reuse current container secrets without requiring OPENAI_API_KEY", async () => {
  const script = await text("scripts/rollback-production.sh");

  assert.doesNotMatch(script, /OPENAI_API_KEY="\$\{OPENAI_API_KEY:\?/);
  assert.match(script, /container_env_value AUTH_SECRET/);
  assert.match(script, /OPENAI_API_KEY_SOURCE="unset"/);
});
