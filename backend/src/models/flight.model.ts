
import mongoose, { Schema, Types, Document } from "mongoose";

export interface IFlight extends Document {
  flightNumber: string;
  airlineId: Types.ObjectId;
  aircraftId: Types.ObjectId;
  departureAirportId: Types.ObjectId;
  arrivalAirportId: Types.ObjectId;
  departureTime: Date;
  arrivalTime: Date;
  economyPrice: number;
  businessPrice: number;
  status: "scheduled" | "delayed" | "cancelled" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const flightSchema = new Schema<IFlight>(
  {
    flightNumber: {
      type: String,
      required: [true, "Flight number is required"],
      uppercase: true,
      trim: true,
    },

    airlineId: {
      type: Schema.Types.ObjectId,
      ref: "Airline",
      required: [true, "Airline is required"],
    },

    aircraftId: {
      type: Schema.Types.ObjectId,
      ref: "Aircraft",
      required: [true, "Aircraft is required"],
    },

    departureAirportId: {
      type: Schema.Types.ObjectId,
      ref: "Airport",
      required: [true, "Departure airport is required"],
    },

    arrivalAirportId: {
      type: Schema.Types.ObjectId,
      ref: "Airport",
      required: [true, "Arrival airport is required"],
    },

    departureTime: {
      type: Date,
      required: [true, "Departure time is required"],
    },

    arrivalTime: {
      type: Date,
      required: [true, "Arrival time is required"],
    },

    economyPrice: {
      type: Number,
      required: [true, "Economy price is required"],
      min: 0,
    },

    businessPrice: {
      type: Number,
      required: [true, "Business price is required"],
      min: 0,
    },

    status: {
      type: String,
      enum: ["scheduled", "delayed", "cancelled", "completed"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

// Kiểm tra sân bay đi và đến không được trùng nhau
flightSchema.pre("validate", function () {
  if (
    this.departureAirportId &&
    this.arrivalAirportId &&
    this.departureAirportId.equals(this.arrivalAirportId)
  ) {
    this.invalidate(
      "arrivalAirportId",
      "Departure and arrival airports must be different"
    );
  }

  if (
    this.departureTime &&
    this.arrivalTime &&
    this.arrivalTime <= this.departureTime
  ) {
    this.invalidate(
      "arrivalTime",
      "Arrival time must be after departure time"
    );
  }
});

const Flight = mongoose.model<IFlight>(
  "Flight",
  flightSchema,
  "Flights"
  );

export default Flight;
