import express from "express";
import {
  applyToOpportunity,
  getMyApplications,
  getMyApplicationsWithStatus,
  getApplicationsForNGO,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import {
  authMiddleware,
  ngoOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   VOLUNTEER ROUTES
   ========================= */

// Apply to opportunity
router.post("/apply", authMiddleware, applyToOpportunity);

// Get applied opportunity IDs (disable Apply button)
router.get("/my", authMiddleware, getMyApplications);

// Get my applications with status (Volunteer dashboard)
router.get("/my-status", authMiddleware, getMyApplicationsWithStatus);

/* =========================
   NGO ROUTES
   ========================= */

// Get applications for NGO opportunities
router.get("/ngo", authMiddleware, ngoOnly, getApplicationsForNGO);

// Accept / Reject application
router.put(
  "/:id/status",
  authMiddleware,
  ngoOnly,
  updateApplicationStatus
);

export default router;
