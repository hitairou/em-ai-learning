import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";

const testDir = path.resolve("tests");
const testFiles = readdirSync(testDir)
  .filter((name) => name.endsWith(".test.ts") || name.endsWith(".test.tsx"))
  .sort()
  .map((name) => path.join("tests", name));

const tsxCli = path.resolve("node_modules", "tsx", "dist", "cli.mjs");
const result = spawnSync(process.execPath, [tsxCli, "--test", "--test-concurrency=1", ...testFiles], {
  stdio: "inherit",
  shell: false,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
