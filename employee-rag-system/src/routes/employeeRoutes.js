import express from "express";
import EmployeeController from "../controllers/employeeController.js";

const router = express.Router();

// CRUD Routes
router.post("/", EmployeeController.create);
router.get("/", EmployeeController.getAll);
router.get("/search", EmployeeController.search);
router.get("/statistics", EmployeeController.getStatistics);
router.get("/departments", EmployeeController.getDepartments);
router.get("/:id", EmployeeController.getById);
router.put("/:id", EmployeeController.update);
router.patch("/:id", EmployeeController.update);
router.delete("/:id", EmployeeController.delete);

export default router;
