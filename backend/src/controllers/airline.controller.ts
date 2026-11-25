
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Airline from "../models/airline.model.js";

// 1. Tạo hãng hàng không
export const createAirline = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const airline = await Airline.create(req.body);

    res.status(201).json({
      success: true,
      message: "Airline created successfully",
      data: airline,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy danh sách hãng hàng không
export const getAllAirlines = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const airlines = await Airline.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: airlines.length,
      data: airlines,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Lấy thông tin một hãng hàng không
export const getAirlineById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid airline ID",
      });
      return;
    }

    const airline = await Airline.findById(id);

    if (!airline) {
      res.status(404).json({
        success: false,
        message: "Airline not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: airline,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Cập nhật hãng hàng không
export const updateAirline = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid airline ID",
      });
      return;
    }

    const airline = await Airline.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!airline) {
      res.status(404).json({
        success: false,
        message: "Airline not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Airline updated successfully",
      data: airline,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Xóa hãng hàng không
export const deleteAirline = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid airline ID",
      });
      return;
    }

    const airline = await Airline.findByIdAndDelete(id);

    if (!airline) {
      res.status(404).json({
        success: false,
        message: "Airline not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Airline deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
