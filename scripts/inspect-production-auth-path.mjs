import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const containerName = process.env.CONTAINER_NAME ?? "em-ai-learning";
const publicHost = new URL(process.env.PUBLIC_URL ?? "https://edesign.tairoh.com").host;

const nginxOutput = nginxConfig();
const serverBlocks = extractBlocks(nginxOutput, "server");
const targetBlocks = serverBlocks.filter((block) => new RegExp(`\\bserver_name\\s+[^;]*\\b${escapeRegExp(publicHost)}\\b`).test(block));
if (!targetBlocks.length) throw new Error(`Nginx server block for ${publicHost} was not found`);

const targetConfig = targetBlocks.join("\n");
const directives = [...targetConfig.matchAll(/^\s*(listen|server_name|location|proxy_pass|proxy_set_header|proxy_cookie_domain|proxy_cookie_path|proxy_hide_header|add_header|proxy_cache|fastcgi_cache|gzip|brotli)\b([^;{]*)(?:[;{])/gmi)]
  .map((match) => `${match[1].toLowerCase()}${match[2].replace(/\s+/g, " ").trim() ? ` ${match[2].replace(/\s+/g, " ").trim()}` : ""}`);

const containers = lines(docker(["ps", "-a", "--filter", `name=^/${containerName}$`, "--format", "{{.Names}}"]));
const adjacentContainers = lines(docker(["ps", "-a", "--filter", `name=${containerName}-`, "--format", "{{.Names}}"]));
if (containers.length !== 1) throw new Error(`Expected one ${containerName} container, found ${containers.length}`);

const inspect = JSON.parse(docker(["inspect", containerName]))[0];
const envNames = new Set((inspect.Config?.Env ?? []).map((entry) => String(entry).split("=", 1)[0]));
const portBindings = inspect.HostConfig?.PortBindings ?? {};
const nodeProcesses = lines(docker(["top", containerName, "-eo", "pid,args"])).filter((line) => /next-server|next start|server\.js/.test(line));
const recentAuthRedirects = authRedirectLogs(process.env.AUTH_LOG_SINCE ?? "24h");
const resourceSnapshot = resources();

const summary = {
  event: "PRODUCTION_AUTH_PATH_INSPECTION",
  nginx: {
    targetServerBlockCount: targetBlocks.length,
    directives,
    proxyPassToProductionPort: /proxy_pass\s+http:\/\/127\.0\.0\.1:3010\b/.test(targetConfig),
    forwardsHost: /proxy_set_header\s+Host\s+\$host\s*;/.test(targetConfig),
    forwardsProto: /proxy_set_header\s+X-Forwarded-Proto\s+\$scheme\s*;/.test(targetConfig),
    forwardsFor: /proxy_set_header\s+X-Forwarded-For\s+/.test(targetConfig),
    rewritesCookieDomain: /proxy_cookie_domain\b/.test(targetConfig),
    rewritesCookiePath: /proxy_cookie_path\b/.test(targetConfig),
    hidesSetCookie: /proxy_hide_header\s+Set-Cookie\s*;/i.test(targetConfig),
    addsSetCookie: /add_header\s+Set-Cookie\b/i.test(targetConfig),
    proxyCacheConfigured: /\bproxy_cache\s+(?!off\b)/.test(targetConfig),
    fastcgiCacheConfigured: /\bfastcgi_cache\s+(?!off\b)/.test(targetConfig),
  },
  container: {
    productionCount: containers.length,
    adjacentCount: adjacentContainers.length,
    running: Boolean(inspect.State?.Running),
    restarting: Boolean(inspect.State?.Restarting),
    restartCount: inspect.RestartCount,
    oomKilled: Boolean(inspect.State?.OOMKilled),
    image: inspect.Config?.Image ?? null,
    portBindings,
    authSecretPresent: envNames.has("AUTH_SECRET"),
    nextProcessCount: nodeProcesses.length,
    loginAndProxyShareContainer: containers.length === 1 && nodeProcesses.length === 1,
  },
  recentAuthRedirects,
  resources: resourceSnapshot,
};

console.log(JSON.stringify(summary));

function nginxConfig() {
  for (const [command, args] of [["sudo", ["-n", "nginx", "-T"]], ["nginx", ["-T"]]]) {
    try {
      return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    } catch (error) {
      const stderr = error && typeof error === "object" && "stderr" in error ? String(error.stderr) : "";
      if (stderr.includes("configuration file")) return stderr;
    }
  }
  throw new Error("Unable to read the active Nginx configuration");
}

function docker(args) {
  return execFileSync("docker", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function authRedirectLogs(since) {
  const result = spawnSync("docker", ["logs", "--timestamps", "--since", since, containerName], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  return lines(output).flatMap((line) => {
    const jsonStart = line.indexOf("{");
    if (jsonStart < 0 || !line.includes('"event":"auth_proxy_redirect"')) return [];
    try {
      const parsed = JSON.parse(line.slice(jsonStart));
      return [{
        timestamp: line.slice(0, jsonStart).trim() || null,
        path: parsed.path ?? null,
        method: parsed.method ?? null,
        forwardedHost: parsed.forwardedHost ?? null,
        forwardedProto: parsed.forwardedProto ?? null,
        candidateCount: parsed.sessionCookieCandidateCount ?? null,
        newCookiePresent: parsed.newCookiePresent ?? null,
        legacyCookiePresent: parsed.legacyCookiePresent ?? null,
        failureCategory: parsed.failureCategory ?? null,
        userAgentClass: parsed.userAgentClass ?? null,
        redirectDestination: parsed.redirectDestination ?? null,
      }];
    } catch {
      return [];
    }
  }).slice(-200);
}

function resources() {
  const stats = JSON.parse(docker(["stats", "--no-stream", "--format", "{{json .}}", containerName]));
  const meminfo = keyValues(readFileSync("/proc/meminfo", "utf8"));
  const vmstat = keyValues(readFileSync("/proc/vmstat", "utf8"));
  const loadAverage = readFileSync("/proc/loadavg", "utf8").trim().split(/\s+/).slice(0, 3).map(Number);
  return {
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
  };
}

function keyValues(source) {
  return Object.fromEntries(lines(source).map((line) => {
    const [key, value] = line.split(/\s+/, 2);
    return [key.replace(/:$/, ""), value];
  }));
}

function extractBlocks(source, directive) {
  const blocks = [];
  const pattern = new RegExp(`\\b${directive}\\s*\\{`, "g");
  for (const match of source.matchAll(pattern)) {
    let depth = 0;
    let started = false;
    let quote = null;
    let escaped = false;
    for (let index = match.index; index < source.length; index += 1) {
      const character = source[index];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === "\\") {
        escaped = true;
        continue;
      }
      if (quote) {
        if (character === quote) quote = null;
        continue;
      }
      if (character === "\"" || character === "'") {
        quote = character;
        continue;
      }
      if (character === "{") {
        depth += 1;
        started = true;
      }
      if (character === "}") depth -= 1;
      if (started && depth === 0) {
        blocks.push(source.slice(match.index, index + 1));
        break;
      }
    }
  }
  return blocks;
}

function lines(value) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
