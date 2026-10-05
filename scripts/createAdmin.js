const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");


// ==============================
// ADMIN DETAILS
// ==============================

const ADMIN_EMAIL = "dhiren111@gmail.com";

// Yahan apna wahi admin password likho
const ADMIN_PASSWORD = "dHiren59";


// ==============================
// CREATE / UPDATE ADMIN
// ==============================

const createAdmin = async () => {

    try {

        // ==============================
        // CONNECT MONGODB
        // ==============================

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log("MongoDB Connected");


        // ==============================
        // CHECK EXISTING USER
        // ==============================

        let admin =
            await User.findOne({
                email: ADMIN_EMAIL
            });


        // ==============================
        // UPDATE EXISTING USER
        // ==============================

        if (admin) {

            admin.role = "admin";

            admin.password =
                ADMIN_PASSWORD;

            admin.emailVerified = true;


            await admin.save();


            console.log(
                "Existing user converted to admin successfully."
            );

        }


        // ==============================
        // CREATE NEW ADMIN
        // ==============================

        else {

            admin = new User({

                fullName: "Blood Bank Admin",

                phoneNumber:
                    "ADMIN_" +
                    Date.now(),

                email:
                    ADMIN_EMAIL,

                password:
                    ADMIN_PASSWORD,

                bloodGroup:
                    "O+",

                address: "",

                city: "",

                state: "",

                role: "admin",

                emailVerified: true

            });


            await admin.save();


            console.log(
                "New admin created successfully."
            );

        }


        // ==============================
        // RESULT
        // ==============================

        console.log("");
        console.log("==============================");
        console.log("ADMIN ACCOUNT READY");
        console.log("==============================");
        console.log("Email :", admin.email);
        console.log("Role  :", admin.role);
        console.log("==============================");


        await mongoose.connection.close();

        process.exit(0);


    } catch (error) {

        console.error(
            "CREATE ADMIN ERROR:",
            error
        );

        await mongoose.connection.close();

        process.exit(1);

    }

};


createAdmin();