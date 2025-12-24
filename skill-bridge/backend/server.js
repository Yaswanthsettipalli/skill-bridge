import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import opportunityRoutes from "./routes/OpportunityRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";



dotenv.config();
const app = express();

/* ===================== CORS ===================== */
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* ===================== TEST ROUTE ===================== */
app.get("/test", (req, res) => {
  res.send("SERVER TEST OK");
});

/* ===================== DB ===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected 🚀"))
  .catch((err) => console.error("MongoDB error:", err));

/* ===================== USER MODEL ===================== */
const userSchema = new mongoose.Schema(
  {
    username: String,
    fullName: String,
    email: { type: String, unique: true }, // 🔹 unique email
    password: String,
    userType: { type: String, enum: ["NGO", "Volunteer"] },
    location: String,
    organizationName: String,
    organizationDescription: String,
    websiteUrl: String,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

/* ===================== OPPORTUNITY MODEL ===================== */
const opportunitySchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    skills: [String],
    duration: String,
    location: String,
    status: { type: String, enum: ["OPEN", "CLOSED"], default: "OPEN" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Opportunity =
  mongoose.models.Opportunity ||
  mongoose.model("Opportunity", opportunitySchema);

/* ===================== APPLICATION MODEL ===================== */
const applicationSchema = new mongoose.Schema(
  {
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

const Application =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);

/* ===================== AUTH MIDDLEWARE ===================== */
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ===================== ROLE MIDDLEWARE ===================== */
const ngoOnly = (req, res, next) => {
  if (req.user.role !== "NGO") return res.status(403).json({ message: "NGO access only" });
  next();
};

/* ===================== APPLY OPPORTUNITY ===================== */
app.use("/api/applications", applicationRoutes);
app.post("/api/applications/apply", authMiddleware, async (req, res) => {
  try {
    // 🔹 Check duplicate email
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id, role: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    user.password = undefined;

    res.status(201).json({ user, token });
  } catch (err) {
    console.error("Apply error:", err);
    res.status(500).json({ message: "Failed to apply opportunity" });
  }
});

/* ===================== AUTH ROUTES ===================== */
app.post("/api/auth/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id, role: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Remove password before sending
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      message: "Signup successful",
      token,
      user: userObj,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});


app.post("/api/auth/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    user.password = undefined;

    res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

/* ===================== OPPORTUNITY ROUTES ===================== */
app.use(
  "/api/opportunities",
  opportunityRoutes(authMiddleware, ngoOnly)
);


/* ===================== SERVER ===================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
