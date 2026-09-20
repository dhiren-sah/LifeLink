const express = require("express");
const path = require("path");

const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const authController = require("../controllers/authController");


// Home
router.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../views/index.html")
    );
});


// Login
router.get("/login", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../views/login.html")
    );
});


// Register
router.get("/register", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../views/register.html")
    );
});


// Forgot Password
router.get("/forgot-password", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../views/forgot-password.html")
    );
});


// Reset Password
router.get("/reset-password", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../views/reset-password.html")
    );
});


// Email Verification
router.get(
    "/verify-email",
    authController.verifyEmail
);


// Dashboard
router.get(
    "/dashboard",
    requireAuth,
    (req, res) => {

        res.sendFile(
            path.join(__dirname, "../views/dashboard.html")
        );

    }
);


// Admin Blood Inventory
router.get(
    "/admin/blood-inventory",
    requireAuth,
    (req, res, next) => {

        if (
            req.headers.accept?.includes("text/html")
        ) {

            return res.sendFile(
                path.join(
                    __dirname,
                    "../views/admin-blood-inventory.html"
                )
            );

        }

        next();

    }
);


// Blood Availability
router.get(
    "/blood-availability",
    requireAuth,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../views/blood-availability.html"
            )
        );

    }
);


// Blood Request
router.get(
    "/blood-request",
    requireAuth,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../views/blood-request.html"
            )
        );

    }
);


// Donors
router.get(
    "/donor",
    requireAuth,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../views/donor.html"
            )
        );

    }
);


// My Donations
router.get(
    "/my-donations",
    requireAuth,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../views/my-donations.html"
            )
        );

    }
);


// My Requests
router.get(
    "/my-requests",
    requireAuth,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../views/my-requests.html"
            )
        );

    }
);


// Hospitals
router.get(
    "/hospitals",
    requireAuth,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../views/hospitals.html"
            )
        );

    }
);


module.exports = router;