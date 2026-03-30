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
