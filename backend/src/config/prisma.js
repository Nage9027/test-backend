const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

// Load env from backend/.env first, then from parent project/.env as fallback.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
}

const prisma = new PrismaClient();

module.exports = prisma;
