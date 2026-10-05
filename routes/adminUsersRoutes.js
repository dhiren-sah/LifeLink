const express = require("express");

const router = express.Router();

const adminUsersController =
    require("../controllers/adminUsersController");

const {
    requireAuth,
    requireAdmin
} = require("../middleware/auth");


/* =========================================================
   ADMIN USERS ROUTES
   ========================================================= */


/*
   GET ALL USERS
   GET /api/admin/users
*/

router.get(
    "/",
    requireAuth,
    requireAdmin,
    adminUsersController.getUsers
);


/*
   GET SINGLE USER
   GET /api/admin/users/:id
*/

router.get(
    "/:id",
    requireAuth,
    requireAdmin,
    adminUsersController.getUser
);


/*
   UPDATE USER
   PUT /api/admin/users/:id
*/

router.put(
    "/:id",
    requireAuth,
    requireAdmin,
    adminUsersController.updateUser
);


/*
   DELETE USER
   DELETE /api/admin/users/:id
*/

router.delete(
    "/:id",
    requireAuth,
    requireAdmin,
    adminUsersController.deleteUser
);


module.exports = router;