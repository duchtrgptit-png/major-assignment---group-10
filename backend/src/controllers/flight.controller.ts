
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import Flight from "../models/flight.model.js";
import Airline from "../models/airline.model.js";
import Aircraft from "../models/aircraft.model.js";
import Airport from "../models/airport.model.js";

// Kiểm tra các document được tham chiếu có tồn tại không
const validateFlightReferences = async (data: {
  airlineId: string;
  aircraftId: string;
  departureAirportId: string;
  arrivalAirportId: string;
}) => {
  const {
    airlineId,
    aircraftId,
    departureAirportId,
    arrivalAirportId,
  } = data;

  const ids = [airlineId, aircraftId, departureAirportId, arrivalAirportId];

  if (!ids.every((id) => mongoose.isValidObjectId(id))) {
    return { valid: false, message: "One or more IDs are invalid" };
  }

  const [airline, aircraft, departureAirport, arrivalAirport] =
    await Promise.all([
      Airline.findById(airlineId),
      Aircraft.findById(aircraftId),
      Airport.findById(departureAirportId),
      Airport.findById(arrivalAirportId),
    ]);

  if (!airline) {
    return { valid: false, message: "Airline not found" };
  }

  if (!aircraft) {
    return { valid: false, message: "Aircraft not found" };
  }

  if (!departureAirport) {
    return { valid: false, message: "Departure airport not found" };
  }

  if (!arrivalAirport) {
    return { valid: false, message: "Arrival airport not found" };
  }

  if (departureAirportId === arrivalAirportId) {
    return {
      valid: false,
      message: "Departure and arrival airports must be different",
    };
  }

  if (aircraft.airlineId.toString() !== airlineId) {
    return {
      valid: false,
      message: "Aircraft does not belong to the selected airline",
    };
  }

  return { valid: true };
};

// CREATE
export const createFlight = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const referenceResult = await validateFlightReferences(req.body);

    if (!referenceResult.valid) {
      res.status(400).json({
        success: false,
        message: referenceResult.message,
      });
      return;
    }

    const flight = await Flight.create(req.body);

    res.status(201).json({
      success: true,
      message: "Flight created successfully",
      data: flight,
    });
  } catch (error) {
    next(error);
  }
};

// READ ALL
export const getAllFlights = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const flights = await Flight.find()
      .populate("airlineId", "name code")
      .populate("aircraftId", "aircraftCode model manufacturer")
      .populate("departureAirportId", "name code city")
      .populate("arrivalAirportId", "name code city")
      .sort({ departureTime: 1 });

    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    next(error);
  }
};

// READ ONE
export const getFlightById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid flight ID",
      });
      return;
    }

    const flight = await Flight.findById(id)
      .populate("airlineId", "name code")
      .populate("aircraftId", "aircraftCode model manufacturer")
      .populate("departureAirportId", "name code city")
      .populate("arrivalAirportId", "name code city");

    if (!flight) {
      res.status(404).json({
        success: false,
        message: "Flight not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: flight,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateFlight = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid flight ID",
      });
      return;
    }

    const existingFlight = await Flight.findById(id);

    if (!existingFlight) {
      res.status(404).json({
        success: false,
        message: "Flight not found",
      });
      return;
    }

    // Kết hợp dữ liệu cũ và dữ liệu mới để kiểm tra quan hệ
    const updatedData = {
      airlineId: String(req.body.airlineId ?? existingFlight.airlineId),
      aircraftId: String(req.body.aircraftId ?? existingFlight.aircraftId),
      departureAirportId: String(
        req.body.departureAirportId ?? existingFlight.departureAirportId
      ),
      arrivalAirportId: String(
        req.body.arrivalAirportId ?? existingFlight.arrivalAirportId
      ),
    };

    const referenceResult = await validateFlightReferences(updatedData);

    if (!referenceResult.valid) {
      res.status(400).json({
        success: false,
        message: referenceResult.message,
      });
      return;
    }

    const flight = await Flight.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("airlineId", "name code")
      .populate("aircraftId", "aircraftCode model manufacturer")
      .populate("departureAirportId", "name code city")
      .populate("arrivalAirportId", "name code city");

    res.status(200).json({
      success: true,
      message: "Flight updated successfully",
      data: flight,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE
export const deleteFlight = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid flight ID",
      });
      return;
    }

    const flight = await Flight.findByIdAndDelete(id);

    if (!flight) {
      res.status(404).json({
        success: false,
        message: "Flight not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Flight deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
