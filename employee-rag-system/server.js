// server.js
import app from "./src/app.js";
import database from "./src/config/database.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8080;

// Connect to database and start server
const startServer = async () => {
  try {
    await database.connect();

    app.listen(PORT, () => {
      console.log(`🚀 Employee RAG Server running on port ${PORT}`);
      console.log(`📝 API Endpoints:`);
      console.log(`   POST   /api/employees     - Create employee`);
      console.log(`   GET    /api/employees     - List employees`);
      console.log(`   GET    /api/employees/:id - Get employee`);
      console.log(`   PUT    /api/employees/:id - Update employee`);
      console.log(`   DELETE /api/employees/:id - Delete employee`);
      console.log(`   GET    /api/employees/search - Search employees`);
      console.log(`   POST   /api/rag/ask       - Ask RAG question`);
      console.log(`   GET    /health            - Health check`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🔌 Gracefully shutting down...");
  await database.disconnect();
  process.exit(0);
});

startServer();

// import app from "./src/app.js";
// import database from "./src/config/database.js";
// import dotenv from "dotenv";

// dotenv.config();

// const PORT = process.env.PORT || 8080;

// // Connect to database and start server
// const startServer = async () => {
//   try {
//     await database.connect();

//     app.listen(PORT, () => {
//       console.log(`🚀 Employee RAG Server running on port ${PORT}`);
//       console.log(`📝 API Endpoints:`);
//       console.log(`   POST   /api/employees     - Create employee`);
//       console.log(`   GET    /api/employees     - List employees`);
//       console.log(`   GET    /api/employees/:id - Get employee`);
//       console.log(`   PUT    /api/employees/:id - Update employee`);
//       console.log(`   DELETE /api/employees/:id - Delete employee`);
//       console.log(`   GET    /api/employees/search - Search employees`);
//       console.log(`   POST   /api/rag/ask       - Ask RAG question`);
//       console.log(`   GET    /health            - Health check`);
//     });
//   } catch (error) {
//     console.error("Failed to start server:", error);
//     process.exit(1);
//   }
// };

// // Graceful shutdown
// process.on("SIGINT", async () => {
//   console.log("\n🔌 Gracefully shutting down...");
//   await database.disconnect();
//   process.exit(0);
// });

// startServer();
