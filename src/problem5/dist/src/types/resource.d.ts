export interface Resource {
    id: string;
    name: string;
    description?: string;
    category: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export interface CreateResourceRequest {
    name: string;
    description?: string;
    category: string;
}
export interface UpdateResourceRequest {
    name?: string;
    description?: string;
    category?: string;
}
export interface ResourceFilters {
    category?: string;
    name?: string;
}
//# sourceMappingURL=resource.d.ts.map