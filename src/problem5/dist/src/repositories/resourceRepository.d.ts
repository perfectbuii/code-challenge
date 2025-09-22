import { Pool } from "pg";
import { Resource, CreateResourceRequest, UpdateResourceRequest, ResourceFilters } from "../types/resource";
export declare class ResourceRepository {
    private pool;
    constructor(pool: Pool);
    create(data: CreateResourceRequest): Promise<Resource>;
    findAll(filters?: ResourceFilters): Promise<Resource[]>;
    findById(id: string): Promise<Resource | null>;
    update(id: string, data: UpdateResourceRequest): Promise<Resource | null>;
    delete(id: string): Promise<boolean>;
    private mapRowToResource;
}
//# sourceMappingURL=resourceRepository.d.ts.map