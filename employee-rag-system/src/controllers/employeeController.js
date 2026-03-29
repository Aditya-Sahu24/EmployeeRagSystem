import EmployeeModel from "../models/Employee.js";
import EmbeddingService from "../services/embeddingService.js";

class EmployeeController {
  // Create employee
  async create(req, res, next) {
    try {
      const employeeData = req.body;

      // Validate required fields
      const requiredFields = ["name", "department", "position", "email"];
      for (const field of requiredFields) {
        if (!employeeData[field]) {
          return res.status(400).json({ error: `${field} is required` });
        }
      }

      // Set default values
      employeeData.skills = employeeData.skills || [];
      employeeData.projects = employeeData.projects || [];
      employeeData.leaveBalance = employeeData.leaveBalance || 15;
      employeeData.performance = employeeData.performance || "Good";
      employeeData.joiningDate =
        employeeData.joiningDate || new Date().toISOString().split("T")[0];

      // Generate embedding
      const { text, embedding } =
        await EmbeddingService.generateEmployeeEmbedding(employeeData);
      employeeData.text = text;
      employeeData.embedding = embedding;

      const employee = await EmployeeModel.create(employeeData);

      // Remove embedding from response
      delete employee.embedding;

      res.status(201).json({
        success: true,
        message: "Employee created successfully",
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all employees
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const department = req.query.department;

      let filter = {};
      if (department) {
        filter.department = department;
      }

      const result = await EmployeeModel.findAll(filter, page, limit);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get employee by ID
  async getById(req, res, next) {
    try {
      const employee = await EmployeeModel.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      res.json({
        success: true,
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update employee
  async update(req, res, next) {
    try {
      const employee = await EmployeeModel.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const updateData = req.body;

      // Check if we need to regenerate embedding
      const fieldsAffectingEmbedding = [
        "name",
        "department",
        "position",
        "skills",
        "projects",
        "performance",
      ];
      const needsNewEmbedding = fieldsAffectingEmbedding.some(
        (field) => updateData[field] !== undefined,
      );

      if (needsNewEmbedding) {
        const updatedEmployee = { ...employee, ...updateData };
        const { text, embedding } =
          await EmbeddingService.generateEmployeeEmbedding(updatedEmployee);
        updateData.text = text;
        updateData.embedding = embedding;
      }

      const updated = await EmployeeModel.update(req.params.id, updateData);

      if (!updated) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const updatedEmployee = await EmployeeModel.findById(req.params.id);

      res.json({
        success: true,
        message: "Employee updated successfully",
        data: updatedEmployee,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete employee
  async delete(req, res, next) {
    try {
      const deleted = await EmployeeModel.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ error: "Employee not found" });
      }

      res.json({
        success: true,
        message: "Employee deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Search employees
  async search(req, res, next) {
    try {
      const { q, department, skill } = req.query;
      const employees = await EmployeeModel.search({
        query: q,
        department,
        skill,
      });

      res.json({
        success: true,
        data: employees,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get statistics
  async getStatistics(req, res, next) {
    try {
      const statistics = await EmployeeModel.getStatistics();

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get departments
  async getDepartments(req, res, next) {
    try {
      const departments = await EmployeeModel.getDepartments();

      res.json({
        success: true,
        data: departments,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new EmployeeController();
