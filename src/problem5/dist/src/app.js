"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = require("./database/connection");
const migrate_1 = require("./database/migrate");
const resourceRepository_1 = require("./repositories/resourceRepository");
const resourceService_1 = require("./services/resourceService");
const resourceController_1 = require("./controllers/resourceController");
const resourceRoutes_1 = require("./routes/resourceRoutes");
const logger_1 = require("./middleware/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_2 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const port = process.env.PORT || 3000;
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP",
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(limiter);
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_1.requestLogger);
// Initialize dependencies
const pool = (0, connection_1.getPool)();
const resourceRepository = new resourceRepository_1.ResourceRepository(pool);
const resourceService = new resourceService_1.ResourceService(resourceRepository);
const resourceController = new resourceController_1.ResourceController(resourceService);
// Routes
app.use("/api/resources", (0, resourceRoutes_1.createResourceRoutes)(resourceController));
// Error handling
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: "Route not found",
    });
});
const startServer = async () => {
    try {
        // Initialize database
        await (0, migrate_1.createTables)();
        logger_2.logger.info("Database initialized successfully");
        app.listen(port, () => {
            logger_2.logger.info(`Server running on port ${port}`);
        });
    }
    catch (error) {
        logger_2.logger.error("Failed to start server:", error);
        process.exit(1);
    }
};
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=app.js.map