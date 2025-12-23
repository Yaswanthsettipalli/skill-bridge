

/* =========================
   APPLY TO OPPORTUNITY
   ========================= */
import Application from "../models/Application.js";
import Opportunity from "../models/Opportunity.js";

export const applyToOpportunity = async (req, res) => {
  try {
    const {
      opportunityId,
      motivation,
      availability,
      skills
    } = req.body;

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

    // Prevent duplicates
    const exists = await Application.findOne({
      opportunity: opportunityId,
      volunteer: volunteerId,
    });

    if (exists) {
      return res.status(400).json({
        message: "You have already applied for this opportunity",
      });
    }

    // ✅ STORE FORM DATA IN DATABASE
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
   GET APPLIED OPPORTUNITIES (FOR DISABLE BUTTON)
   ========================= */
export const getMyApplications = async (req, res) => {
  try {
    const volunteerId = req.user.id;

    const applications = await Application.find({
      volunteer: volunteerId,
    }).select("opportunity");

    // return only opportunity IDs
    const appliedIds = applications.map((app) =>
      app.opportunity.toString()
    );

    res.status(200).json(appliedIds);
  } catch (err) {
    console.error("Fetch applications error:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};
