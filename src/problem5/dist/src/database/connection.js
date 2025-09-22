"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closePool = exports.getPool = void 0;
const pg_1 = require("pg");
const database_1 = require("../config/database");
let pool;
const getPool = () => {
    if (!pool) {
        pool = new pg_1.Pool((0, database_1.getDatabaseConfig)());
    }
    return pool;
};
exports.getPool = getPool;
const closePool = async () => {
    if (pool) {
        await pool.end();
    }
};
exports.closePool = closePool;
//# sourceMappingURL=connection.js.map