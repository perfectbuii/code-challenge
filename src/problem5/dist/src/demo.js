"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const logger_1 = require("./utils/logger");
// This is a simple demo script to showcase the API functionality
const PORT = process.env.PORT || 3000;
// Start the server for demo purposes
const server = app_1.app.listen(PORT, () => {
    logger_1.logger.info(`🚀 Problem 5 API Server running on port ${PORT}`);
    logger_1.logger.info(`📋 Available endpoints:`);
    logger_1.logger.info(`   POST   /api/resources      - Create resource`);
    logger_1.logger.info(`   GET    /api/resources      - List resources`);
    logger_1.logger.info(`   GET    /api/resources/:id  - Get resource by ID`);
    logger_1.logger.info(`   PUT    /api/resources/:id  - Update resource`);
    logger_1.logger.info(`   DELETE /api/resources/:id  - Delete resource`);
    logger_1.logger.info(`   GET    /health             - Health check`);
    logger_1.logger.info(`   GET    /ready              - Readiness check`);
    logger_1.logger.info(`💡 Use curl or Postman to test the endpoints`);
});
// Graceful shutdown
process.on("SIGTERM", () => {
    logger_1.logger.info("SIGTERM received, shutting down gracefully");
    server.close(() => {
        logger_1.logger.info("Server closed");
        process.exit(0);
    });
});
process.on("SIGINT", () => {
    logger_1.logger.info("SIGINT received, shutting down gracefully");
    server.close(() => {
        logger_1.logger.info("Server closed");
        process.exit(0);
    });
});
//# sourceMappingURL=demo.js.map