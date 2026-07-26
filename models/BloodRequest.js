const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    bloodGroup: {
        type: String,
        required: true,
        enum: [
            "A+",
            "A-",
            "B+",
            "B-",
            "AB+",
            "AB-",
            "O+",
            "O-"
        ]
    },

    units: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },

    hospital: {
        type: String,
        required: true,
        trim: true
    },

    reason: {
        type: String,
        required: true,
        trim: true
    },

    urgency: {
        type: String,
        enum: [
            "Normal",
            "Urgent",
            "Emergency"
        ],
        default: "Normal"
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },

    address: {
        type: String,
        required: true,
        trim: true
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "Approved",
            "Rejected",
            "Completed"
        ],
        default: "Pending"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);