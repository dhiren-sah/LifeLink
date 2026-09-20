const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: null
    },

    password: {
        type: String,
        required: true
    },

    bloodGroup: {
        type: String,
        enum: [
            "A+", "A-",
            "B+", "B-",
            "AB+", "AB-",
            "O+", "O-"
        ],
        required: true
    },

    address: {
        type: String,
        trim: true,
        default: ""
    },

    city: {
        type: String,
        trim: true,
        default: ""
    },

    state: {
        type: String,
        trim: true,
        default: ""
    },

    profilePhoto: {
        type: String,
        default: "/images/default-profile.svg"
    },

    role: {
        type: String,
        enum: [
            "donor",
            "patient",
            "admin"
        ],
        default: "patient"
    },

    donationCount: {
        type: Number,
        default: 0,
        min: 0
    },

    donationHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Donation"
        }
    ],

    // ==============================
    // PASSWORD RESET
    // ==============================

    resetPasswordTokenHash: {
        type: String,
        default: null,
        select: false
    },

    resetPasswordExpires: {
        type: Date,
        default: null,
        select: false
    },

    // ==============================
    // EMAIL VERIFICATION
    // ==============================

    emailVerified: {
        type: Boolean,
        default: false
    },

    emailVerificationTokenHash: {
        type: String,
        default: null,
        select: false
    },

    emailVerificationExpires: {
        type: Date,
        default: null,
        select: false
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);