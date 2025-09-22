"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResourceRoutes = void 0;
const express_1 = require("express");
const validation_1 = require("../middleware/validation");
const validationHandler_1 = require("../middleware/validationHandler");
const createResourceRoutes = (resourceController) => {
    const router = (0, express_1.Router)();
    router.post("/", validation_1.validateCreateResource, validationHandler_1.handleValidationErrors, resourceController.createResource);
    router.get("/", validation_1.validateResourceFilters, validationHandler_1.handleValidationErrors, resourceController.getAllResources);
    router.get("/:id", validation_1.validateResourceId, validationHandler_1.handleValidationErrors, resourceController.getResourceById);
    router.put("/:id", validation_1.validateUpdateResource, validationHandler_1.handleValidationErrors, resourceController.updateResource);
    router.delete("/:id", validation_1.validateResourceId, validationHandler_1.handleValidationErrors, resourceController.deleteResource);
    return router;
};
exports.createResourceRoutes = createResourceRoutes;
//# sourceMappingURL=resourceRoutes.js.map