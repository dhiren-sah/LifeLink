const express = require("express");
const path = require("path");

const router = express.Router();

const {
    requireAuth,
    requireAdmin
} = require("../middleware/auth");

const authController =
    require("../controllers/authController");


// =====================================================
// PUBLIC PAGES
// =====================================================

router.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../views/index.html"
        )
    );

});


router.get("/login", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../views/login.html"
        )
    );

});


router.get("/register", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../views/register.html"
        )
    );

});


router.get("/about", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../views/about.html"
        )
    );

});


router.get("/contact", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../views/contact.html"
        )
    );

});


router.get(
    "/forgot-password",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../views/forgot-password.html"
            )
        );

    }
);


router.get(
    "/reset-password",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../views/reset-password.html"
            )
        );

    }
);


router.get(
    "/verify-email",
    authController.verifyEmail
);


// =====================================================
// USER PAGES
// =====================================================

router.get(
    "/dashboard",
    requireAuth,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../views/dashboard.html"
            )
        );

    }
);


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


// =====================================================
// ADMIN LOGIN
// =====================================================

router.get(
    "/admin/login",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../views/admin-login.html"
            )
        );

    }
);


// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get(
    "/admin/dashboard",
    requireAuth,
    requireAdmin,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../views/admin-dashboard.html"
            )
        );

    }
);


// =====================================================
// ADMIN USERS
// =====================================================

router.get(
    "/admin/users",
    requireAuth,
    requireAdmin,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../views/admin-users.html"
            )
        );

    }
);


// =====================================================
// ADMIN DONORS
// =====================================================

router.get(
    "/admin/donors",
    requireAuth,
    requireAdmin,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../views/admin-donors.html"
            )
        );

    }
);


// =====================================================
// ADMIN BLOOD INVENTORY
// =====================================================

router.get(
    "/admin/blood-inventory",
    requireAuth,
    requireAdmin,
    (req, res, next) => {

        if (
            req.headers.accept &&
            req.headers.accept.includes(
                "text/html"
            )
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


// =====================================================
// ADMIN BLOOD REQUESTS
// =====================================================

router.get(
    "/admin/blood-requests",
    requireAuth,
    requireAdmin,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../views/admin-blood-requests.html"
            )
        );

    }
);


module.exports = router;