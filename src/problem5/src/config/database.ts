import dotenv from "dotenv";

dotenv.config();

export const config = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5433", 10),
  database: process.env.DB_NAME || "problem5_db",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "password123",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const parseConnectionString = (connectionString: string) => {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    port: parseInt(url.port, 10) || 5432,
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
};

export const getDatabaseConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    return parseConnectionString(databaseUrl);
  }
  return config;
};
