const express = require("express");
const cors = require("cors");
const { requireAuth } = require("./middleware/auth");
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();

const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173,https://test-backend-production-9179.up.railway.app"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const isRailwayAppDomain = (origin) => {
  try {
    const url = new URL(origin);
    return url.hostname.endsWith(".up.railway.app");
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (curl, server-side) and matching origins.
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow Railway hosted frontend URLs without redeploying for every new domain.
      if (isRailwayAppDomain(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.get("/api", (req, res) =>
  res.json({
    name: "team-task-manager-api",
    version: "1.0.0",
    endpoints: ["/api/auth", "/api/projects", "/api/dashboard"],
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/projects", requireAuth, projectRoutes);
app.use("/api/projects/:projectId/tasks", requireAuth, taskRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);

app.use((req, res) => res.status(404).json({ message: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[API ERROR]", err);
  if (err?.message?.startsWith("Origin ")) {
    return res.status(403).json({ message: err.message });
  }
  return res.status(500).json({ message: err?.message || "Something went wrong" });
});

module.exports = app;
