import winston from "winston";

const logLevel = process.env.LOG_LEVEL || "info";

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "resource-api" },
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          let log = `${timestamp} [${service}] ${level}: ${message}`;
          if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta, null, 2)}`;
          }
          return log;
        })
      ),
    })
  );
}
