
import express from "express";
import cors from "cors";

import airlineRoutes from "./routes/airline.routes.js";
import airportRoutes from "./routes/airport.routes.js";
import aircraftRoutes from "./routes/aircraft.routes.js";
import flightRoutes from "./routes/flight.routes.js";
import authRoutes from "./routes/auth.routes.js";
import notFound from "./middlewares/notFound.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/airlines", airlineRoutes);
app.use("/api/airports", airportRoutes);
app.use("/api/aircrafts", aircraftRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/auth", authRoutes);

// Server status
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Airline Booking API is running!",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

// 404 Middleware
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;
