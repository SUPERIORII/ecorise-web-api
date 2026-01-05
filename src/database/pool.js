import { Pool } from "pg";

// env already loaded globally
let db;

if (process.env.NODE_ENV === "production") {
  if (process.env.DB_PROVIDER === "neon") {
    if (!process.env.NEONDB_CONNECTION_STRING) {
      throw new Error("NEONDB_CONNECTION_STRING is missing");
    }

    db = new Pool({
      connectionString: process.env.NEONDB_CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
    });
  }
} else {
  db = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: Number(process.env.PG_PORT || 5432),
    max: 10,
    idleTimeoutMillis: 30000,
    ssl: false, // Disable SSL for local dev
  });
}

export default db;
