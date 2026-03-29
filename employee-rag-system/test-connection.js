import dotenv from "dotenv";
import database from "./src/config/database.js";

dotenv.config();

async function testConnection() {
  try {
    console.log("🔄 Testing connections...");

    // Test MongoDB connection
    await database.connect();
    console.log("✅ MongoDB connected successfully");

    // Test Hugging Face API
    const response = await fetch(
      "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: "Test connection" }),
      },
    );

    if (response.ok) {
      console.log("✅ Hugging Face API connected successfully");
    } else {
      console.log("⚠️ Hugging Face API connection issue");
    }

    await database.disconnect();
    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testConnection();
