const express = require("express");

const router = express.Router();

const adminDashboardController =
    require("../controllers/adminDashboardController");

const {
    requireAuth,
    requireAdmin
} = require("../middleware/auth");


// =========================================================
// ADMIN DASHBOARD
// GET /api/admin/dashboard
// =========================================================

router.get(
    "/dashboard",
    requireAuth,
    requireAdmin,
    adminDashboardController.getDashboardData
);


module.exports = router;