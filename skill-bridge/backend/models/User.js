import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ["NGO", "Volunteer"],
      required: true,
    },
    location: String,
    organizationName: String,
    organizationDescription: String,
    websiteUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
