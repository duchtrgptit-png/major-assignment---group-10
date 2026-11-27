const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Ticket = require("../models/Ticket");

exports.payBooking = async (req, res) => {
  try {
    const { bookingId, method, simulateFail } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ message: "Không tìm thấy booking" });
    if (booking.status !== "pending")
      return res
        .status(400)
        .json({ message: "Booking này không ở trạng thái chờ thanh toán" });

    const payment = await Payment.create({
      bookingId: booking._id,
      amount: booking.totalAmount,
      method,
      transactionCode: "TX" + Date.now(),
    });

    if (simulateFail) {
      payment.status = "failed";
      await payment.save();
      return res
        .status(402)
        .json({ message: "Thanh toán thất bại, bạn có thể thử lại", payment });
    }

    payment.status = "success";
    payment.paidAt = new Date();
    await payment.save();

    booking.status = "confirmed";
    await booking.save();

    const tickets = await Ticket.insertMany(
      booking.passengers.map((p, i) => ({
        ticketNumber: `${booking.bookingCode}-${i + 1}`,
        bookingId: booking._id,
        flightId: booking.flightId,
        passengerName: p.fullName,
      })),
    );

    res.json({ message: "Thanh toán thành công", payment, booking, tickets });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getPaymentsByBooking = async (req, res) => {
  try {
    const payments = await Payment.find({ bookingId: req.params.bookingId });
    res.json(payments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
