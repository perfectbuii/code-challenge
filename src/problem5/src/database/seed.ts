import { getPool } from "./connection";

const seedData = async (): Promise<void> => {
  const pool = getPool();

  try {
    // Check if data already exists
    const existingData = await pool.query("SELECT COUNT(*) FROM resources");
    if (parseInt(existingData.rows[0].count) > 0) {
      console.log("Database already has data, skipping seed");
      return;
    }

    // Insert sample data
    const sampleResources = [
      {
        name: "User Management API",
        description: "API for managing user accounts",
        category: "Authentication",
      },
      {
        name: "Payment Gateway",
        description: "Integration with payment services",
        category: "Finance",
      },
      {
        name: "Email Service",
        description: "Service for sending emails",
        category: "Communication",
      },
      {
        name: "File Storage",
        description: "Cloud file storage solution",
        category: "Storage",
      },
      {
        name: "Analytics Dashboard",
        description: "Real-time analytics dashboard",
        category: "Analytics",
      },
    ];

    for (const resource of sampleResources) {
      await pool.query(
        "INSERT INTO resources (name, description, category) VALUES ($1, $2, $3)",
        [resource.name, resource.description, resource.category]
      );
    }

    console.log("Sample data inserted successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
};

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedData };
