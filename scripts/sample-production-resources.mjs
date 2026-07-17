import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const destination = process.argv[2];
const containerName = process.env.CONTAINER_NAME ?? "em-ai-learning";
const intervalMs = Number(process.env.RESOURCE_SAMPLE_INTERVAL_MS ?? "1000");
if (!destination) throw new Error("A destination JSONL path is required");

mkdirSync(path.dirname(destination), { recursive: true });
let stopping = false;
process.on("SIGINT", () => { stopping = true; });
process.on("SIGTERM", () => { stopping = true; });

while (!stopping) {
  const stats = JSON.parse(execFileSync("docker", ["stats", "--no-stream", "--format", "{{json .}}", containerName], { encoding: "utf8" }));
  const meminfo = keyValues(readFileSync("/proc/meminfo", "utf8"));
  const vmstat = keyValues(readFileSync("/proc/vmstat", "utf8"));
  const loadAverage = readFileSync("/proc/loadavg", "utf8").trim().split(/\s+/).slice(0, 3).map(Number);
  appendFileSync(destination, `${JSON.stringify({
    timestamp: new Date().toISOString(),
    container: {
      cpuPercent: stats.CPUPerc ?? null,
      memoryUsage: stats.MemUsage ?? null,
      memoryPercent: stats.MemPerc ?? null,
      processes: stats.PIDs ?? null,
    },
    host: {
      availableMemoryKb: Number(meminfo.MemAvailable ?? 0),
      swapTotalKb: Number(meminfo.SwapTotal ?? 0),
      swapFreeKb: Number(meminfo.SwapFree ?? 0),
      swapPagesIn: Number(vmstat.pswpin ?? 0),
      swapPagesOut: Number(vmstat.pswpout ?? 0),
      loadAverage,
    },
  })}\n`);
  await new Promise((resolve) => setTimeout(resolve, intervalMs));
}

function keyValues(source) {
  return Object.fromEntries(source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const [key, value] = line.split(/\s+/, 2);
    return [key.replace(/:$/, ""), value];
  }));
}
