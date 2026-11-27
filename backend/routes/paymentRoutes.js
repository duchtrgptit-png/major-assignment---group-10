const router = require("express").Router();
const c = require("../controllers/paymentController");

router.post("/", c.payBooking);
router.get("/booking/:bookingId", c.getPaymentsByBooking);

module.exports = router;
