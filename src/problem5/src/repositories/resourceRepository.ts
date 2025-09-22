import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import {
  Resource,
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceFilters,
} from "../types/resource";

export class ResourceRepository {
  constructor(private pool: Pool) {}

  async create(data: CreateResourceRequest): Promise<Resource> {
    const id = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO resources (id, name, description, category, created_at, updated_at, deleted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      id,
      data.name,
      data.description || null,
      data.category,
      now,
      now,
      null,
    ];
    const result = await this.pool.query(query, values);

    return this.mapRowToResource(result.rows[0]);
  }

  async findAll(filters?: ResourceFilters): Promise<Resource[]> {
    let query = "SELECT * FROM resources WHERE deleted_at IS NULL";
    const values: any[] = [];
    let paramIndex = 1;

    if (filters?.category) {
      query += ` AND category = $${paramIndex}`;
      values.push(filters.category);
      paramIndex++;
    }

    if (filters?.name) {
      query += ` AND name ILIKE $${paramIndex}`;
      values.push(`%${filters.name}%`);
      paramIndex++;
    }

    query += " ORDER BY created_at DESC";

    const result = await this.pool.query(query, values);
    return result.rows.map((row) => this.mapRowToResource(row));
  }

  async findById(id: string): Promise<Resource | null> {
    const query =
      "SELECT * FROM resources WHERE id = $1 AND deleted_at IS NULL";
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToResource(result.rows[0]);
  }

  async update(
    id: string,
    data: UpdateResourceRequest
  ): Promise<Resource | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const updatedAt = new Date();
    const query = `
      UPDATE resources 
      SET name = $1, description = $2, category = $3, updated_at = $4
      WHERE id = $5
      RETURNING *
    `;

    const values = [
      data.name ?? existing.name,
      data.description ?? existing.description,
      data.category ?? existing.category,
      updatedAt,
      id,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToResource(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const query =
      "UPDATE resources SET deleted_at = $1 WHERE id = $2 AND deleted_at IS NULL";
    const deletedAt = new Date();
    const result = await this.pool.query(query, [deletedAt, id]);
    return (result.rowCount ?? 0) > 0;
  }

  private mapRowToResource(row: any): Resource {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}
