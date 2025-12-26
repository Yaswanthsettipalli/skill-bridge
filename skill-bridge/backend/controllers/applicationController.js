import Application from "../models/Application.js";
import Opportunity from "../models/Opportunity.js";

/* =========================
   VOLUNTEER: APPLY TO OPPORTUNITY
   ========================= */
export const applyToOpportunity = async (req, res) => {
  try {
    const { opportunityId, motivation, availability, skills } = req.body;
    const volunteerId = req.user.id;

    // Validate opportunity
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    if (opportunity.status === "CLOSED") {
      return res.status(400).json({ message: "Opportunity is closed" });
    }

    if (opportunity.createdBy.toString() === volunteerId) {
      return res
        .status(403)
        .json({ message: "You cannot apply to your own opportunity" });
    }

    // Prevent duplicate application
    const exists = await Application.findOne({
      opportunity: opportunityId,
      volunteer: volunteerId,
    });

    if (exists) {
      return res.status(400).json({
        message: "You have already applied for this opportunity",
      });
    }

    // Store application form data
    const application = await Application.create({
      opportunity: opportunityId,
      volunteer: volunteerId,
      motivation,
      availability,
      skills,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (err) {
    // Handle unique index violation
    if (err.code === 11000) {
      return res.status(400).json({
        message: "You have already applied for this opportunity",
      });
    }

    console.error("Apply error:", err);
    res.status(500).json({ message: "Failed to submit application" });
  }
};

/* =========================
   VOLUNTEER: GET APPLIED OPPORTUNITY IDS
   (Used to disable Apply button)
   ========================= */
export const getMyApplications = async (req, res) => {
  try {
    const volunteerId = req.user.id;

    const applications = await Application.find({
      volunteer: volunteerId,
    }).select("opportunity");

    const appliedIds = applications.map((app) =>
      app.opportunity.toString()
    );

    res.status(200).json(appliedIds);
  } catch (err) {
    console.error("Fetch applications error:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

/* =========================
   VOLUNTEER: VIEW APPLICATION STATUS
   ========================= */
export const getMyApplicationsWithStatus = async (req, res) => {
  try {
    const volunteerId = req.user.id;

    const applications = await Application.find({
      volunteer: volunteerId,
    })
      .populate("opportunity", "title")
      .select("status opportunity createdAt");

    res.status(200).json(applications);
  } catch (err) {
    console.error("Fetch application status error:", err);
    res.status(500).json({ message: "Failed to fetch application status" });
  }
};

/* =========================
   NGO: VIEW APPLICATIONS FOR THEIR OPPORTUNITIES
   ========================= */
export const getApplicationsForNGO = async (req, res) => {
  try {
    const ngoId = req.user.id;

    const opportunities = await Opportunity.find({
      createdBy: ngoId,
    }).select("_id");

    const applications = await Application.find({
      opportunity: { $in: opportunities },
    })
      .populate("volunteer", "fullName email")
      .populate("opportunity", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (err) {
    console.error("Fetch NGO applications error:", err);
    res.status(500).json({ message: "Failed to fetch NGO applications" });
  }
};

/* =========================
   NGO: ACCEPT / REJECT APPLICATION
   ========================= */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(applicationId)
      .populate("opportunity");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Ensure NGO owns the opportunity
    if (
      application.opportunity.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      message: `Application ${status.toLowerCase()}`,
      application,
    });
  } catch (err) {
    console.error("Update application status error:", err);
    res.status(500).json({ message: "Failed to update application status" });
  }
};
