const express = require("express");
const router = express.Router();

const {
    becomeDonor,
    cancelDonor,
    getDonors
} = require("../controllers/donorController");

// Become Donor
router.post("/become", becomeDonor);

// Cancel Donor
router.delete("/cancel", cancelDonor);

// Public Donor List
router.get("/", getDonors);

module.exports = router;