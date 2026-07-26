const Donor = require("../models/Donor");
const Donation = require("../models/Donation");
const BloodInventory = require("../models/BloodAvailability");
const User = require("../models/User");

const wantToDonate = async (req, res) => {
    try {
        const user = req.user;
        const active = await Donor.findOne({ user: user._id, status: "Waiting for Blood Collection" });
        if (active) return res.status(409).json({ success: false, message: "You already have a pending donation." });
        const donor = await Donor.create({
            user: user._id,
            fullName: user.fullName,
            bloodGroup: user.bloodGroup,
            city: req.body.city?.trim() || user.city,
            phoneNumber: user.phoneNumber
        });
        return res.status(201).json({
            success: true,
            message: "You have been added to the pending donor list.",
            donor
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Unable to register your donation."
        });
    }
};

const getPendingDonors = async (req, res) => {
    try {
        const donors = await Donor.find({
            status: "Waiting for Blood Collection"
        }).sort({ createdAt: 1 });

        return res.json({
            success: true,
            donors
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to load pending donors."
        });
    }
};

const completeCollection = async (req, res) => {
    try {
        const donor = await Donor.findOne({
            _id: req.params.id,
            status: "Waiting for Blood Collection"
        });

        if (!donor)
            return res.status(404).json({
                success: false,
                message: "Pending donor not found."
            });

        const inventory = await BloodInventory.findOne({
            _id: req.body.inventoryId,
            bloodGroup: donor.bloodGroup
        });

        if (!inventory)
            return res.status(400).json({
                success: false,
                message: "Select an inventory record with the donor's blood group."
            });

        const donation = await Donation.create({
            user: donor.user,
            donor: donor._id,
            inventory: inventory._id,
            bloodGroup: donor.bloodGroup
        });

        inventory.availableUnits += donation.units;
        inventory.status =
            inventory.availableUnits <= 0
                ? "Out of Stock"
                : inventory.availableUnits <= 5
                ? "Low Stock"
                : "Available";

        inventory.lastUpdated = new Date();

        await inventory.save();

        donor.status = "Collected";
        donor.collectedAt = donation.donatedAt;
        donor.donation = donation._id;

        await donor.save();

        await User.findByIdAndUpdate(donor.user, {
            $inc: { donationCount: 1 },
            $push: { donationHistory: donation._id }
        });

        return res.json({
            success: true,
            message: "Blood collection completed and inventory updated.",
            donation
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Unable to complete blood collection."
        });
    }
};

const getMyDonations = async (req, res) => {
    const donations = await Donation.find({
        user: req.user._id
    })
        .populate("inventory")
        .sort({ donatedAt: -1 });

    return res.json({
        success: true,
        donationCount: req.user.donationCount || 0,
        donations
    });
};

module.exports = {
    wantToDonate,
    getPendingDonors,
    completeCollection,
    getMyDonations
};