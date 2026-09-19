const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const Donor = require("../models/Donor");
const {
    createSession,
    clearSession
} = require("../middleware/auth");


// ==============================
// EMAIL CONFIGURATION
// ==============================

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});


// ==============================
// REGISTER
// ==============================

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

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({

            fullName,
            phoneNumber,
            email: email?.trim().toLowerCase() || null,
            password: hashedPassword,
            bloodGroup

        });

        const safeUser = user.toObject();
        delete safeUser.password;

        return res.status(201).json({

            success: true,
            message: "Registration Successful",
            user: safeUser

        });

    } catch (error) {

        console.error("REGISTER ERROR:", error);

        return res.status(500).json({

            success: false,
            message: "Registration failed."

        });

    }

};


// ==============================
// LOGIN
// ==============================

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
                email: identifier.trim().toLowerCase()
            });

        } else {

            user = await User.findOne({
                phoneNumber: identifier.trim()
            });

        }

        if (!user) {

            return res.status(404).json({

                success: false,
                message: "User Not Found"

            });

        }


        // --------------------------------
        // Password verification
        // --------------------------------

        let passwordValid = false;

        // New bcrypt passwords
        if (user.password.startsWith("$2")) {

            passwordValid = await bcrypt.compare(
                password,
                user.password
            );

        }

        // Old plain-text passwords
        else {

            passwordValid = user.password === password;

            // Upgrade old password to bcrypt
            if (passwordValid) {

                user.password = await bcrypt.hash(
                    password,
                    12
                );

                await user.save();

            }

        }

        if (!passwordValid) {

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


        const safeUser = user.toObject();

        delete safeUser.password;


        return res.status(200).json({

            success: true,
            message: "Login Successful",
            user: safeUser

        });

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        return res.status(500).json({

            success: false,
            message: "Login failed."

        });

    }

};


// ==============================
// FORGOT PASSWORD
// ==============================

const requestPasswordReset = async (req, res) => {

    try {

        const email = req.body.email?.trim().toLowerCase();

        if (!email) {

            return res.status(400).json({

                success: false,
                message: "Email is required."

            });

        }


        const user = await User.findOne({ email })
            .select("+resetPasswordTokenHash +resetPasswordExpires");


        /*
         * Don't reveal whether an email exists.
         * This prevents account enumeration.
         */

        if (!user) {

            return res.status(200).json({

                success: true,
                message:
                    "If an account exists with this email, a password reset link has been sent."

            });

        }


        // Generate random reset token
        const resetToken = crypto.randomBytes(32).toString("hex");


        // Store only hashed token
        const resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");


        // Token valid for 15 minutes
        user.resetPasswordTokenHash = resetTokenHash;

        user.resetPasswordExpires =
            new Date(Date.now() + 15 * 60 * 1000);

        await user.save();


        const resetLink =
            `${process.env.APP_BASE_URL}/reset-password?token=${resetToken}`;


        await transporter.sendMail({

            from: `"BBMS" <${process.env.SMTP_USER}>`,

            to: user.email,

            subject: "BBMS Password Reset",

            text:
                `You requested a password reset for your BBMS account.\n\n` +
                `Reset your password using this link:\n\n` +
                `${resetLink}\n\n` +
                `This link will expire in 15 minutes.\n\n` +
                `If you did not request this, you can safely ignore this email.`,

            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">

                    <h2>BBMS Password Reset</h2>

                    <p>
                        You requested a password reset for your BBMS account.
                    </p>

                    <p>
                        Click the button below to create a new password:
                    </p>

                    <p>
                        <a
                            href="${resetLink}"
                            style="
                                display:inline-block;
                                padding:12px 20px;
                                background:#8b0000;
                                color:white;
                                text-decoration:none;
                                border-radius:5px;
                            "
                        >
                            Reset Password
                        </a>
                    </p>

                    <p>
                        This link will expire in <strong>15 minutes</strong>.
                    </p>

                    <p>
                        If you did not request this password reset,
                        you can safely ignore this email.
                    </p>

                </div>
            `

        });


        return res.status(200).json({

            success: true,

            message:
                "If an account exists with this email, a password reset link has been sent."

        });

    } catch (error) {

        console.error("FORGOT PASSWORD ERROR:", error);

        return res.status(500).json({

            success: false,
            message: "Unable to process password reset request."

        });

    }

};


// ==============================
// RESET PASSWORD
// ==============================

const resetPassword = async (req, res) => {

    try {

        const {
            token,
            password
        } = req.body;


        if (!token || !password) {

            return res.status(400).json({

                success: false,
                message: "Reset token and new password are required."

            });

        }


        if (password.length < 8) {

            return res.status(400).json({

                success: false,
                message: "Password must be at least 8 characters long."

            });

        }


        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");


        const user = await User.findOne({

            resetPasswordTokenHash: tokenHash,

            resetPasswordExpires: {
                $gt: new Date()
            }

        });


        if (!user) {

            return res.status(400).json({

                success: false,
                message: "Reset link is invalid or expired."

            });

        }


        user.password = await bcrypt.hash(
            password,
            12
        );


        // Token becomes unusable immediately
        user.resetPasswordTokenHash = null;
        user.resetPasswordExpires = null;


        await user.save();


        return res.status(200).json({

            success: true,
            message:
                "Password reset successful. You can now login with your new password."

        });

    } catch (error) {

        console.error("RESET PASSWORD ERROR:", error);

        return res.status(500).json({

            success: false,
            message: "Unable to reset password."

        });

    }

};


// ==============================
// LOGOUT
// ==============================

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


// ==============================
// GET PROFILE
// ==============================

const getProfile = async (req, res) => {

    try {

        const { userId } = req.query;

        if (!userId) {

            return res.status(400).json({
                success: false,
                message: "User ID is required."
            });

        }

        const user = await User.findById(userId)
            .select("-password");

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

        console.error("GET PROFILE ERROR:", error);

        return res.status(400).json({
            success: false,
            message: "Unable to load profile."
        });

    }

};


// ==============================
// UPDATE PROFILE
// ==============================

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
                message:
                    "Name, phone number, and blood group are required."
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
                message:
                    "Phone number is already registered."
            });

        }

        const user = await User.findByIdAndUpdate(

            userId,

            {
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                email:
                    email?.trim().toLowerCase() || null,
                bloodGroup,
                address:
                    address?.trim() || "",
                city:
                    city?.trim() || "",
                state:
                    state?.trim() || ""
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

        console.error("UPDATE PROFILE ERROR:", error);

        return res.status(400).json({
            success: false,
            message: "Unable to update profile."
        });

    }

};


// ==============================
// UPLOAD PROFILE PHOTO
// ==============================

const uploadProfilePhoto = async (req, res) => {

    try {

        const { userId } = req.body;

        if (!userId || !req.file) {

            return res.status(400).json({
                success: false,
                message:
                    "User ID and a profile photo are required."
            });

        }

        const user = await User.findByIdAndUpdate(

            userId,

            {
                profilePhoto:
                    `/uploads/profiles/${req.file.filename}`
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
            message:
                "Profile photo updated successfully.",
            user

        });

    } catch (error) {

        console.error("UPLOAD PROFILE PHOTO ERROR:", error);

        return res.status(400).json({
            success: false,
            message:
                "Unable to upload profile photo."
        });

    }

};


// ==============================
// EXPORTS
// ==============================

module.exports = {

    register,
    login,
    logout,

    requestPasswordReset,
    resetPassword,

    getProfile,
    updateProfile,
    uploadProfilePhoto

};