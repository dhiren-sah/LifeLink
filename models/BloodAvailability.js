const mongoose = require("mongoose");

const bloodAvailabilitySchema = new mongoose.Schema(
    {
        bloodBankName: {
            type: String,
            required: true,
            trim: true
        },

        state: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        phoneNumber: {
            type: String,
            required: true,
            trim: true
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

        availableUnits: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "Available",
                "Low Stock",
                "Out of Stock"
            ],
            default: "Available"
        },

        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "BloodAvailability",
    bloodAvailabilitySchema
);