import express from "express";
import {
  applyToOpportunity,
  getMyApplications,
} from "../controllers/applicationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   APPLY
   ========================= */
router.post("/apply", authMiddleware, applyToOpportunity);

/* =========================
   GET MY APPLICATIONS
   ========================= */
router.get("/my", authMiddleware, getMyApplications);

export default router;
