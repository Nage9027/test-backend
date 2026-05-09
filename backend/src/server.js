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

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
server.ref();
