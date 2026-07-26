const router = require("express").Router();
const controller = require("../controllers/requestController");
const { requireAuth } = require("../middleware/auth");
router.post("/blood-requests", requireAuth, controller.createRequest);
router.get("/my-requests", requireAuth, controller.getMyRequests);
router.get("/pending-blood-requests", requireAuth, controller.getPendingRequests);
module.exports = router;
