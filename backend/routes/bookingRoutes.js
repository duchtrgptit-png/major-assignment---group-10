const router = require("express").Router();
const c = require("../controllers/bookingController");

router.post("/", c.createBooking);
router.get("/user/:userId", c.getBookingsByUser);
router.get("/:id", c.getBookingById);
router.put("/:id/cancel", c.cancelBooking);

module.exports = router;
