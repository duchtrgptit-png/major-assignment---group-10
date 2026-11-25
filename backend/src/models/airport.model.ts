
import mongoose, { Schema, Document } from "mongoose";

export interface IAirport extends Document {
  name: string;
  code: string;
  city: string;
  country: string;
  address?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const airportSchema = new Schema<IAirport>(
  {
    name: {
      type: String,
      required: [true, "Airport name is required"],
      trim: true,
    },

    code: {
      type: String,
      required: [true, "Airport code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Airport = mongoose.model<IAirport>("Airport", airportSchema);

export default Airport;
