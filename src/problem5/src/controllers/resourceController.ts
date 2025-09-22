import { Request, Response, NextFunction } from "express";
import { ResourceService } from "../services/resourceService";
import {
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceFilters,
} from "../types/resource";

export class ResourceController {
  constructor(private resourceService: ResourceService) {}

  createResource = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: CreateResourceRequest = req.body;
      const resource = await this.resourceService.createResource(data);
      res.status(201).json(resource);
    } catch (error) {
      next(error);
    }
  };

  getAllResources = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters: ResourceFilters = {
        category: req.query.category as string,
        name: req.query.name as string,
      };

      const resources = await this.resourceService.getAllResources(filters);
      res.json(resources);
    } catch (error) {
      next(error);
    }
  };

  getResourceById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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
    } catch (error) {
      next(error);
    }
  };

  updateResource = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateResourceRequest = req.body;

      const resource = await this.resourceService.updateResource(id, data);

      if (!resource) {
        res.status(404).json({
          error: "Not Found",
          message: "Resource not found",
        });
        return;
      }

      res.json(resource);
    } catch (error) {
      next(error);
    }
  };

  deleteResource = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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
    } catch (error) {
      next(error);
    }
  };
}
