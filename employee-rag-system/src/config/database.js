import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

class Database {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    if (this.db) return this.db;

    try {
      this.client = new MongoClient(process.env.MONGO_URI);
      await this.client.connect();
      this.db = this.client.db("rag");
      console.log("✅ MongoDB connected successfully");
      return this.db;
    } catch (error) {
      console.error("❌ MongoDB connection error:", error.message);
      throw error;
    }
  }

  async getCollection(collectionName) {
    if (!this.db) {
      await this.connect();
    }
    return this.db.collection(collectionName);
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log("🔌 MongoDB disconnected");
    }
  }
}

export default new Database();
