const User = require("../models/User");


/* =========================================================
   GET ALL USERS
   GET /api/admin/users
   ========================================================= */

const getUsers = async (req, res) => {

    try {

        const users = await User.find({})
            .select(
                "-password " +
                "-resetPasswordTokenHash " +
                "-resetPasswordExpires " +
                "-emailVerificationTokenHash " +
                "-emailVerificationExpires"
            )
            .sort({
                createdAt: -1
            })
            .lean();


        return res.status(200).json({

            success: true,

            count: users.length,

            users

        });


    } catch (error) {

        console.error(
            "ADMIN GET USERS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to fetch users."

        });

    }

};


/* =========================================================
   GET SINGLE USER
   GET /api/admin/users/:id
   ========================================================= */

const getUser = async (req, res) => {

    try {

        const user = await User.findById(
            req.params.id
        )
            .select(
                "-password " +
                "-resetPasswordTokenHash " +
                "-resetPasswordExpires " +
                "-emailVerificationTokenHash " +
                "-emailVerificationExpires"
            )
            .lean();


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });

        }


        return res.status(200).json({

            success: true,

            user

        });


    } catch (error) {

        console.error(
            "ADMIN GET USER ERROR:",
            error
        );


        if (
            error.name ===
            "CastError"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid user ID."

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Unable to fetch user."

        });

    }

};


/* =========================================================
   UPDATE USER
   PUT /api/admin/users/:id
   ========================================================= */

const updateUser = async (req, res) => {

    try {

        const userId =
            req.params.id;


        const allowedFields = [

            "fullName",

            "phoneNumber",

            "email",

            "bloodGroup",

            "address",

            "city",

            "state",

            "role"

        ];


        const updateData = {};


        allowedFields.forEach(
            (field) => {

                if (
                    req.body[field] !==
                    undefined
                ) {

                    updateData[field] =
                        req.body[field];

                }

            }
        );


        if (
            updateData.fullName !==
            undefined
        ) {

            updateData.fullName =
                String(
                    updateData.fullName
                ).trim();

        }


        if (
            updateData.phoneNumber !==
            undefined
        ) {

            updateData.phoneNumber =
                String(
                    updateData.phoneNumber
                ).trim();

        }


        if (
            updateData.email !==
            undefined
        ) {

            const email =
                String(
                    updateData.email
                ).trim();

            updateData.email =
                email
                    ? email.toLowerCase()
                    : null;

        }


        if (
            updateData.address !==
            undefined
        ) {

            updateData.address =
                String(
                    updateData.address
                ).trim();

        }


        if (
            updateData.city !==
            undefined
        ) {

            updateData.city =
                String(
                    updateData.city
                ).trim();

        }


        if (
            updateData.state !==
            undefined
        ) {

            updateData.state =
                String(
                    updateData.state
                ).trim();

        }


        if (
            updateData.role !==
            undefined
        ) {

            const validRoles = [

                "donor",

                "patient",

                "admin"

            ];


            if (
                !validRoles.includes(
                    updateData.role
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid user role."

                });

            }

        }


        const user =
            await User.findByIdAndUpdate(

                userId,

                updateData,

                {
                    new: true,

                    runValidators: true

                }

            )
                .select(
                    "-password " +
                    "-resetPasswordTokenHash " +
                    "-resetPasswordExpires " +
                    "-emailVerificationTokenHash " +
                    "-emailVerificationExpires"
                )
                .lean();


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
                "User updated successfully.",

            user

        });


    } catch (error) {

        console.error(
            "ADMIN UPDATE USER ERROR:",
            error
        );


        if (
            error.name ===
            "CastError"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid user ID."

            });

        }


        if (
            error.code === 11000
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Phone number or email already exists."

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
                "Unable to update user."

        });

    }

};


/* =========================================================
   DELETE USER
   DELETE /api/admin/users/:id
   ========================================================= */

const deleteUser = async (req, res) => {

    try {

        const userId =
            req.params.id;


        /*
         * Admin ko khud ko accidentally
         * delete karne se protect karna.
         */

        if (
            req.user &&
            req.user._id &&
            req.user._id.toString() ===
            userId
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "You cannot delete your own admin account."

            });

        }


        const user =
            await User.findByIdAndDelete(
                userId
            );


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
                "User deleted successfully."

        });


    } catch (error) {

        console.error(
            "ADMIN DELETE USER ERROR:",
            error
        );


        if (
            error.name ===
            "CastError"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid user ID."

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Unable to delete user."

        });

    }

};


/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = {

    getUsers,

    getUser,

    updateUser,

    deleteUser

};