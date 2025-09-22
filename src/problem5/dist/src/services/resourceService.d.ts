import { ResourceRepository } from "../repositories/resourceRepository";
import { Resource, CreateResourceRequest, UpdateResourceRequest, ResourceFilters } from "../types/resource";
export declare class ResourceService {
    private resourceRepository;
    constructor(resourceRepository: ResourceRepository);
    createResource(data: CreateResourceRequest): Promise<Resource>;
    getAllResources(filters?: ResourceFilters): Promise<Resource[]>;
    getResourceById(id: string): Promise<Resource | null>;
    updateResource(id: string, data: UpdateResourceRequest): Promise<Resource | null>;
    deleteResource(id: string): Promise<boolean>;
    private validateCreateRequest;
    private validateUpdateRequest;
    private validateUUID;
}
//# sourceMappingURL=resourceService.d.ts.map