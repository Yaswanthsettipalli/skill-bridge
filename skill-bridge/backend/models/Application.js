import mongoose from "mongoose";

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

    motivation: {
      type: String,
      required: true,
    },
    availability: {
      type: String,
      required: true,
    },
    skills: {
      type: String,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

/* Prevent duplicate applications */
applicationSchema.index(
  { opportunity: 1, volunteer: 1 },
  { unique: true }
);

export default mongoose.model("Application", applicationSchema);
