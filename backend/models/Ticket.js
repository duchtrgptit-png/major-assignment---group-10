const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  flightId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flight",
    required: true,
  },
  passengerName: { type: String, required: true },
  seatNumber: { type: String },
  ticketClass: {
    type: String,
    enum: ["economy", "business"],
    default: "economy",
  },
  status: { type: String, enum: ["issued", "cancelled"], default: "issued" },
});

module.exports = mongoose.model("Ticket", ticketSchema);
