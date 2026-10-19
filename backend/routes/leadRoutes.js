
const express = require("express");
const Lead = require("../models/Lead");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Protect every lead endpoint with admin authentication.
router.use(verifyToken);

// GET all leads
router.get("/", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    console.error("Fetch leads error:", error.message);
    res.status(500).json({ message: "Failed to fetch leads" });
  }
});

// GET one lead by ID
router.get("/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: "Invalid lead ID" });
  }
});

// CREATE a lead
router.post("/", async (req, res) => {
  try {
    const { name, email, source, status, notes, followUpDate } = req.body;

    if (!name || !email || !source) {
      return res.status(400).json({
        message: "Name, email, and source are required",
      });
    }

    const lead = await Lead.create({
      name,
      email,
      source,
      status: status || "New",
      notes: notes || "",
      followUpDate: followUpDate || null,
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error("Create lead error:", error.message);
    res.status(400).json({ message: "Failed to create lead" });
  }
});

// UPDATE a lead
router.put("/:id", async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "email",
      "source",
      "status",
      "notes",
      "followUpDate",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (error) {
    console.error("Update lead error:", error.message);
    res.status(400).json({ message: "Failed to update lead" });
  }
});

// DELETE a lead
router.delete("/:id", async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete lead" });
  }
});

module.exports = router;
