
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Aircraft from "../models/aircraft.model.js";
import Airline from "../models/airline.model.js";

// CREATE
export const createAircraft = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { airlineId } = req.body;

    if (!mongoose.isValidObjectId(airlineId)) {
      res.status(400).json({
        success: false,
        message: "Invalid airline ID",
      });
      return;
    }

    const airline = await Airline.findById(airlineId);

    if (!airline) {
      res.status(404).json({
        success: false,
        message: "Airline not found",
      });
      return;
    }

    const aircraft = await Aircraft.create(req.body);

    res.status(201).json({
      success: true,
      message: "Aircraft created successfully",
      data: aircraft,
    });
  } catch (error) {
    next(error);
  }
};

// READ ALL
export const getAllAircrafts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const aircrafts = await Aircraft.find()
      .populate("airlineId", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: aircrafts.length,
      data: aircrafts,
    });
  } catch (error) {
    next(error);
  }
};

// READ ONE
export const getAircraftById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid aircraft ID",
      });
      return;
    }

    const aircraft = await Aircraft.findById(id)
      .populate("airlineId", "name code");

    if (!aircraft) {
      res.status(404).json({
        success: false,
        message: "Aircraft not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: aircraft,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateAircraft = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid aircraft ID",
      });
      return;
    }

    if (req.body.airlineId !== undefined) {
      if (!mongoose.isValidObjectId(req.body.airlineId)) {
        res.status(400).json({
          success: false,
          message: "Invalid airline ID",
        });
        return;
      }

      const airline = await Airline.findById(req.body.airlineId);

      if (!airline) {
        res.status(404).json({
          success: false,
          message: "Airline not found",
        });
        return;
      }
    }

    const aircraft = await Aircraft.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("airlineId", "name code");

    if (!aircraft) {
      res.status(404).json({
        success: false,
        message: "Aircraft not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Aircraft updated successfully",
      data: aircraft,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE
export const deleteAircraft = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid aircraft ID",
      });
      return;
    }

    const aircraft = await Aircraft.findByIdAndDelete(id);

    if (!aircraft) {
      res.status(404).json({
        success: false,
        message: "Aircraft not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Aircraft deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
