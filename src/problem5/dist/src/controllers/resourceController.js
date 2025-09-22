"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceController = void 0;
class ResourceController {
    constructor(resourceService) {
        this.resourceService = resourceService;
        this.createResource = async (req, res, next) => {
            try {
                const data = req.body;
                const resource = await this.resourceService.createResource(data);
                res.status(201).json(resource);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllResources = async (req, res, next) => {
            try {
                const filters = {
                    category: req.query.category,
                    name: req.query.name,
                };
                const resources = await this.resourceService.getAllResources(filters);
                res.json(resources);
            }
            catch (error) {
                next(error);
            }
        };
        this.getResourceById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const resource = await this.resourceService.getResourceById(id);
                if (!resource) {
                    res.status(404).json({
                        error: "Not Found",
                        message: "Resource not found",
                    });
                    return;
                }
                res.json(resource);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateResource = async (req, res, next) => {
            try {
                const { id } = req.params;
                const data = req.body;
                const resource = await this.resourceService.updateResource(id, data);
                if (!resource) {
                    res.status(404).json({
                        error: "Not Found",
                        message: "Resource not found",
                    });
                    return;
                }
                res.json(resource);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteResource = async (req, res, next) => {
            try {
                const { id } = req.params;
                const deleted = await this.resourceService.deleteResource(id);
                if (!deleted) {
                    res.status(404).json({
                        error: "Not Found",
                        message: "Resource not found",
                    });
                    return;
                }
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ResourceController = ResourceController;
//# sourceMappingURL=resourceController.js.map