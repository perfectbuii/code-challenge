"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = require("express");
const healthRoutes = () => {
    const router = (0, express_1.Router)();
    router.get("/health", (req, res) => {
        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    });
    router.get("/ready", async (req, res) => {
        try {
            // Add database health check here if needed
            res.json({
                status: "ready",
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            res.status(503).json({
                status: "not ready",
                timestamp: new Date().toISOString(),
            });
        }
    });
    return router;
};
exports.healthRoutes = healthRoutes;
//# sourceMappingURL=healthRoutes.js.map