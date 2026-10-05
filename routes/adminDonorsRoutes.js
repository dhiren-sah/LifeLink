const express = require("express");

const router = express.Router();

const adminDonorsController =
    require("../controllers/adminDonorsController");

const {
    requireAuth,
    requireAdmin
} = require("../middleware/auth");


// =====================================================
// GET ALL DONORS
// GET /api/admin/donors
// =====================================================

router.get(
    "/",
    requireAuth,
    requireAdmin,
    adminDonorsController.getDonors
);


// =====================================================
// GET SINGLE DONOR
// GET /api/admin/donors/:id
// =====================================================

router.get(
    "/:id",
    requireAuth,
    requireAdmin,
    adminDonorsController.getDonor
);


// =====================================================
// UPDATE DONOR
// PUT /api/admin/donors/:id
// =====================================================

router.put(
    "/:id",
    requireAuth,
    requireAdmin,
    adminDonorsController.updateDonor
);


// =====================================================
// DELETE DONOR
// DELETE /api/admin/donors/:id
// =====================================================

router.delete(
    "/:id",
    requireAuth,
    requireAdmin,
    adminDonorsController.deleteDonor
);


module.exports = router;