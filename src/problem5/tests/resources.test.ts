import request from "supertest";
import { app } from "../src/app";
import { getPool } from "../src/database/connection";

describe("Resources API", () => {
  let resourceId: string;

  beforeEach(async () => {
    // Clean up database before each test - use hard delete for test cleanup
    const pool = getPool();
    await pool.query("DELETE FROM resources WHERE category = $1", ["Test"]);
  });

  afterAll(async () => {
    // Close database connection
    const pool = getPool();
    await pool.end();
  });

  describe("POST /api/resources", () => {
    it("should create a new resource", async () => {
      const resourceData = {
        name: "Test Resource",
        description: "A test resource",
        category: "Test",
      };

      const response = await request(app)
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
        category: "Test",
      };

      const response = await request(app)
        .post("/api/resources")
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Validation Error");
    });

    it("should return 400 for missing required fields", async () => {
      const invalidData = {
        description: "Missing name and category",
      };

      await request(app).post("/api/resources").send(invalidData).expect(400);
    });
  });

  describe("GET /api/resources", () => {
    beforeEach(async () => {
      // Create test resources
      await request(app).post("/api/resources").send({
        name: "Resource 1",
        description: "First resource",
        category: "Test",
      });

      await request(app).post("/api/resources").send({
        name: "Resource 2",
        description: "Second resource",
        category: "Test",
      });
    });

    it("should get all resources", async () => {
      const response = await request(app).get("/api/resources").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      // Check if our test resources are included
      const testResources = response.body.filter(
        (r: any) => r.category === "Test"
      );
      expect(testResources).toHaveLength(2);
    });

    it("should filter resources by category", async () => {
      const response = await request(app)
        .get("/api/resources?category=Test")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.every((r: any) => r.category === "Test")).toBe(true);
    });

    it("should filter resources by name", async () => {
      const response = await request(app)
        .get("/api/resources?name=Resource 1")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe("Resource 1");
    });
  });

  describe("GET /api/resources/:id", () => {
    beforeEach(async () => {
      const response = await request(app).post("/api/resources").send({
        name: "Test Resource",
        description: "A test resource",
        category: "Test",
      });
      resourceId = response.body.id;
    });

    it("should get a resource by id", async () => {
      const response = await request(app)
        .get(`/api/resources/${resourceId}`)
        .expect(200);

      expect(response.body.id).toBe(resourceId);
      expect(response.body.name).toBe("Test Resource");
    });

    it("should return 404 for non-existent resource", async () => {
      await request(app)
        .get("/api/resources/123e4567-e89b-12d3-a456-426614174000")
        .expect(404);
    });

    it("should return 400 for invalid id format", async () => {
      await request(app).get("/api/resources/invalid-id").expect(400);
    });
  });

  describe("PUT /api/resources/:id", () => {
    beforeEach(async () => {
      const response = await request(app).post("/api/resources").send({
        name: "Test Resource",
        description: "A test resource",
        category: "Test",
      });
      resourceId = response.body.id;
    });

    it("should update a resource", async () => {
      const updateData = {
        name: "Updated Resource",
        description: "Updated description",
      };

      const response = await request(app)
        .put(`/api/resources/${resourceId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe("Updated Resource");
      expect(response.body.description).toBe("Updated description");
      expect(response.body.category).toBe("Test"); // Should remain unchanged
      expect(response.body.updatedAt).not.toBe(response.body.createdAt);
    });

    it("should return 404 for non-existent resource", async () => {
      await request(app)
        .put("/api/resources/123e4567-e89b-12d3-a456-426614174000")
        .send({ name: "Updated Name" })
        .expect(404);
    });

    it("should return 400 for invalid data", async () => {
      await request(app)
        .put(`/api/resources/${resourceId}`)
        .send({ name: "" })
        .expect(400);
    });
  });

  describe("DELETE /api/resources/:id", () => {
    beforeEach(async () => {
      const response = await request(app).post("/api/resources").send({
        name: "Test Resource",
        description: "A test resource",
        category: "Test",
      });
      resourceId = response.body.id;
    });

    it("should delete a resource", async () => {
      await request(app).delete(`/api/resources/${resourceId}`).expect(204);

      // Verify resource is deleted (not returned in API)
      await request(app).get(`/api/resources/${resourceId}`).expect(404);
    });

    it("should soft delete a resource (verify it still exists in database)", async () => {
      // Delete the resource via API
      await request(app).delete(`/api/resources/${resourceId}`).expect(204);

      // Verify resource is not returned in API
      await request(app).get(`/api/resources/${resourceId}`).expect(404);

      // Verify resource still exists in database with deleted_at set
      const pool = getPool();
      const result = await pool.query("SELECT * FROM resources WHERE id = $1", [
        resourceId,
      ]);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].deleted_at).not.toBeNull();
      expect(result.rows[0].name).toBe("Test Resource");
    });

    it("should return 404 for non-existent resource", async () => {
      await request(app)
        .delete("/api/resources/123e4567-e89b-12d3-a456-426614174000")
        .expect(404);
    });

    it("should return 400 for invalid id format", async () => {
      await request(app).delete("/api/resources/invalid-id").expect(400);
    });
  });
});
