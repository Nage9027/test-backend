const { spawnSync } = require("child_process");
const path = require("path");

const port = process.env.PORT || "4173";
const root = path.join(__dirname, "..");
const serveDir = path.dirname(require.resolve("serve/package.json"));
const serveMain = path.join(serveDir, "build", "main.js");

const result = spawnSync(process.execPath, [serveMain, "-s", "dist", "-l", `tcp://0.0.0.0:${port}`], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
