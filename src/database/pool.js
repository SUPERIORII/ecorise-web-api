import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

let db;

if (process.env.NODE_ENV === "production") {
  // CHECK THE DATABASE PROVIDER

  if (process.env.DB_PROVIDER === "render") {
    db = new Pool({
      connectionString: process.env.DATABASE_URL_INTERNAL,
      ssl: { rejectUnauthorized: false },
    });
  } else if (process.env.DB_PROVIDER === "neon") {
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
    port: process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432,
    max: 10,
    idleTimeoutMillis: 30000,
    ssl: false, // Disable SSL for local dev
  });
}

export default db;
