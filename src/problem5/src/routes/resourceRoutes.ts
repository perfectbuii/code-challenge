import { Router } from "express";
import { ResourceController } from "../controllers/resourceController";
import {
  validateCreateResource,
  validateUpdateResource,
  validateResourceId,
  validateResourceFilters,
} from "../middleware/validation";
import { handleValidationErrors } from "../middleware/validationHandler";

export const createResourceRoutes = (
  resourceController: ResourceController
): Router => {
  const router = Router();

  router.post(
    "/",
    validateCreateResource,
    handleValidationErrors,
    resourceController.createResource
  );

  router.get(
    "/",
    validateResourceFilters,
    handleValidationErrors,
    resourceController.getAllResources
  );

  router.get(
    "/:id",
    validateResourceId,
    handleValidationErrors,
    resourceController.getResourceById
  );

  router.put(
    "/:id",
    validateUpdateResource,
    handleValidationErrors,
    resourceController.updateResource
  );

  router.delete(
    "/:id",
    validateResourceId,
    handleValidationErrors,
    resourceController.deleteResource
  );

  return router;
};
