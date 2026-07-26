const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: "BloodInventory", required: true },
    bloodGroup: { type: String, required: true },
    units: { type: Number, default: 1, min: 1 },
    donatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Donation", donationSchema);
