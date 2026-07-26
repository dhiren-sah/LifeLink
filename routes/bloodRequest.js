const express = require("express");

const router = express.Router();

const bloodRequestController = require("../controllers/bloodRequestController");

// Create Blood Request
router.post("/create", bloodRequestController.createRequest);

// Logged-in User Requests
router.get("/my", bloodRequestController.getMyRequests);

// All Requests (Admin)
router.get("/all", bloodRequestController.getAllRequests);

// Approve Request
router.put("/approve/:id", bloodRequestController.approveRequest);

// Reject Request
router.put("/reject/:id", bloodRequestController.rejectRequest);

// Complete Request
router.put("/complete/:id", bloodRequestController.completeRequest);

// Delete Request
router.delete("/delete/:id", bloodRequestController.deleteRequest);

module.exports = router;