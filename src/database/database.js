import dotenv from "dotenv";
dotenv.config();
import db from "../database/pool.js";
import { createTables } from "./createTables.js";

console.log(process.env.DB_PROVIDER);

const setupDatabase = async () => {
  try {
    await createTables(db);
    console.log("Database tables created or already exist");
  } catch (err) {
    console.error({ error: "Error executing DB setup:", err });
  }
};


export default setupDatabase;
