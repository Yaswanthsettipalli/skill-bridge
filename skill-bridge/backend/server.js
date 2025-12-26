import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import opportunityRoutes from "./routes/OpportunityRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";

dotenv.config();
const app = express();

/* ===================== MIDDLEWARE ===================== */
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);


app.use("/api/opportunities", opportunityRoutes);

app.use(express.json());

/* ===================== TEST ===================== */
app.get("/test", (req, res) => {
  res.send("SERVER TEST OK");
});

/* ===================== DATABASE ===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected 🚀"))
  .catch((err) => console.error("MongoDB error:", err));

/* ===================== ROUTES ===================== */

// Auth (Signup / Login)
app.use("/api/auth", authRoutes);

// Opportunities
app.use("/api/opportunities", opportunityRoutes);

// Applications (Apply, Status, NGO review)
app.use("/api/applications", applicationRoutes);

/* ===================== SERVER ===================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
