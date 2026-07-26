const crypto = require("crypto");
const User = require("../models/User");

const sessions = new Map();

const readCookies = (header = "") => Object.fromEntries(header.split(";").map((part) => part.trim().split("=")).filter(([key, value]) => key && value));

const createSession = (userId) => {
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, userId.toString());
    return token;
};

const clearSession = (token) => sessions.delete(token);

const attachUser = async (req, res, next) => {
    try {
        const token = readCookies(req.headers.cookie).bbmsSession;
        const userId = token && sessions.get(token);
        if (userId) req.user = await User.findById(userId);
        req.sessionToken = token;
        next();
    } catch (error) { next(error); }
};

const requireAuth = (req, res, next) => {
    if (req.user) return next();
    if (req.headers.accept?.includes("text/html")) return res.redirect("/login");
    return res.status(401).json({ success: false, message: "Please log in to continue." });
};

const requireAdmin = (req, res, next) => {
    if (req.user?.role === "admin") return next();
    return res.status(403).json({ success: false, message: "Only hospital or admin users can complete collections." });
};

module.exports = { attachUser, requireAuth, requireAdmin, createSession, clearSession };
