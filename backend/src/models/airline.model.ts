
import mongoose, { Schema, Document } from "mongoose";

// 1. Định nghĩa cấu trúc dữ liệu Airline
export interface IAirline extends Document {
  name: string;
  code: string;
  logo?: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

// 2. Tạo Schema
const airlineSchema = new Schema<IAirline>(
  {
    name: {
      type: String,
      required: [true, "Airline name is required"],
      trim: true,
    },

    code: {
      type: String,
      required: [true, "Airline code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

    description: {
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

// 3. Tạo Model
const Airline = mongoose.model<IAirline>("Airline", airlineSchema);

export default Airline;
