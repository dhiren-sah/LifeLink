const router = require("express").Router();
const controller = require("../controllers/donationController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
router.post("/want-to-donate", requireAuth, controller.wantToDonate);
router.get("/pending-donors", requireAuth, controller.getPendingDonors);
router.put("/pending-donors/:id/complete", requireAuth, requireAdmin, controller.completeCollection);
router.get("/my-donations", requireAuth, controller.getMyDonations);
module.exports = router;
