const { spawnSync } = require("child_process");
const path = require("path");

const port = process.env.PORT || "4173";
const root = path.join(__dirname, "..");
const binDir = path.join(root, "node_modules", ".bin");
const serveCmd = process.platform === "win32" ? "serve.cmd" : "serve";
const bin = path.join(binDir, serveCmd);

const result = spawnSync(bin, ["-s", "dist", "-l", `tcp://0.0.0.0:${port}`], {
  stdio: "inherit",
  cwd: root,
  shell: process.platform === "win32",
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
