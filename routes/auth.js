const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");
const profileUpload = require("../middleware/profileUpload");
const { requireAuth } = require("../middleware/auth");


// ==============================
// AUTHENTICATION
// ==============================

router.post(
    "/register",
    authController.register
);

router.post(
    "/login",
    authController.login
);


// ==============================
// ADMIN AUTHENTICATION
// ==============================

router.post(
    "/admin-login",
    authController.adminLogin
);


router.post(
    "/logout",
    authController.logout
);


// ==============================
// PASSWORD RESET
// ==============================

router.post(
    "/forgot-password",
    authController.requestPasswordReset
);

router.post(
    "/reset-password",
    authController.resetPassword
);


// ==============================
// PROFILE
// ==============================

router.get(
    "/profile",
    requireAuth,
    authController.getProfile
);

router.put(
    "/profile",
    requireAuth,
    authController.updateProfile
);

router.post(
    "/profile/photo",
    requireAuth,
    profileUpload.single("profilePhoto"),
    authController.uploadProfilePhoto
);


module.exports = router;