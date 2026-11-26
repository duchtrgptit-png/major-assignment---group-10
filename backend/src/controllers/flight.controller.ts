
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
// Kiểm tra máy bay có bị trùng lịch bay không
const checkAircraftSchedule = async (
  aircraftId: string,
  departureTime: Date,
  arrivalTime: Date,
  excludeFlightId?: string
) => {
  const filter: any = {
    aircraftId,
    status: { $in: ["scheduled", "delayed"] },

    // Kiểm tra hai chuyến bay có bị trùng thời gian không
    departureTime: { $lt: arrivalTime },
    arrivalTime: { $gt: departureTime },
  };

  // Khi cập nhật, bỏ qua chính chuyến bay đang sửa
  if (excludeFlightId) {
    filter._id = { $ne: excludeFlightId };
  }

  const existingFlight = await Flight.findOne(filter);

  return existingFlight;
};
// CREATE
export const createFlight = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Kiểm tra các ID tham chiếu có hợp lệ không
await validateFlightReferences(req.body);

// 2. Kiểm tra trùng lịch bay
const conflict = await checkAircraftSchedule(
  req.body.aircraftId,
  new Date(req.body.departureTime),
  new Date(req.body.arrivalTime)
);

// 3. Nếu máy bay đã có chuyến bay trùng lịch
if (conflict) {
  res.status(409).json({
    success: false,
    message: "Aircraft already has a flight scheduled during this time",
    conflictFlight: conflict.flightNumber,
  });
  return;
}

// 4. Nếu không trùng lịch thì tạo chuyến bay
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




// READ ALL - SEARCH, FILTER & PAGINATION
export const getAllFlights = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter: any = {};

    const {
      departureAirportId,
      arrivalAirportId,
      date,
      status,
      flightNumber,
      airlineId,
    } = req.query;

    // 1. Filter by departure airport
    if (typeof departureAirportId === "string") {
      if (!mongoose.isValidObjectId(departureAirportId)) {
        res.status(400).json({
          success: false,
          message: "Invalid departureAirportId",
        });
        return;
      }

      filter.departureAirportId = departureAirportId;
    }

    // 2. Filter by arrival airport
    if (typeof arrivalAirportId === "string") {
      if (!mongoose.isValidObjectId(arrivalAirportId)) {
        res.status(400).json({
          success: false,
          message: "Invalid arrivalAirportId",
        });
        return;
      }

      filter.arrivalAirportId = arrivalAirportId;
    }

    // 3. Filter by departure date
    if (typeof date === "string") {
      const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
      const startDate = new Date(`${date}T00:00:00.000Z`);

      if (
        !validDate ||
        isNaN(startDate.getTime()) ||
        startDate.toISOString().slice(0, 10) !== date
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid date. Use YYYY-MM-DD",
        });
        return;
      }

      const endDate = new Date(startDate);
      endDate.setUTCDate(endDate.getUTCDate() + 1);

      filter.departureTime = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    // 4. Filter by status
    if (typeof status === "string") {
      const allowedStatuses = [
        "scheduled",
        "delayed",
        "cancelled",
        "completed",
      ];

      if (!allowedStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: "Invalid flight status",
        });
        return;
      }

      filter.status = status;
    }

    // 5. Search by flight number
    if (typeof flightNumber === "string" && flightNumber.trim()) {
      const keyword = flightNumber.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.flightNumber = {
        $regex: keyword,
        $options: "i",
      };
    }

  // Lọc theo hãng hàng không
  if (airlineId) {
    if (!mongoose.isValidObjectId(airlineId)) {
      res.status(400).json({
        success: false,
        message: "Invalid airline ID",
      });
      return;
    }

    filter.airlineId = airlineId;
}

  // Lọc theo khoảng giá vé phổ thông
const { minPrice, maxPrice } = req.query;

if (minPrice !== undefined || maxPrice !== undefined) {
  const min = minPrice !== undefined ? Number(minPrice) : 0;
  const max = maxPrice !== undefined ? Number(maxPrice) : Infinity;

  // Kiểm tra giá vé hợp lệ
  if (
    !Number.isFinite(min) ||
    min < 0 ||
    (maxPrice !== undefined && (!Number.isFinite(max) || max < 0))
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid price range",
    });
    return;
  }

  // Kiểm tra giá thấp nhất không được lớn hơn giá cao nhất
  if (min > max) {
    res.status(400).json({
      success: false,
      message: "minPrice cannot be greater than maxPrice",
    });
    return;
  }

  filter.economyPrice = {
    $gte: min,
    ...(maxPrice !== undefined && { $lte: max }),
  };
}

// Lọc theo khoảng giá vé Thương gia
const { minBusinessPrice, maxBusinessPrice } = req.query;

if (
  minBusinessPrice !== undefined ||
  maxBusinessPrice !== undefined
) {
  const min =
    minBusinessPrice !== undefined
      ? Number(minBusinessPrice)
      : 0;

  const max =
    maxBusinessPrice !== undefined
      ? Number(maxBusinessPrice)
      : Infinity;

  // Kiểm tra giá vé hợp lệ
  if (
    !Number.isFinite(min) ||
    min < 0 ||
    (maxBusinessPrice !== undefined &&
      (!Number.isFinite(max) || max < 0))
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid business price range",
    });
    return;
  }

  // Kiểm tra giá thấp nhất không lớn hơn giá cao nhất
  if (min > max) {
    res.status(400).json({
      success: false,
      message: "minBusinessPrice cannot be greater than maxBusinessPrice",
    });
    return;
  }

  filter.businessPrice = {
    $gte: min,
    ...(maxBusinessPrice !== undefined && { $lte: max }),
  };
}

// Lọc theo khoảng thời gian khởi hành
const { departureFrom, departureTo } = req.query;

if (departureFrom !== undefined || departureTo !== undefined) {
  // Chuyển thời gian thành Date
  const from =
    typeof departureFrom === "string"
      ? new Date(departureFrom)
      : undefined;

  const to =
    typeof departureTo === "string"
      ? new Date(departureTo)
      : undefined;

  // Kiểm tra định dạng thời gian
  if (
    (departureFrom !== undefined &&
      (!from || Number.isNaN(from.getTime()))) ||
    (departureTo !== undefined &&
      (!to || Number.isNaN(to.getTime())))
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid departure time format",
    });
    return;
  }

  // Kiểm tra thời gian bắt đầu không lớn hơn thời gian kết thúc
  if (from && to && from > to) {
    res.status(400).json({
      success: false,
      message: "departureFrom cannot be greater than departureTo",
    });
    return;
  }

  // Thêm điều kiện vào bộ lọc
  filter.departureTime = {
    ...filter.departureTime,
    ...(from && { $gte: from }),
    ...(to && { $lte: to }),
  };
}




    // 6. Pagination
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      res.status(400).json({
        success: false,
        message: "Page must be >= 1 and limit must be between 1 and 100",
      });
      return;
    }

    const skip = (page - 1) * limit;

    // Lấy thông tin sắp xếp từ query
const sortBy = req.query.sortBy as string || "departureTime";
const order = req.query.order as string || "asc";

// Các trường được phép sắp xếp
const allowedSortFields = [
  "departureTime",
  "economyPrice",
  "businessPrice",
];

// Kiểm tra trường sắp xếp hợp lệ
if (!allowedSortFields.includes(sortBy)) {
  res.status(400).json({
    success: false,
    message: "Invalid sortBy field",
  });
  return;
}

// Kiểm tra thứ tự sắp xếp
if (!["asc", "desc"].includes(order)) {
  res.status(400).json({
    success: false,
    message: "Order must be asc or desc",
  });
  return;
}

// Chuyển asc thành 1, desc thành -1
const sortOrder: 1 | -1 = order === "asc" ? 1 : -1;

const sortOptions: Record<string, 1 | -1> = {
  [sortBy]: sortOrder,
};

    // 7. Get flights and total count
    const [flights, total] = await Promise.all([
      Flight.find(filter)
        .populate("airlineId", "name code")
        .populate("aircraftId", "aircraftCode model manufacturer")
        .populate("departureAirportId", "name code city")
        .populate("arrivalAirportId", "name code city")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),

      Flight.countDocuments(filter),
    ]);

    // 8. Response
    res.status(200).json({
      success: true,
      count: flights.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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

        // Kết hợp thời gian cũ và mới
    const updatedDepartureTime = new Date(
      req.body.departureTime ?? existingFlight.departureTime
    );

    const updatedArrivalTime = new Date(
      req.body.arrivalTime ?? existingFlight.arrivalTime
    );

    const updatedStatus = req.body.status ?? existingFlight.status;

    // Chỉ kiểm tra nếu chuyến bay đang hoạt động
    if (["scheduled", "delayed"].includes(updatedStatus)) {
      const conflict = await checkAircraftSchedule(
        updatedData.aircraftId,
        updatedDepartureTime,
        updatedArrivalTime,
        String(id) // Bỏ qua chính chuyến bay đang cập nhật
      );

      if (conflict) {
        res.status(409).json({
          success: false,
          message: "Aircraft already has a flight scheduled during this time",
          conflictFlight: conflict.flightNumber,
        });
        return;
      }
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
