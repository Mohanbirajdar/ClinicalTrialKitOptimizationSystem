import type { Config } from "drizzle-kit";

const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST || "localhost";

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "mysql",
  dbCredentials: {
    host,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    ...(password ? { password } : {}),
    database: process.env.DB_NAME || "clinical_kit_db",
    ssl: host !== "localhost" && host !== "127.0.0.1" ? { rejectUnauthorized: false } : undefined,
  },
} satisfies Config;
