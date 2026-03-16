import type { Config } from "drizzle-kit";

const password = process.env.DB_PASSWORD;

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    ...(password ? { password } : {}),
    database: process.env.DB_NAME || "clinical_kit_db",
  },
} satisfies Config;
