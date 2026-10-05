const Donor = require("../models/Donor");

/*
=========================================================
GET ALL DONORS
GET /api/admin/donors
=========================================================
*/
const getDonors = async (req, res) => {
    try {
        const donors = await Donor.find({})
            .populate(
                "user",
                "fullName phoneNumber email bloodGroup address city state profilePhoto role donationCount createdAt"
            )
            .sort({ createdAt: -1 })
            .lean();

        const validDonors = donors.filter(
            (donor) => donor.user
        );

        return res.status(200).json({
            success: true,
            count: validDonors.length,
            donors: validDonors
        });

    } catch (error) {

        console.error(
            "ADMIN GET DONORS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch donors."
        });
    }
};


/*
=========================================================
GET SINGLE DONOR
GET /api/admin/donors/:id
=========================================================
*/
const getDonor = async (req, res) => {
    try {

        const donor = await Donor.findById(
            req.params.id
        )
            .populate(
                "user",
                "fullName phoneNumber email bloodGroup address city state profilePhoto role donationCount donationHistory createdAt"
            )
            .lean();

        if (!donor) {

            return res.status(404).json({
                success: false,
                message: "Donor not found."
            });
        }

        if (!donor.user) {

            return res.status(404).json({
                success: false,
                message: "Donor user account not found."
            });
        }

        return res.status(200).json({
            success: true,
            donor
        });

    } catch (error) {

        console.error(
            "ADMIN GET DONOR ERROR:",
            error
        );

        if (error.name === "CastError") {

            return res.status(400).json({
                success: false,
                message: "Invalid donor ID."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to fetch donor."
        });
    }
};


/*
=========================================================
UPDATE DONOR
PUT /api/admin/donors/:id

Currently Donor model supports only:
status = Available
=========================================================
*/
const updateDonor = async (req, res) => {
    try {

        const donorId = req.params.id;

        const updateData = {};

        if (
            req.body.status !== undefined
        ) {

            const status =
                String(
                    req.body.status
                ).trim();

            if (status !== "Available") {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid donor status."
                });
            }

            updateData.status = status;
        }

        const donor =
            await Donor.findByIdAndUpdate(
                donorId,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate(
                    "user",
                    "fullName phoneNumber email bloodGroup address city state profilePhoto role donationCount createdAt"
                )
                .lean();

        if (!donor) {

            return res.status(404).json({
                success: false,
                message: "Donor not found."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Donor updated successfully.",
            donor
        });

    } catch (error) {

        console.error(
            "ADMIN UPDATE DONOR ERROR:",
            error
        );

        if (error.name === "CastError") {

            return res.status(400).json({
                success: false,
                message: "Invalid donor ID."
            });
        }

        if (error.name === "ValidationError") {

            return res.status(400).json({
                success: false,
                message:
                    Object.values(error.errors)
                        .map(
                            (item) =>
                                item.message
                        )
                        .join(", ")
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Unable to update donor."
        });
    }
};


/*
=========================================================
DELETE DONOR
DELETE /api/admin/donors/:id
=========================================================
*/
const deleteDonor = async (req, res) => {
    try {

        const donorId = req.params.id;

        const donor =
            await Donor.findByIdAndDelete(
                donorId
            );

        if (!donor) {

            return res.status(404).json({
                success: false,
                message: "Donor not found."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Donor removed successfully."
        });

    } catch (error) {

        console.error(
            "ADMIN DELETE DONOR ERROR:",
            error
        );

        if (error.name === "CastError") {

            return res.status(400).json({
                success: false,
                message: "Invalid donor ID."
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete donor."
        });
    }
};


module.exports = {
    getDonors,
    getDonor,
    updateDonor,
    deleteDonor
};