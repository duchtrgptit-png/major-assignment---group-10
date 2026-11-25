
import express from "express";
import cors from "cors";
import airlineRoutes from "./routes/airline.routes.js";
import airportRoutes from "./routes/airport.routes.js";
import aircraftRoutes from "./routes/aircraft.routes.js";
import flightRoutes from "./routes/flight.routes.js";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/airlines", airlineRoutes);
app.use("/api/airports", airportRoutes);
app.use("/api/aircrafts", aircraftRoutes);
app.use("/api/flights", flightRoutes);

// Kiểm tra server
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Airline Booking API is running!"
  });
});

// Kiểm tra API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy"
  });
});

export default app;
