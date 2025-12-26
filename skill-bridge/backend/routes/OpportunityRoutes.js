import express from "express";
import {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
} from "../controllers/opportunityController.js";
import { authMiddleware, ngoOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   GET ALL OPPORTUNITIES
   ========================= */
router.get("/", authMiddleware, getAllOpportunities);

/* =========================
   GET OPPORTUNITY BY ID
   ========================= */
router.get("/:id", authMiddleware, getOpportunityById);

/* =========================
   CREATE OPPORTUNITY (NGO)
   ========================= */
router.post("/", authMiddleware, ngoOnly, createOpportunity);

/* =========================
   UPDATE OPPORTUNITY (NGO)
   ========================= */
router.put("/:id", authMiddleware, ngoOnly, updateOpportunity);

/* =========================
   DELETE OPPORTUNITY (NGO)
   ========================= */
router.delete("/:id", authMiddleware, ngoOnly, deleteOpportunity);

export default router;
