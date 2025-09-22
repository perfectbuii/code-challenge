"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (error, req, res, next) => {
    logger_1.logger.error({
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.url,
        ip: req.ip,
    });
    if (error.message.includes("Invalid resource ID format")) {
        return res.status(400).json({
            error: "Bad Request",
            message: error.message,
        });
    }
    if (error.message.includes("required") ||
        error.message.includes("cannot be empty")) {
        return res.status(400).json({
            error: "Bad Request",
            message: error.message,
        });
    }
    res.status(500).json({
        error: "Internal Server Error",
        message: "Something went wrong",
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map