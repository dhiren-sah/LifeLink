require("dotenv").config();

const express = require("express");
const path = require("path");

const connectDB = require("./config/db");


// =====================================================
// ROUTES
// =====================================================

const webRoutes =
    require("./routes/web");

const authRoutes =
    require("./routes/auth");

const bloodAvailabilityRoutes =
    require("./routes/bloodAvailabilityRoutes");

const donationRoutes =
    require("./routes/donations");

const bloodRequestRoutes =
    require("./routes/bloodRequest");

const donorRoutes =
    require("./routes/donorRoutes");

const adminDashboardRoutes =
    require("./routes/adminDashboardRoutes");

const adminUsersRoutes =
    require("./routes/adminUsersRoutes");

const adminDonorsRoutes =
    require("./routes/adminDonorsRoutes");

const adminBloodInventoryRoutes =
    require("./routes/adminBloodInventoryRoutes");

const adminBloodRequestsRoutes =
    require("./routes/adminBloodRequestsRoutes");


// =====================================================
// AUTH MIDDLEWARE
// =====================================================

const {
    attachUser
} = require("./middleware/auth");


// =====================================================
// APP
// =====================================================

const app = express();


// =====================================================
// PORT
// =====================================================

const PORT =
    process.env.PORT || 3000;


// =====================================================
// BODY PARSER
// =====================================================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.json()
);


// =====================================================
// ATTACH LOGGED-IN USER
// =====================================================

app.use(
    attachUser
);


// =====================================================
// STATIC FILES
// =====================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// =====================================================
// WEB ROUTES
// =====================================================

app.use(
    "/",
    webRoutes
);


// =====================================================
// AUTH ROUTES
// =====================================================

app.use(
    "/auth",
    authRoutes
);


// =====================================================
// BLOOD AVAILABILITY ROUTES
// =====================================================

app.use(
    "/api/blood-availability",
    bloodAvailabilityRoutes
);


// =====================================================
// BLOOD REQUEST ROUTES
// =====================================================

app.use(
    "/blood-request",
    bloodRequestRoutes
);


// =====================================================
// DONATION ROUTES
// =====================================================

app.use(
    "/api",
    donationRoutes
);


// =====================================================
// DONOR ROUTES
// =====================================================

app.use(
    "/api/donors",
    donorRoutes
);


// =====================================================
// ADMIN DASHBOARD ROUTES
// =====================================================

app.use(
    "/api/admin",
    adminDashboardRoutes
);


// =====================================================
// ADMIN USERS ROUTES
// =====================================================

app.use(
    "/api/admin/users",
    adminUsersRoutes
);


// =====================================================
// ADMIN DONORS ROUTES
// =====================================================

app.use(
    "/api/admin/donors",
    adminDonorsRoutes
);


// =====================================================
// ADMIN BLOOD INVENTORY ROUTES
// =====================================================

app.use(
    "/api/admin/blood-inventory",
    adminBloodInventoryRoutes
);


// =====================================================
// ADMIN BLOOD REQUESTS ROUTES
// =====================================================

app.use(
    "/api/admin/blood-requests",
    adminBloodRequestsRoutes
);


// =====================================================
// DATABASE
// =====================================================

connectDB();


// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Server Running : http://localhost:${PORT}`
        );

    }
);