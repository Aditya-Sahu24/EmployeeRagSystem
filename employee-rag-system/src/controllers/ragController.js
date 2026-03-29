// src/controllers/ragController.js
import EmployeeModel from "../models/Employee.js";
import EmbeddingService from "../services/embeddingService.js";
import LLMService from "../services/llmService.js";

class RAGController {
  constructor() {
    this.ask = this.ask.bind(this);
    this.filterResultsByIntent = this.filterResultsByIntent.bind(this);
  }

  async ask(req, res, next) {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      console.log(`📝 Processing query: "${query}"`);

      // Get ALL employees for comprehensive queries
      let allEmployees = await EmployeeModel.findAll({}, 1, 100);
      let results = allEmployees.employees;

      // If it's a specific query, try to filter
      if (
        !query.toLowerCase().includes("all") &&
        !query.toLowerCase().includes("analytics") &&
        !query.toLowerCase().includes("report")
      ) {
        // Try keyword search for specific queries
        results = await EmployeeModel.keywordSearch(query, 10);

        // If keyword search finds nothing, try vector search
        if (results.length === 0) {
          console.log("No keyword results, trying vector search...");
          const queryEmbedding = await EmbeddingService.getEmbedding(query);
          results = await EmployeeModel.vectorSearch(queryEmbedding, 10);
        }
      }

      if (results.length === 0 && allEmployees.employees.length === 0) {
        return res.json({
          success: true,
          answer: "No employee information found in the database.",
          relevantEmployees: [],
        });
      }

      // Use all employees for analytics/report queries
      const finalResults =
        query.toLowerCase().includes("analytics") ||
        query.toLowerCase().includes("report")
          ? allEmployees.employees
          : results;

      console.log(`✅ Using ${finalResults.length} results`);

      // Generate answer using LLM service
      const answer = await LLMService.getAnswerWithContext(query, finalResults);

      res.json({
        success: true,
        answer,
        relevantEmployees: finalResults.slice(0, 5).map((r) => ({
          name: r.name,
          employeeId: r.employeeId,
          department: r.department,
          position: r.position,
          email: r.email,
          phone: r.phone,
          skills: r.skills,
          performance: r.performance,
        })),
      });
    } catch (error) {
      console.error("RAG Error:", error);
      next(error);
    }
  }

  filterResultsByIntent(query, results) {
    // This method is now simplified since we handle everything in LLM service
    return results;
  }
}

const ragController = new RAGController();
export default ragController;

// // src/controllers/ragController.js
// import EmployeeModel from "../models/Employee.js"; // Change from EmployeeModel.js to Employee.js
// import EmbeddingService from "../services/embeddingService.js";
// import LLMService from "../services/llmService.js";

// class RAGController {
//   constructor() {
//     // Bind methods to ensure 'this' context is preserved
//     this.ask = this.ask.bind(this);
//     this.filterResultsByIntent = this.filterResultsByIntent.bind(this);
//   }

//   async ask(req, res, next) {
//     try {
//       const { query } = req.body;

//       if (!query) {
//         return res.status(400).json({ error: "Query is required" });
//       }

//       console.log(`📝 Processing query: "${query}"`);

//       // First try keyword search for specific queries
//       let results = await EmployeeModel.keywordSearch(query, 10);

//       // If keyword search finds nothing, try vector search
//       if (results.length === 0) {
//         console.log("No keyword results, trying vector search...");
//         const queryEmbedding = await EmbeddingService.getEmbedding(query);
//         results = await EmployeeModel.vectorSearch(queryEmbedding, 10);
//       }

//       if (results.length === 0) {
//         return res.json({
//           success: true,
//           answer:
//             "No relevant employee information found. Please try a different question.",
//           relevantEmployees: [],
//         });
//       }

//       console.log(`✅ Found ${results.length} total results`);

//       // Filter results based on query intent
//       const filteredResults = this.filterResultsByIntent(query, results);
//       console.log(`🎯 Filtered to ${filteredResults.length} specific results`);

//       // Generate answer using LLM service with filtered results
//       const answer = await LLMService.getAnswerWithContext(
//         query,
//         filteredResults,
//       );

//       res.json({
//         success: true,
//         answer,
//         relevantEmployees: filteredResults.map((r) => ({
//           name: r.name,
//           employeeId: r.employeeId,
//           department: r.department,
//           position: r.position,
//           email: r.email,
//           phone: r.phone,
//           skills: r.skills,
//           performance: r.performance,
//           age: r.age,
//           salary: r.salary,
//           joiningDate: r.joiningDate,
//           leaveBalance: r.leaveBalance,
//           address: r.address,
//           projects: r.projects,
//         })),
//       });
//     } catch (error) {
//       console.error("RAG Error:", error);
//       next(error);
//     }
//   }

//   filterResultsByIntent(query, results) {
//     const lowerQuery = query.toLowerCase();

//     console.log(`🔍 Filtering results for query: "${query}"`);
//     console.log(`📊 Results count before filtering: ${results.length}`);

//     // Check for specific employee name
//     for (const emp of results) {
//       if (lowerQuery.includes(emp.name.toLowerCase())) {
//         console.log(`🎯 Filtering to specific employee: ${emp.name}`);
//         return [emp];
//       }
//     }

//     // Check for employee ID (e.g., EMP1001, EMP1004, etc.)
//     const empIdMatch = query.match(/EMP\d+/i);
//     if (empIdMatch) {
//       const empId = empIdMatch[0];
//       console.log(`🔍 Looking for employee ID: ${empId}`);
//       const matched = results.find((r) => r.employeeId === empId);
//       if (matched) {
//         console.log(`🎯 Found employee with ID: ${empId}`);
//         return [matched];
//       }
//     }

//     // Check for phone number (10 digits)
//     const phoneMatch = query.match(/\d{10}/);
//     if (phoneMatch) {
//       const phone = phoneMatch[0];
//       console.log(`🔍 Looking for phone number: ${phone}`);
//       const matched = results.find((r) => r.phone === phone);
//       if (matched) {
//         console.log(`🎯 Found employee with phone: ${phone}`);
//         return [matched];
//       }
//     }

//     // Check for specific department
//     const departments = [
//       "engineering",
//       "marketing",
//       "human resources",
//       "hr",
//       "sales",
//       "finance",
//       "operations",
//       "it",
//       "support",
//     ];
//     for (const dept of departments) {
//       if (lowerQuery.includes(dept)) {
//         const deptResults = results.filter(
//           (r) => r.department && r.department.toLowerCase().includes(dept),
//         );
//         if (deptResults.length > 0) {
//           console.log(
//             `🎯 Filtering to department: ${dept}, found ${deptResults.length} employees`,
//           );
//           return deptResults;
//         }
//       }
//     }

//     // Check for specific position/role
//     const positions = [
//       "senior",
//       "junior",
//       "lead",
//       "manager",
//       "director",
//       "developer",
//       "engineer",
//       "analyst",
//       "specialist",
//       "coordinator",
//     ];
//     for (const pos of positions) {
//       if (lowerQuery.includes(pos)) {
//         const posResults = results.filter(
//           (r) => r.position && r.position.toLowerCase().includes(pos),
//         );
//         if (posResults.length > 0) {
//           console.log(
//             `🎯 Filtering to position: ${pos}, found ${posResults.length} employees`,
//           );
//           return posResults;
//         }
//       }
//     }

//     // Check for skill query
//     if (
//       lowerQuery.includes("skill") ||
//       lowerQuery.includes("knows") ||
//       lowerQuery.includes("technology") ||
//       lowerQuery.includes("expert")
//     ) {
//       console.log(`🎯 Keeping all results for skills query`);
//       return results.slice(0, 5);
//     }

//     // Check for contact information query
//     if (
//       lowerQuery.includes("contact") ||
//       lowerQuery.includes("phone") ||
//       lowerQuery.includes("email") ||
//       lowerQuery.includes("number")
//     ) {
//       console.log(`🎯 Keeping results for contact query`);
//       return results.slice(0, 3);
//     }

//     // Return top 3 most relevant for general queries
//     console.log(
//       `🎯 Returning top ${Math.min(3, results.length)} results for general query`,
//     );
//     return results.slice(0, 3);
//   }
// }

// // Create and export a singleton instance
// const ragController = new RAGController();
// export default ragController;

// // src/controllers/ragController.js
// import EmployeeModel from "../models/Employee.js";
// import EmbeddingService from "../services/embeddingService.js";
// import LLMService from "../services/llmService.js";

// class RAGController {
//   async ask(req, res, next) {
//     try {
//       const { query } = req.body;

//       if (!query) {
//         return res.status(400).json({ error: "Query is required" });
//       }

//       console.log(`📝 Processing query: "${query}"`);

//       // 1. Generate query embedding
//       const queryEmbedding = await EmbeddingService.getEmbedding(query);

//       // 2. Search relevant employees
//       const results = await EmployeeModel.vectorSearch(queryEmbedding, 5);

//       if (results.length === 0) {
//         return res.json({
//           success: true,
//           answer:
//             "No relevant employee information found. Please try a different question.",
//           relevantEmployees: [],
//         });
//       }

//       console.log(`✅ Found ${results.length} relevant employees`);

//       // 3. Combine context
//       const context = results.map((r) => r.text).join("\n\n---\n\n");

//       // 4. Generate answer using our smart LLM service
//       const answer = await LLMService.getAnswer(query, context);

//       // 5. Return response
//       res.json({
//         success: true,
//         answer,
//         relevantEmployees: results.map((r) => ({
//           name: r.name,
//           employeeId: r.employeeId,
//           department: r.department,
//           position: r.position,
//           email: r.email,
//           phone: r.phone,
//           relevanceScore: r.score,
//         })),
//       });
//     } catch (error) {
//       console.error("RAG Error:", error);
//       next(error);
//     }
//   }
// }

// export default new RAGController();
