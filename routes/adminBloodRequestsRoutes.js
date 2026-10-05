const express = require("express");

const router =
    express.Router();


const adminBloodRequestsController =
    require(
        "../controllers/adminBloodRequestsController"
    );


const {
    requireAuth,
    requireAdmin
} = require("../middleware/auth");


// =====================================================
// GET ALL BLOOD REQUESTS
// GET /api/admin/blood-requests
// =====================================================

router.get(
    "/",
    requireAuth,
    requireAdmin,
    adminBloodRequestsController.getRequests
);


// =====================================================
// GET SINGLE BLOOD REQUEST
// GET /api/admin/blood-requests/:id
// =====================================================

router.get(
    "/:id",
    requireAuth,
    requireAdmin,
    adminBloodRequestsController.getRequest
);


// =====================================================
// UPDATE BLOOD REQUEST STATUS
// PUT /api/admin/blood-requests/:id
// =====================================================

router.put(
    "/:id",
    requireAuth,
    requireAdmin,
    adminBloodRequestsController.updateRequest
);


module.exports = router;