const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");
const profileUpload = require("../middleware/profileUpload");
const { requireAuth } = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.get("/profile", requireAuth, authController.getProfile);
router.put("/profile", requireAuth, authController.updateProfile);

router.post(
    "/profile/photo",
    requireAuth,
    profileUpload.single("profilePhoto"),
    authController.uploadProfilePhoto
);

module.exports = router;