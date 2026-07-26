const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    status: {
        type: String,
        enum: ["Available"],
        default: "Available"
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Donor", donorSchema);