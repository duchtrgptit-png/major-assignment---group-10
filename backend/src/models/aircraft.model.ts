
import mongoose, { Schema, Types } from "mongoose";

export interface IAircraft extends Document {
  airlineId: Types.ObjectId;
  aircraftCode: string;
  model: string;
  manufacturer: string;
  totalSeats: number;
  seatConfiguration: {
    economy: number;
    business: number;
  };
  status: "active" | "maintenance" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const aircraftSchema = new Schema<IAircraft>(
  {
    airlineId: {
      type: Schema.Types.ObjectId,
      ref: "Airline",
      required: [true, "Airline is required"],
    },

    aircraftCode: {
      type: String,
      required: [true, "Aircraft code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    model: {
      type: String,
      required: [true, "Aircraft model is required"],
      trim: true,
    },

    manufacturer: {
      type: String,
      required: [true, "Manufacturer is required"],
      trim: true,
    },

    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: 1,
    },

    seatConfiguration: {
      economy: {
        type: Number,
        required: true,
        min: 0,
      },
      business: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    status: {
      type: String,
      enum: ["active", "maintenance", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Kiểm tra tổng số ghế có khớp với cấu hình không
aircraftSchema.pre("validate", function () {
  if (
    this.seatConfiguration &&
    this.totalSeats !==
      this.seatConfiguration.economy +
        this.seatConfiguration.business
  ) {
    this.invalidate(
      "totalSeats",
      "Total seats must equal economy + business seats"
    );
  }
});

const Aircraft = mongoose.model<IAircraft>(
  "Aircraft",
  aircraftSchema
);

export default Aircraft;
