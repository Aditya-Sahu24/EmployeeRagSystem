import fs from "fs";
import dotenv from "dotenv";
import database from "../src/config/database.js";
import EmbeddingService from "../src/services/embeddingService.js";

dotenv.config();

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to database
    await database.connect();
    const collection = await database.getCollection("employee_embeddings");

    // Read employee data
    const fileData = fs.readFileSync("./seed/employee_data.json", "utf-8");
    const employeeArray = JSON.parse(fileData);
    console.log(`📄 Loaded ${employeeArray.length} employee records`);

    // Clear existing data
    await collection.deleteMany({});
    console.log("🗑️ Cleared existing employee embeddings");

    // Generate embeddings and insert
    const documents = [];
    for (const record of employeeArray) {
      console.log(`🔄 Processing ${record.name}...`);

      const { text, embedding } =
        await EmbeddingService.generateEmployeeEmbedding(record);

      documents.push({
        ...record,
        text,
        embedding,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Generated embedding for ${record.name}`);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Rate limiting
    }

    // Insert all documents
    if (documents.length > 0) {
      await collection.insertMany(documents);
      console.log(
        `🎯 Inserted ${documents.length} employee embeddings into MongoDB`,
      );
    }

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding error:", error);
  } finally {
    await database.disconnect();
  }
}

seedDatabase();
