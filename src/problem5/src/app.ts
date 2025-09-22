import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { getPool } from "./database/connection";
import { createTables } from "./database/migrate";
import { ResourceRepository } from "./repositories/resourceRepository";
import { ResourceService } from "./services/resourceService";
import { ResourceController } from "./controllers/resourceController";
import { createResourceRoutes } from "./routes/resourceRoutes";
import { requestLogger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Initialize dependencies
const pool = getPool();
const resourceRepository = new ResourceRepository(pool);
const resourceService = new ResourceService(resourceRepository);
const resourceController = new ResourceController(resourceService);

// Routes
app.use("/api/resources", createResourceRoutes(resourceController));

// Error handling
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "Route not found",
  });
});

const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await createTables();
    logger.info("Database initialized successfully");

    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export { app };
