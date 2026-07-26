const BloodAvailability = require("../models/BloodAvailability");

const getAllBloodAvailability = async (req, res) => {
    try {
        const bloodAvailability = await BloodAvailability.find().sort({
            bloodBankName: 1
        });

        return res.status(200).json({
            success: true,
            count: bloodAvailability.length,
            bloodAvailability
        });
    } catch (error) {
        console.error("Blood Availability Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch blood availability."
        });
    }
};

module.exports = {
    getAllBloodAvailability
};