
import type { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  let statusCode = 500;
  let message = err.message || "Internal Server Error";

  // MongoDB Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  }

  // MongoDB CastError
  else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // MongoDB Duplicate Key Error
  else if (err.code === 11000) {
    statusCode = 409;

    const field = Object.keys(err.keyValue || {})[0];

    message = field
      ? `${field} already exists`
      : "Duplicate data";
  }

  // Invalid JSON
  else if (err instanceof SyntaxError) {
    const jsonError = err as SyntaxError & {
      status?: number;
    };

    if (jsonError.status === 400) {
      statusCode = 400;
      message = "Invalid JSON format";
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

export default errorHandler;
