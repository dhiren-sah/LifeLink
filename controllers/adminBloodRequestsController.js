const BloodRequest = require("../models/BloodRequest");


// =====================================================
// GET ALL BLOOD REQUESTS
// GET /api/admin/blood-requests
// =====================================================

const getRequests = async (req, res) => {
    try {

        const requests =
            await BloodRequest.find({})
                .populate(
                    "user",
                    "fullName phoneNumber email bloodGroup city state"
                )
                .sort({
                    createdAt: -1
                })
                .lean();


        return res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {

        console.error(
            "ADMIN GET BLOOD REQUESTS ERROR:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch blood requests."
        });

    }
};


// =====================================================
// GET SINGLE BLOOD REQUEST
// GET /api/admin/blood-requests/:id
// =====================================================

const getRequest = async (req, res) => {
    try {

        const request =
            await BloodRequest.findById(
                req.params.id
            )
                .populate(
                    "user",
                    "fullName phoneNumber email bloodGroup city state address"
                )
                .lean();


        if (!request) {

            return res.status(404).json({
                success: false,
                message:
                    "Blood request not found."
            });

        }


        return res.status(200).json({
            success: true,
            request
        });

    } catch (error) {

        console.error(
            "ADMIN GET BLOOD REQUEST ERROR:",
            error
        );


        if (
            error.name ===
            "CastError"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid blood request ID."
            });

        }


        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch blood request."
        });

    }
};


// =====================================================
// UPDATE BLOOD REQUEST STATUS
// PUT /api/admin/blood-requests/:id
// =====================================================

const updateRequest = async (req, res) => {
    try {

        const requestId =
            req.params.id;


        const allowedStatuses = [
            "Pending",
            "Approved",
            "Rejected",
            "Completed"
        ];


        const status =
            String(
                req.body.status || ""
            ).trim();


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid blood request status."
            });

        }


        const request =
            await BloodRequest.findByIdAndUpdate(
                requestId,
                {
                    status
                },
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate(
                    "user",
                    "fullName phoneNumber email bloodGroup city state address"
                )
                .lean();


        if (!request) {

            return res.status(404).json({
                success: false,
                message:
                    "Blood request not found."
            });

        }


        return res.status(200).json({
            success: true,
            message:
                "Blood request updated successfully.",
            request
        });

    } catch (error) {

        console.error(
            "ADMIN UPDATE BLOOD REQUEST ERROR:",
            error
        );


        if (
            error.name ===
            "CastError"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid blood request ID."
            });

        }


        if (
            error.name ===
            "ValidationError"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    Object.values(
                        error.errors
                    )
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
                "Unable to update blood request."
        });

    }
};


module.exports = {
    getRequests,
    getRequest,
    updateRequest
};