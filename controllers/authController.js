const User = require("../models/User");
const Donor = require("../models/Donor");
const { createSession, clearSession } = require("../middleware/auth");

const register = async (req, res) => {

    try {

        const {
            fullName,
            phoneNumber,
            email,
            password,
            bloodGroup
        } = req.body;

        if (!fullName || !phoneNumber || !password || !bloodGroup) {

            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });

        }

        const existingUser = await User.findOne({
            phoneNumber
        });

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "Phone Number Already Registered"
            });

        }

        const user = await User.create({

            fullName,
            phoneNumber,
            email,
            password,
            bloodGroup

        });

        return res.status(201).json({

            success: true,
            message: "Registration Successful",
            user

        });

    } catch (error) {

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

const login = async (req, res) => {

    try {

        const { identifier, password } = req.body;

        if (!identifier || !password) {

            return res.status(400).json({

                success: false,
                message: "Email/Phone Number and Password are required."

            });

        }

        let user;

        if (identifier.includes("@")) {

            user = await User.findOne({
                email: identifier
            });

        } else {

            user = await User.findOne({
                phoneNumber: identifier
            });

        }

        if (!user) {

            return res.status(404).json({

                success: false,
                message: "User Not Found"

            });

        }

        if (user.password !== password) {

            return res.status(401).json({

                success: false,
                message: "Invalid Password"

            });

        }

        const token = createSession(user._id);

        res.cookie("bbmsSession", token, {
            httpOnly: true,
            sameSite: "lax",
            path: "/"
        });

        return res.status(200).json({

            success: true,
            message: "Login Successful",
            user

        });

    } catch (error) {

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

const logout = (req, res) => {

    if (req.sessionToken) {
        clearSession(req.sessionToken);
    }

    res.clearCookie("bbmsSession", {
        path: "/"
    });

    return res.json({
        success: true
    });

};

const getProfile = async (req, res) => {

    try {

        const { userId } = req.query;

        if (!userId) {

            return res.status(400).json({
                success: false,
                message: "User ID is required."
            });

        }

        const user = await User.findById(userId).select("-password");

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        const donor = await Donor.findOne({
            user: userId
        });

        const profile = {
            ...user.toObject(),
            isDonor: !!donor
        };

        return res.status(200).json({
            success: true,
            user: profile
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: "Unable to load profile."
        });

    }

};

const updateProfile = async (req, res) => {

    try {

        const {
            userId,
            fullName,
            phoneNumber,
            email,
            bloodGroup,
            address,
            city,
            state
        } = req.body;

        if (!userId || !fullName || !phoneNumber || !bloodGroup) {

            return res.status(400).json({
                success: false,
                message: "Name, phone number, and blood group are required."
            });

        }

        const duplicateUser = await User.findOne({

            phoneNumber,
            _id: {
                $ne: userId
            }

        });

        if (duplicateUser) {

            return res.status(409).json({
                success: false,
                message: "Phone number is already registered."
            });

        }

        const user = await User.findByIdAndUpdate(

            userId,

            {
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                email: email?.trim().toLowerCase() || null,
                bloodGroup,
                address: address?.trim() || "",
                city: city?.trim() || "",
                state: state?.trim() || ""
            },

            {
                new: true,
                runValidators: true
            }

        ).select("-password");

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        return res.status(200).json({

            success: true,
            message: "Profile updated successfully.",
            user

        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: "Unable to update profile."
        });

    }

};

const uploadProfilePhoto = async (req, res) => {

    try {

        const { userId } = req.body;

        if (!userId || !req.file) {

            return res.status(400).json({
                success: false,
                message: "User ID and a profile photo are required."
            });

        }

        const user = await User.findByIdAndUpdate(

            userId,

            {
                profilePhoto: `/uploads/profiles/${req.file.filename}`
            },

            {
                new: true,
                runValidators: true
            }

        ).select("-password");

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        return res.status(200).json({

            success: true,
            message: "Profile photo updated successfully.",
            user

        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: "Unable to upload profile photo."
        });

    }

};

module.exports = {

    register,
    login,
    logout,
    getProfile,
    updateProfile,
    uploadProfilePhoto

};