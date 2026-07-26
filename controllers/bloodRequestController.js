const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");

// =====================================
// Create Blood Request
// =====================================

exports.createRequest = async (req, res) => {

    try {

        const {
            user,
            bloodGroup,
            units,
            hospital,
            reason,
            urgency,
            phone,
            address
        } = req.body;

        if (
            !user ||
            !bloodGroup ||
            !units ||
            !hospital ||
            !reason ||
            !urgency ||
            !phone ||
            !address
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        const userExists = await User.findById(user);

        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const request = await BloodRequest.create({
            user,
            bloodGroup,
            units,
            hospital,
            reason,
            urgency,
            phone,
            address
        });

        return res.status(201).json({
            success: true,
            message: "Blood request submitted successfully.",
            request
        });

    } catch (error) {

        console.error("Create Request Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// =====================================
// Get Logged In User Requests
// =====================================

exports.getMyRequests = async (req, res) => {

    try {

        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required."
            });
        }

        const requests = await BloodRequest
            .find({ user: userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            requests
        });

    } catch (error) {

        console.error("Get My Requests Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// =====================================
// Get All Requests
// =====================================

exports.getAllRequests = async (req, res) => {

    try {

        const requests = await BloodRequest
            .find()
            .populate("user")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            requests
        });

    } catch (error) {

        console.error("Get All Requests Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// =====================================
// Approve Request
// =====================================

exports.approveRequest = async (req, res) => {

    try {

        const request = await BloodRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found."
            });
        }

        request.status = "Approved";

        await request.save();

        return res.status(200).json({
            success: true,
            message: "Request Approved."
        });

    } catch (error) {

        console.error("Approve Request Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// =====================================
// Reject Request
// =====================================

exports.rejectRequest = async (req, res) => {

    try {

        const request = await BloodRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found."
            });
        }

        request.status = "Rejected";

        await request.save();

        return res.status(200).json({
            success: true,
            message: "Request Rejected."
        });

    } catch (error) {

        console.error("Reject Request Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// =====================================
// Complete Request
// =====================================

exports.completeRequest = async (req, res) => {

    try {

        const request = await BloodRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found."
            });
        }

        request.status = "Completed";

        await request.save();

        return res.status(200).json({
            success: true,
            message: "Request Completed."
        });

    } catch (error) {

        console.error("Complete Request Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// =====================================
// Delete Request
// =====================================

exports.deleteRequest = async (req, res) => {

    try {

        const request = await BloodRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found."
            });
        }

        await request.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Request Deleted."
        });

    } catch (error) {

        console.error("Delete Request Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};