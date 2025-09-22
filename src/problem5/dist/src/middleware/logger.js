"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("../utils/logger");
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger_1.logger.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration,
            userAgent: req.get("User-Agent"),
            ip: req.ip,
        });
    });
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=logger.js.map