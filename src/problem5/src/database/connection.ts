import { Pool } from "pg";
import { getDatabaseConfig } from "../config/database";

let pool: Pool;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool(getDatabaseConfig());
  }
  return pool;
};

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
  }
};
