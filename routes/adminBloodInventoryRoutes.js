const express = require("express");

const router =
    express.Router();


const adminBloodInventoryController =
    require(
        "../controllers/adminBloodInventoryController"
    );


const {
    requireAuth,
    requireAdmin
} = require("../middleware/auth");


// =====================================================
// GET ALL BLOOD INVENTORY
// GET /api/admin/blood-inventory
// =====================================================

router.get(
    "/",
    requireAuth,
    requireAdmin,
    adminBloodInventoryController.getInventory
);


// =====================================================
// GET SINGLE BLOOD INVENTORY
// GET /api/admin/blood-inventory/:id
// =====================================================

router.get(
    "/:id",
    requireAuth,
    requireAdmin,
    adminBloodInventoryController.getInventoryItem
);


// =====================================================
// UPDATE BLOOD INVENTORY
// PUT /api/admin/blood-inventory/:id
// =====================================================

router.put(
    "/:id",
    requireAuth,
    requireAdmin,
    adminBloodInventoryController.updateInventory
);


module.exports = router;