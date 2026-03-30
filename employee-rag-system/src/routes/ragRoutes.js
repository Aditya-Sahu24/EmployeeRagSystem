// src/routes/ragRoutes.js
import express from "express";
import RAGController from "../controllers/ragController.js";

const router = express.Router();

router.post("/ask", RAGController.ask);

export default router;
