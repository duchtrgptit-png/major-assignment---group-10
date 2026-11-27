const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date },
  price: { type: Number, required: true, min: 0 },
  totalSeats: { type: Number, default: 100, min: 0 },
  status: {
    type: String,
    enum: ["scheduled", "cancelled"],
    default: "scheduled",
  },
});

module.exports =
  mongoose.models.Flight || mongoose.model("Flight", flightSchema);
