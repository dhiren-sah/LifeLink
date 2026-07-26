require("dotenv").config();

const express = require("express");
const path = require("path");

const connectDB = require("./config/db");

const webRoutes = require("./routes/web");
const authRoutes = require("./routes/auth");
const bloodAvailabilityRoutes = require("./routes/bloodAvailabilityRoutes");
const donationRoutes = require("./routes/donations");
const bloodRequestRoutes = require("./routes/bloodRequest");
const donorRoutes = require("./routes/donorRoutes");

const { attachUser } = require("./middleware/auth");

const app = express();

const PORT = process.env.PORT || 3000;

// ======================
// Middleware
// ======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(attachUser);

// ======================
// Static Files
// ======================
app.use(express.static(path.join(__dirname, "public")));

// ======================
// Web Routes
// ======================
app.use("/", webRoutes);

// ======================
// API Routes
// ======================
app.use("/auth", authRoutes);
app.use("/api/blood-availability", bloodAvailabilityRoutes);
app.use("/blood-request", bloodRequestRoutes);
app.use("/api", donationRoutes);
app.use("/api/donors", donorRoutes);

// ======================
// Connect Database
// ======================
connectDB();

// ======================
// Start Server
// ======================
app.listen(PORT, () => {
    console.log(`Server Running : http://localhost:${PORT}`);
});