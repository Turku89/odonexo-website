const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const PORTS = [3000, 3001];

function killPort(port) {
  if (process.platform === "win32") {
    try {
      execSync(
        `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { if ($_.OwningProcess -gt 0) { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"`,
        { stdio: "ignore" }
      );
    } catch {
      /* ignore */
    }

    try {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: "utf8",
      });
      const pids = new Set();

      for (const line of output.split(/\r?\n/)) {
        if (!line.includes("LISTENING")) continue;
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== "0") pids.add(pid);
      }

      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
          console.log(`Stopped process ${pid} on port ${port}`);
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* port not in use */
    }

    return;
  }

  try {
    execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: "ignore" });
  } catch {
    /* ignore */
  }
}

for (const port of PORTS) {
  killPort(port);
}

// Give Windows time to release sockets before deleting build output.
if (process.platform === "win32") {
  try {
    execSync("powershell -NoProfile -Command \"Start-Sleep -Seconds 1\"", {
      stdio: "ignore",
    });
  } catch {
    /* ignore */
  }
}

for (const dir of [".next", "node_modules/.cache"]) {
  const target = path.join(root, dir);
  try {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`Removed ${dir}`);
  } catch {
    /* ignore */
  }
}
