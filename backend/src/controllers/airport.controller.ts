
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Airport from "../models/airport.model.js";

// CREATE
export const createAirport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const airport = await Airport.create(req.body);

    res.status(201).json({
      success: true,
      message: "Airport created successfully",
      data: airport,
    });
  } catch (error) {
    next(error);
  }
};

// READ ALL
export const getAllAirports = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const airports = await Airport.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: airports.length,
      data: airports,
    });
  } catch (error) {
    next(error);
  }
};

// READ ONE
export const getAirportById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid airport ID",
      });
      return;
    }

    const airport = await Airport.findById(id);

    if (!airport) {
      res.status(404).json({
        success: false,
        message: "Airport not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: airport,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateAirport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid airport ID",
      });
      return;
    }

    const airport = await Airport.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!airport) {
      res.status(404).json({
        success: false,
        message: "Airport not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Airport updated successfully",
      data: airport,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE
export const deleteAirport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid airport ID",
      });
      return;
    }

    const airport = await Airport.findByIdAndDelete(id);

    if (!airport) {
      res.status(404).json({
        success: false,
        message: "Airport not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Airport deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
