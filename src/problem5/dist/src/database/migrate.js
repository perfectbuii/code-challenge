"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTables = void 0;
const connection_1 = require("./connection");
const createTables = async () => {
    const pool = (0, connection_1.getPool)();
    try {
        await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await pool.query("CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category)");
        await pool.query("CREATE INDEX IF NOT EXISTS idx_resources_name ON resources(name)");
        await pool.query("CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at)");
        console.log("Database tables created successfully");
    }
    catch (error) {
        console.error("Error creating tables:", error);
        throw error;
    }
};
exports.createTables = createTables;
if (require.main === module) {
    createTables()
        .then(() => process.exit(0))
        .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
//# sourceMappingURL=migrate.js.map