const BloodAvailability = require("../models/BloodAvailability");


// =====================================================
// GET BLOOD INVENTORY
// GET /api/admin/blood-inventory
// =====================================================

const getInventory = async (req, res) => {
    try {

        const inventory =
            await BloodAvailability.find({})
                .sort({
                    bloodGroup: 1
                })
                .lean();


        return res.status(200).json({
            success: true,
            count: inventory.length,
            inventory
        });

    } catch (error) {

        console.error(
            "ADMIN GET BLOOD INVENTORY ERROR:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch blood inventory."
        });

    }
};


// =====================================================
// GET SINGLE BLOOD GROUP
// GET /api/admin/blood-inventory/:id
// =====================================================

const getInventoryItem = async (req, res) => {
    try {

        const inventoryItem =
            await BloodAvailability.findById(
                req.params.id
            ).lean();


        if (!inventoryItem) {

            return res.status(404).json({
                success: false,
                message:
                    "Blood inventory record not found."
            });

        }


        return res.status(200).json({
            success: true,
            inventory: inventoryItem
        });

    } catch (error) {

        console.error(
            "ADMIN GET INVENTORY ITEM ERROR:",
            error
        );


        if (
            error.name ===
            "CastError"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid inventory ID."
            });

        }


        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch inventory record."
        });

    }
};


// =====================================================
// UPDATE BLOOD INVENTORY
// PUT /api/admin/blood-inventory/:id
// =====================================================

const updateInventory = async (req, res) => {
    try {

        const inventoryId =
            req.params.id;


        const updateData = {};


        // -------------------------------------------------
        // AVAILABLE UNITS
        // -------------------------------------------------

        if (
            req.body.availableUnits !==
            undefined
        ) {

            const availableUnits =
                Number(
                    req.body.availableUnits
                );


            if (
                !Number.isInteger(
                    availableUnits
                ) ||
                availableUnits < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Available units must be a non-negative whole number."
                });

            }


            updateData.availableUnits =
                availableUnits;

        }


        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        if (
            req.body.status !==
            undefined
        ) {

            const status =
                String(
                    req.body.status
                ).trim();


            const validStatuses = [
                "Available",
                "Low Stock",
                "Out of Stock"
            ];


            if (
                !validStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid blood inventory status."
                });

            }


            updateData.status =
                status;

        }


        // -------------------------------------------------
        // AUTO STATUS
        // -------------------------------------------------

        if (
            updateData.availableUnits !==
                undefined &&
            updateData.status ===
                undefined
        ) {

            if (
                updateData.availableUnits ===
                0
            ) {

                updateData.status =
                    "Out of Stock";

            } else if (
                updateData.availableUnits <=
                10
            ) {

                updateData.status =
                    "Low Stock";

            } else {

                updateData.status =
                    "Available";

            }

        }


        // -------------------------------------------------
        // LAST UPDATED
        // -------------------------------------------------

        updateData.lastUpdated =
            new Date();


        // -------------------------------------------------
        // UPDATE DATABASE
        // -------------------------------------------------

        const inventoryItem =
            await BloodAvailability.findByIdAndUpdate(
                inventoryId,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            ).lean();


        if (!inventoryItem) {

            return res.status(404).json({
                success: false,
                message:
                    "Blood inventory record not found."
            });

        }


        return res.status(200).json({
            success: true,
            message:
                "Blood inventory updated successfully.",
            inventory: inventoryItem
        });

    } catch (error) {

        console.error(
            "ADMIN UPDATE BLOOD INVENTORY ERROR:",
            error
        );


        if (
            error.name ===
            "CastError"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid inventory ID."
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
                "Unable to update blood inventory."
        });

    }
};


module.exports = {
    getInventory,
    getInventoryItem,
    updateInventory
};