"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = exports.parseConnectionString = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5433", 10),
    database: process.env.DB_NAME || "problem5_db",
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "password123",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};
const parseConnectionString = (connectionString) => {
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
exports.parseConnectionString = parseConnectionString;
const getDatabaseConfig = () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
        return (0, exports.parseConnectionString)(databaseUrl);
    }
    return exports.config;
};
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.js.map