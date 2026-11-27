const Booking = require("../models/Booking");
const Ticket = require("../models/Ticket");
const Flight = require("../models/Flight");

// Mã booking ngẫu nhiên
const genCode = () => "BK" + Date.now().toString(36).toUpperCase();

exports.createBooking = async (req, res) => {
  try {
    const { userId, flightId, passengers } = req.body;

    const flight = await Flight.findById(flightId);
    if (!flight)
      return res.status(404).json({ message: "Không tìm thấy chuyến bay" });

    const booking = await Booking.create({
      bookingCode: genCode(),
      userId,
      flightId,
      passengers,
      totalAmount: flight.price * passengers.length,
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getBookingsByUser = async (req, res) => {
  const bookings = await Booking.find({ userId: req.params.userId })
    .populate("flightId")
    .sort({ createdAt: -1 });
  res.json(bookings);
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("flightId");
    if (!booking)
      return res.status(404).json({ message: "Không tìm thấy booking" });
    const tickets = await Ticket.find({ bookingId: booking._id });
    res.json({ booking, tickets });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 4. Hủy booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ message: "Không tìm thấy booking" });
    if (booking.status === "cancelled")
      return res.status(400).json({ message: "Booking đã được hủy trước đó" });

    booking.status = "cancelled";
    await booking.save();
    await Ticket.updateMany(
      { bookingId: booking._id },
      { status: "cancelled" },
    );
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
