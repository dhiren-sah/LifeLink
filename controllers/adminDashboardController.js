const mongoose = require("mongoose");


// =========================================================
// ADMIN DASHBOARD CONTROLLER
// =========================================================


// =========================================================
// GET ADMIN DASHBOARD DATA
// =========================================================

const getDashboardData = async (req, res) => {

    try {

        // =====================================================
        // MONGODB DATABASE
        // =====================================================

        const db = mongoose.connection.db;


        if (!db) {

            return res.status(500).json({

                success: false,

                message: "Database connection is not available."

            });

        }


        // =====================================================
        // COLLECTIONS
        // =====================================================

        const usersCollection =
            db.collection("users");


        const donorsCollection =
            db.collection("donors");


        const requestsCollection =
            db.collection("bloodrequests");


        const donationsCollection =
            db.collection("donations");


        const bloodAvailabilityCollection =
            db.collection("bloodavailabilities");


        // =====================================================
        // 1. TOTAL USERS
        // =====================================================

        const totalUsers =
            await usersCollection.countDocuments();


        // =====================================================
        // 2. TOTAL DONORS
        // =====================================================

        const totalDonors =
            await donorsCollection.countDocuments();


        // =====================================================
        // 3. TOTAL DONATIONS
        // =====================================================

        const totalDonations =
            await donationsCollection.countDocuments();


        // =====================================================
        // 4. PENDING BLOOD REQUESTS
        // =====================================================

        const pendingRequests =
            await requestsCollection.countDocuments({

                status: "Pending"

            });


        // =====================================================
        // 5. BLOOD INVENTORY
        // =====================================================

        const bloodInventoryRecords =
            await bloodAvailabilityCollection
                .find({})
                .toArray();


        // =====================================================
        // CALCULATE BLOOD INVENTORY BY GROUP
        // =====================================================

        const bloodGroups = [

            "A+",
            "A-",
            "B+",
            "B-",
            "AB+",
            "AB-",
            "O+",
            "O-"

        ];


        const inventoryMap = {};


        bloodGroups.forEach((group) => {

            inventoryMap[group] = 0;

        });


        bloodInventoryRecords.forEach((record) => {

            const group =
                record.bloodGroup ||
                record.blood_group ||
                record.group ||
                record.type;


            const units =
                Number(
                    record.availableUnits ??
                    record.available_units ??
                    record.units ??
                    record.quantity ??
                    record.available ??
                    0
                );


            if (
                group &&
                Object.prototype.hasOwnProperty.call(
                    inventoryMap,
                    group
                )
            ) {

                inventoryMap[group] +=
                    Number.isFinite(units)
                        ? units
                        : 0;

            }

        });


        // =====================================================
        // TOTAL AVAILABLE BLOOD UNITS
        // =====================================================

        const availableBloodUnits =
            Object.values(inventoryMap)
                .reduce(
                    (total, units) =>
                        total + units,
                    0
                );


        // =====================================================
        // FORMAT INVENTORY
        // =====================================================

        const bloodInventory =
            bloodGroups.map((group) => ({

                bloodGroup: group,

                units:
                    inventoryMap[group]

            }));


        // =====================================================
        // 6. PENDING REQUEST LIST
        // =====================================================

        const pendingRequestRecords =
            await requestsCollection
                .find({
                    status: "Pending"
                })
                .sort({
                    createdAt: -1
                })
                .limit(10)
                .toArray();


        // =====================================================
        // GET USER INFORMATION FOR REQUESTS
        // =====================================================

        const pendingRequestsData = [];


        for (
            const request
            of pendingRequestRecords
        ) {

            let user = null;


            if (request.user) {

                try {

                    const userId =
                        new mongoose.Types.ObjectId(
                            request.user
                        );


                    user =
                        await usersCollection.findOne(
                            {
                                _id: userId
                            },
                            {
                                projection: {

                                    fullName: 1,

                                    phoneNumber: 1,

                                    email: 1

                                }

                            }
                        );

                } catch (error) {

                    user = null;

                }

            }


            pendingRequestsData.push({

                _id: request._id,

                patientName:
                    user?.fullName ||
                    request.patientName ||
                    "Unknown",

                bloodGroup:
                    request.bloodGroup ||
                    "-",

                units:
                    Number(
                        request.units || 0
                    ),

                hospital:
                    request.hospital ||
                    "-",

                urgency:
                    request.urgency ||
                    "Normal",

                status:
                    request.status ||
                    "Pending",

                createdAt:
                    request.createdAt ||
                    request.date ||
                    null

            });

        }


        // =====================================================
        // 7. RECENT REQUESTS
        // =====================================================

        const recentRequests =
            await requestsCollection
                .find({})
                .sort({
                    createdAt: -1
                })
                .limit(5)
                .toArray();


        // =====================================================
        // 8. RECENT DONATIONS
        // =====================================================

        const recentDonations =
            await donationsCollection
                .find({})
                .sort({
                    createdAt: -1
                })
                .limit(5)
                .toArray();


        // =====================================================
        // 9. RECENT ACTIVITY
        // =====================================================

        const recentActivity = [];


        recentRequests.forEach((request) => {

            recentActivity.push({

                title:
                    "Blood Request",

                description:
                    `${request.bloodGroup || "-"} blood request for ${request.hospital || "hospital"}`,

                createdAt:
                    request.createdAt ||
                    null,

                time:
                    request.createdAt ||
                    null

            });

        });


        recentDonations.forEach((donation) => {

            recentActivity.push({

                title:
                    "Blood Donation",

                description:
                    `${donation.bloodGroup || "-"} blood donation recorded`,

                createdAt:
                    donation.createdAt ||
                    null,

                time:
                    donation.createdAt ||
                    null

            });

        });


        // =====================================================
        // SORT RECENT ACTIVITY
        // =====================================================

        recentActivity.sort((a, b) => {

            const dateA =
                new Date(
                    a.createdAt || 0
                ).getTime();


            const dateB =
                new Date(
                    b.createdAt || 0
                ).getTime();


            return dateB - dateA;

        });


        // =====================================================
        // LIMIT ACTIVITY
        // =====================================================

        const finalRecentActivity =
            recentActivity.slice(0, 10);


        // =====================================================
        // 10. NOTIFICATION COUNT
        // =====================================================

        const notificationCount =
            pendingRequests;


        // =====================================================
        // FINAL RESPONSE
        // =====================================================

        return res.status(200).json({

            success: true,

            statistics: {

                totalUsers,

                totalDonors,

                availableBloodUnits,

                pendingRequests,

                totalDonations

            },

            bloodInventory,

            pendingRequestsData,

            recentActivity:
                finalRecentActivity,

            notificationCount

        });


    } catch (error) {

        console.error(
            "ADMIN DASHBOARD ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load admin dashboard data."

        });

    }

};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    getDashboardData

};