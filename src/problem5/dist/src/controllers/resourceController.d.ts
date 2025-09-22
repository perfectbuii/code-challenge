import { Request, Response, NextFunction } from "express";
import { ResourceService } from "../services/resourceService";
export declare class ResourceController {
    private resourceService;
    constructor(resourceService: ResourceService);
    createResource: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllResources: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getResourceById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateResource: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteResource: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=resourceController.d.ts.map