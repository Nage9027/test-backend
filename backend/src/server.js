const path = require("path");
const dotenv = require("dotenv");

// Load .env before any route imports Prisma. Do not rely on cwd alone.
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

if (!process.env.DATABASE_URL) {
  console.error(
    "[FATAL] DATABASE_URL is not set. Add it to backend/.env locally or Railway Variables.",
  );
  process.exit(1);
}

// Bind all interfaces so platforms like Railway/Docker can route to the container.
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`);
});
server.ref();
