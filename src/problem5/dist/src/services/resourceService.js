"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceService = void 0;
class ResourceService {
    constructor(resourceRepository) {
        this.resourceRepository = resourceRepository;
    }
    async createResource(data) {
        this.validateCreateRequest(data);
        return await this.resourceRepository.create(data);
    }
    async getAllResources(filters) {
        return await this.resourceRepository.findAll(filters);
    }
    async getResourceById(id) {
        this.validateUUID(id);
        return await this.resourceRepository.findById(id);
    }
    async updateResource(id, data) {
        this.validateUUID(id);
        this.validateUpdateRequest(data);
        return await this.resourceRepository.update(id, data);
    }
    async deleteResource(id) {
        this.validateUUID(id);
        return await this.resourceRepository.delete(id);
    }
    validateCreateRequest(data) {
        if (!data.name || data.name.trim().length === 0) {
            throw new Error("Name is required");
        }
        if (!data.category || data.category.trim().length === 0) {
            throw new Error("Category is required");
        }
        if (data.name.length > 255) {
            throw new Error("Name must be less than 255 characters");
        }
        if (data.category.length > 100) {
            throw new Error("Category must be less than 100 characters");
        }
    }
    validateUpdateRequest(data) {
        if (data.name !== undefined &&
            (!data.name || data.name.trim().length === 0)) {
            throw new Error("Name cannot be empty");
        }
        if (data.category !== undefined &&
            (!data.category || data.category.trim().length === 0)) {
            throw new Error("Category cannot be empty");
        }
        if (data.name && data.name.length > 255) {
            throw new Error("Name must be less than 255 characters");
        }
        if (data.category && data.category.length > 100) {
            throw new Error("Category must be less than 100 characters");
        }
    }
    validateUUID(id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            throw new Error("Invalid resource ID format");
        }
    }
}
exports.ResourceService = ResourceService;
//# sourceMappingURL=resourceService.js.map