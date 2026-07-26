const express = require("express");
const router = express.Router();

const {
    getAllBloodAvailability
} = require("../controllers/bloodAvailabilityController");

// GET All Blood Availability Records
router.get("/", getAllBloodAvailability);

module.exports = router;