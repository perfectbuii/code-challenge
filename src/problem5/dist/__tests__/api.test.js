"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const connection_1 = require("../src/database/connection");
describe("Resource API", () => {
    let resourceId;
    beforeAll(async () => {
        // Wait for the app to initialize
        await new Promise((resolve) => setTimeout(resolve, 1000));
    });
    afterAll(async () => {
        await (0, connection_1.closePool)();
    });
    beforeEach(async () => {
        // Clean up database before each test
        const pool = (0, connection_1.getPool)();
        await pool.query("DELETE FROM resources");
    });
    describe("POST /api/resources", () => {
        it("should create a new resource", async () => {
            const resourceData = {
                name: "Test Resource",
                description: "A test resource",
                category: "Testing",
            };
            const response = await (0, supertest_1.default)(app_1.app)
                .post("/api/resources")
                .send(resourceData)
                .expect(201);
            expect(response.body).toMatchObject({
                name: resourceData.name,
                description: resourceData.description,
                category: resourceData.category,
            });
            expect(response.body.id).toBeDefined();
            expect(response.body.createdAt).toBeDefined();
            expect(response.body.updatedAt).toBeDefined();
            resourceId = response.body.id;
        });
        it("should return 400 for invalid data", async () => {
            const invalidData = {
                name: "",
                category: "Testing",
            };
            await (0, supertest_1.default)(app_1.app).post("/api/resources").send(invalidData).expect(400);
        });
    });
    describe("GET /api/resources", () => {
        beforeEach(async () => {
            // Create test resources
            await (0, supertest_1.default)(app_1.app).post("/api/resources").send({
                name: "Resource 1",
                description: "First resource",
                category: "Category A",
            });
            await (0, supertest_1.default)(app_1.app).post("/api/resources").send({
                name: "Resource 2",
                description: "Second resource",
                category: "Category B",
            });
        });
        it("should get all resources", async () => {
            const response = await (0, supertest_1.default)(app_1.app).get("/api/resources").expect(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toHaveProperty("name");
            expect(response.body[0]).toHaveProperty("category");
        });
        it("should filter resources by category", async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get("/api/resources?category=Category A")
                .expect(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].category).toBe("Category A");
        });
    });
    describe("GET /api/resources/:id", () => {
        beforeEach(async () => {
            const response = await (0, supertest_1.default)(app_1.app).post("/api/resources").send({
                name: "Test Resource",
                description: "A test resource",
                category: "Testing",
            });
            resourceId = response.body.id;
        });
        it("should get a resource by id", async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get(`/api/resources/${resourceId}`)
                .expect(200);
            expect(response.body.id).toBe(resourceId);
            expect(response.body.name).toBe("Test Resource");
        });
        it("should return 404 for non-existent resource", async () => {
            await (0, supertest_1.default)(app_1.app)
                .get("/api/resources/123e4567-e89b-12d3-a456-426614174000")
                .expect(404);
        });
        it("should return 400 for invalid id format", async () => {
            await (0, supertest_1.default)(app_1.app).get("/api/resources/invalid-id").expect(400);
        });
    });
    describe("PUT /api/resources/:id", () => {
        beforeEach(async () => {
            const response = await (0, supertest_1.default)(app_1.app).post("/api/resources").send({
                name: "Test Resource",
                description: "A test resource",
                category: "Testing",
            });
            resourceId = response.body.id;
        });
        it("should update a resource", async () => {
            const updateData = {
                name: "Updated Resource",
                description: "Updated description",
            };
            const response = await (0, supertest_1.default)(app_1.app)
                .put(`/api/resources/${resourceId}`)
                .send(updateData)
                .expect(200);
            expect(response.body.name).toBe("Updated Resource");
            expect(response.body.description).toBe("Updated description");
            expect(response.body.category).toBe("Testing"); // Should remain unchanged
        });
        it("should return 404 for non-existent resource", async () => {
            await (0, supertest_1.default)(app_1.app)
                .put("/api/resources/123e4567-e89b-12d3-a456-426614174000")
                .send({ name: "Updated Name" })
                .expect(404);
        });
    });
    describe("DELETE /api/resources/:id", () => {
        beforeEach(async () => {
            const response = await (0, supertest_1.default)(app_1.app).post("/api/resources").send({
                name: "Test Resource",
                description: "A test resource",
                category: "Testing",
            });
            resourceId = response.body.id;
        });
        it("should delete a resource", async () => {
            await (0, supertest_1.default)(app_1.app).delete(`/api/resources/${resourceId}`).expect(204);
            // Verify resource is deleted
            await (0, supertest_1.default)(app_1.app).get(`/api/resources/${resourceId}`).expect(404);
        });
        it("should return 404 for non-existent resource", async () => {
            await (0, supertest_1.default)(app_1.app)
                .delete("/api/resources/123e4567-e89b-12d3-a456-426614174000")
                .expect(404);
        });
    });
    describe("Health endpoints", () => {
        it("should return health status", async () => {
            const response = await (0, supertest_1.default)(app_1.app).get("/health").expect(200);
            expect(response.body.status).toBe("ok");
            expect(response.body.timestamp).toBeDefined();
        });
        it("should return ready status", async () => {
            const response = await (0, supertest_1.default)(app_1.app).get("/ready").expect(200);
            expect(response.body.status).toBe("ready");
        });
    });
});
//# sourceMappingURL=api.test.js.map