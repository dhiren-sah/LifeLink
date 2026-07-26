const Donor = require("../models/Donor");
const User = require("../models/User");

// Become Donor
exports.becomeDonor = async (req, res) => {
    try {

        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.bloodGroup) {
            return res.status(400).json({
                success: false,
                message: "Please complete your profile first."
            });
        }

        const existingDonor = await Donor.findOne({
            user: userId
        });

        if (existingDonor) {
            return res.status(400).json({
                success: false,
                message: "You are already a donor."
            });
        }

        await Donor.create({
            user: userId
        });

        return res.status(201).json({
            success: true,
            message: "You are now a donor."
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

// Cancel Donor
exports.cancelDonor = async (req, res) => {

    try {

        const userId = req.user._id;

        const donor = await Donor.findOne({
            user: userId
        });

        if (!donor) {

            return res.status(404).json({
                success: false,
                message: "You are not a donor."
            });

        }

        await Donor.deleteOne({
            user: userId
        });

        return res.status(200).json({
            success: true,
            message: "Donor cancelled successfully."
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// Public Donor List
exports.getDonors = async (req, res) => {

    try {

        const donors = await Donor.find()
            .populate("user", "fullName")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            donors
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};