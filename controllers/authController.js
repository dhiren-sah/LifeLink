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


        // ==============================
        // REQUIRED FIELD VALIDATION
        // ==============================

        if (!fullName || !phoneNumber || !password || !bloodGroup) {

            return res.status(400).json({

                success: false,

                message: "Please fill all required fields."

            });

        }


        // ==============================
        // NORMALIZE DATA
        // ==============================

        const normalizedPhone =
            phoneNumber.trim();

        const normalizedEmail =
            email?.trim().toLowerCase() || null;


        // ==============================
        // FIND EXISTING PHONE USER
        // ==============================

        const phoneUser = await User.findOne({
            phoneNumber: normalizedPhone
        });


        // ==============================
        // FIND EXISTING EMAIL USER
        // ==============================

        const emailUser = normalizedEmail
            ? await User.findOne({
                email: normalizedEmail
            })
            : null;


        // ==============================
        // VERIFIED PHONE CHECK
        // ==============================

        if (
            phoneUser &&
            phoneUser.emailVerified === true
        ) {

            return res.status(409).json({

                success: false,

                message: "Phone Number Already Registered"

            });

        }


        // ==============================
        // VERIFIED EMAIL CHECK
        // ==============================

        if (
            emailUser &&
            emailUser.emailVerified === true
        ) {

            return res.status(409).json({

                success: false,

                message: "Email Already Registered"

            });

        }


        // ==============================
        // HANDLE PENDING / UNVERIFIED USER
        // ==============================

        let user = null;


        // --------------------------------
        // BOTH PHONE AND EMAIL MATCH
        // SAME USER
        // --------------------------------

        if (
            phoneUser &&
            emailUser &&
            phoneUser._id.toString() === emailUser._id.toString()
        ) {

            user = phoneUser;

        }


        // --------------------------------
        // ONLY PHONE MATCHES
        // --------------------------------

        else if (phoneUser && !emailUser) {

            user = phoneUser;

        }


        // --------------------------------
        // ONLY EMAIL MATCHES
        // --------------------------------

        else if (!phoneUser && emailUser) {

            user = emailUser;

        }


        // --------------------------------
        // PHONE AND EMAIL MATCH
        // DIFFERENT PENDING USERS
        // --------------------------------

        else if (
            phoneUser &&
            emailUser &&
            phoneUser._id.toString() !== emailUser._id.toString()
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Phone number and email are already linked to different pending registrations. Please complete one of the pending registrations first."

            });

        }


        // ==============================
        // HASH PASSWORD
        // ==============================

        const hashedPassword =
            await bcrypt.hash(password, 12);


        // ==============================
        // CREATE OR REUSE USER
        // ==============================

        if (user) {

            // --------------------------------
            // EXISTING UNVERIFIED USER
            // REUSE THIS ACCOUNT
            // --------------------------------

            user.fullName =
                fullName.trim();

            user.phoneNumber =
                normalizedPhone;

            user.email =
                normalizedEmail;

            user.password =
                hashedPassword;

            user.bloodGroup =
                bloodGroup;

            user.emailVerified =
                normalizedEmail ? false : true;

        } else {

            // --------------------------------
            // COMPLETELY NEW USER
            // --------------------------------

            user = new User({

                fullName:
                    fullName.trim(),

                phoneNumber:
                    normalizedPhone,

                email:
                    normalizedEmail,

                password:
                    hashedPassword,

                bloodGroup,

                emailVerified:
                    normalizedEmail ? false : true

            });

        }


        // ==============================
        // SEND EMAIL VERIFICATION
        // ==============================

        if (normalizedEmail) {

            const verificationToken =
                crypto.randomBytes(32).toString("hex");


            const verificationTokenHash =
                crypto
                    .createHash("sha256")
                    .update(verificationToken)
                    .digest("hex");


            user.emailVerificationTokenHash =
                verificationTokenHash;


            user.emailVerificationExpires =
                new Date(
                    Date.now() + 15 * 60 * 1000
                );


            // Save user before sending email
            await user.save();


            const verificationLink =
                `${process.env.APP_BASE_URL}/verify-email?token=${verificationToken}`;


            await transporter.sendMail({

                from:
                    `"Blood Bank" <${process.env.SMTP_USER}>`,

                to:
                    normalizedEmail,

                subject:
                    "Verify Your Blood Bank Email",

                text:
                    `Welcome to Blood Bank.\n\n` +
                    `Please verify your email address using the link below:\n\n` +
                    `${verificationLink}\n\n` +
                    `This verification link will expire in 15 minutes.`,

                html: `

                    <div style="
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                    ">

                        <h2>Welcome to Blood Bank</h2>

                        <p>
                            Thank you for registering with
                            Blood Bank Management System.
                        </p>

                        <p>
                            Please verify your email address
                            by clicking the button below.
                        </p>

                        <p>

                            <a
                                href="${verificationLink}"
                                style="
                                    display:inline-block;
                                    padding:12px 20px;
                                    background:#8b0000;
                                    color:white;
                                    text-decoration:none;
                                    border-radius:5px;
                                "
                            >
                                Verify Email
                            </a>

                        </p>

                        <p>
                            This link will expire in
                            <strong>15 minutes</strong>.
                        </p>

                        <p>
                            If you did not create this account,
                            you can safely ignore this email.
                        </p>

                    </div>

                `

            });

        } else {

            // No email means account is considered verified
            user.emailVerified = true;

            user.emailVerificationTokenHash = null;

            user.emailVerificationExpires = null;

            await user.save();

        }


        // ==============================
        // SAFE USER RESPONSE
        // ==============================

        const safeUser =
            user.toObject();

        delete safeUser.password;


        return res.status(201).json({

            success: true,

            message: normalizedEmail
                ? "Registration successful. Please check your email to verify your account."
                : "Registration Successful",

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
// VERIFY EMAIL
// ==============================

const verifyEmail = async (req, res) => {

    try {

        const token = req.query.token;


        if (!token) {

            return res.status(400).send(`
                <h2>Invalid Verification Link</h2>
                <p>The verification token is missing.</p>
            `);

        }


        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        const user = await User.findOne({

            emailVerificationTokenHash:
                tokenHash,

            emailVerificationExpires: {
                $gt: new Date()
            }

        }).select(
            "+emailVerificationTokenHash"
        );


        if (!user) {

            return res.status(400).send(`
                <h2>Verification Link Invalid or Expired</h2>
                <p>Please request a new verification email.</p>
                <a href="/login">Go to Login</a>
            `);

        }


        user.emailVerified = true;

        user.emailVerificationTokenHash = null;

        user.emailVerificationExpires = null;


        await user.save();


        return res.send(`

            <!DOCTYPE html>

            <html>

            <head>

                <title>Email Verified | Blood Bank</title>

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                >

            </head>

            <body
                style="
                    font-family:Arial;
                    text-align:center;
                    padding:60px;
                "
            >

                <h2>Email Verified Successfully</h2>

                <p>
                    Your Blood Bank email has been verified successfully.
                </p>

                <a href="/login">
                    Go to Login
                </a>

            </body>

            </html>

        `);


    } catch (error) {

        console.error("VERIFY EMAIL ERROR:", error);

        return res.status(500).send(`
            <h2>Unable to verify email.</h2>
        `);

    }

};


// ==============================
// LOGIN
// ==============================

const login = async (req, res) => {

    try {

        const {
            identifier,
            password
        } = req.body;


        if (!identifier || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email/Phone Number and Password are required."

            });

        }


        let user;


        if (identifier.includes("@")) {

            user = await User.findOne({

                email:
                    identifier.trim().toLowerCase()

            });

        } else {

            user = await User.findOne({

                phoneNumber:
                    identifier.trim()

            });

        }


        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User Not Found"

            });

        }


        // ==============================
        // EMAIL VERIFICATION CHECK
        // ==============================

        if (
            user.email &&
            !user.emailVerified
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Please verify your email before logging in."

            });

        }


        let passwordValid = false;


        if (user.password.startsWith("$2")) {

            passwordValid =
                await bcrypt.compare(
                    password,
                    user.password
                );

        } else {

            passwordValid =
                user.password === password;


            if (passwordValid) {

                user.password =
                    await bcrypt.hash(
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


        const token =
            createSession(user._id);


        // ==============================
        // CREATE LOGIN COOKIE
        // ==============================

        res.cookie(
            "bbmsSession",
            token,
            {
                httpOnly: true,

                sameSite: "lax",

                path: "/"
            }
        );


        const safeUser =
            user.toObject();

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

        const email =
            req.body.email?.trim().toLowerCase();


        if (!email) {

            return res.status(400).json({

                success: false,

                message: "Email is required."

            });

        }


        const user =
            await User.findOne({
                email
            }).select(
                "+resetPasswordTokenHash +resetPasswordExpires"
            );


        if (!user) {

            return res.status(200).json({

                success: true,

                message:
                    "If an account exists with this email, a password reset link has been sent."

            });

        }


        const resetToken =
            crypto.randomBytes(32).toString("hex");


        const resetTokenHash =
            crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");


        user.resetPasswordTokenHash =
            resetTokenHash;


        user.resetPasswordExpires =
            new Date(
                Date.now() + 15 * 60 * 1000
            );


        await user.save();


        const resetLink =
            `${process.env.APP_BASE_URL}/reset-password?token=${resetToken}`;


        await transporter.sendMail({

            from:
                `"Blood Bank" <${process.env.SMTP_USER}>`,

            to:
                user.email,

            subject:
                "Blood Bank Password Reset",

            text:
                `Reset your Blood Bank password using this link:\n\n${resetLink}\n\nThis link expires in 15 minutes.`,

            html: `

                <div
                    style="
                        font-family:Arial;
                        line-height:1.6;
                    "
                >

                    <h2>
                        Blood Bank Password Reset
                    </h2>

                    <p>
                        You requested a password reset.
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
                        This link expires in
                        <strong>15 minutes</strong>.
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

        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to process password reset request."

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

                message:
                    "Reset token and new password are required."

            });

        }


        if (password.length < 8) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be at least 8 characters long."

            });

        }


        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        const user =
            await User.findOne({

                resetPasswordTokenHash:
                    tokenHash,

                resetPasswordExpires: {
                    $gt: new Date()
                }

            });


        if (!user) {

            return res.status(400).json({

                success: false,

                message:
                    "Reset link is invalid or expired."

            });

        }


        user.password =
            await bcrypt.hash(
                password,
                12
            );


        user.resetPasswordTokenHash =
            null;

        user.resetPasswordExpires =
            null;


        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Password reset successful. You can now login with your new password."

        });


    } catch (error) {

        console.error(
            "RESET PASSWORD ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to reset password."

        });

    }

};


// ==============================
// LOGOUT
// ==============================

const logout = (req, res) => {

    if (req.sessionToken) {

        clearSession(
            req.sessionToken
        );

    }


    // Same cookie name used during login
    res.clearCookie(
        "bbmsSession",
        {
            path: "/"
        }
    );


    return res.json({

        success: true

    });

};


// ==============================
// GET PROFILE
// ==============================

const getProfile = async (req, res) => {

    try {

        const {
            userId
        } = req.query;


        if (!userId) {

            return res.status(400).json({

                success: false,

                message:
                    "User ID is required."

            });

        }


        const user =
            await User.findById(userId)
                .select("-password");


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });

        }


        const donor =
            await Donor.findOne({
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

            message:
                "Unable to load profile."

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


        if (
            !userId ||
            !fullName ||
            !phoneNumber ||
            !bloodGroup
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, phone number, and blood group are required."

            });

        }


        const duplicateUser =
            await User.findOne({

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


        const user =
            await User.findByIdAndUpdate(

                userId,

                {

                    fullName:
                        fullName.trim(),

                    phoneNumber:
                        phoneNumber.trim(),

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

                message:
                    "User not found."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Profile updated successfully.",

            user

        });


    } catch (error) {

        return res.status(400).json({

            success: false,

            message:
                "Unable to update profile."

        });

    }

};


// ==============================
// UPLOAD PROFILE PHOTO
// ==============================

const uploadProfilePhoto = async (req, res) => {

    try {

        const {
            userId
        } = req.body;


        if (
            !userId ||
            !req.file
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "User ID and a profile photo are required."

            });

        }


        const user =
            await User.findByIdAndUpdate(

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

                message:
                    "User not found."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Profile photo updated successfully.",

            user

        });


    } catch (error) {

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

    verifyEmail,

    getProfile,

    updateProfile,

    uploadProfilePhoto

};