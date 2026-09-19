const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");
const profileUpload = require("../middleware/profileUpload");
const { requireAuth } = require("../middleware/auth");


// ==============================
// AUTHENTICATION
// ==============================

// Register
router.post(
    "/register",
    authController.register
);

// Login
router.post(
    "/login",
    authController.login
);

// Logout
router.post(
    "/logout",
    authController.logout
);


// ==============================
// FORGOT PASSWORD
// ==============================

// Request password reset email
router.post(
    "/forgot-password",
    authController.requestPasswordReset
);

// Reset password using token
router.post(
    "/reset-password",
    authController.resetPassword
);


// ==============================
// PROFILE
// ==============================

// Get profile
router.get(
    "/profile",
    requireAuth,
    authController.getProfile
);

// Update profile
router.put(
    "/profile",
    requireAuth,
    authController.updateProfile
);

// Upload profile photo
router.post(
    "/profile/photo",
    requireAuth,
    profileUpload.single("profilePhoto"),
    authController.uploadProfilePhoto
);


module.exports = router;