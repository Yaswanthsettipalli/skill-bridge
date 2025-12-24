import express from "express";
import {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity
} from "../controllers/opportunityController.js";

const router = express.Router();

export default (authMiddleware, ngoOnly) => {
  // ✅ PUBLIC (AUTHENTICATED) ROUTES
  router.get("/", authMiddleware, getAllOpportunities);
  router.get("/:id", authMiddleware, getOpportunityById);

  // ✅ NGO ONLY ROUTES
  router.post("/", authMiddleware, ngoOnly, createOpportunity);
  router.put("/:id", authMiddleware, ngoOnly, updateOpportunity);
  router.delete("/:id", authMiddleware, ngoOnly, deleteOpportunity);

  // ✅ No wildcard 404 inside this router
  // Let server.js handle unmatched routes

  return router;
};
