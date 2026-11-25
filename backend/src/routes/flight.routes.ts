
import { Router } from "express";
import {
  createFlight,
  getAllFlights,
  getFlightById,
  updateFlight,
  deleteFlight,
} from "../controllers/flight.controller.js";

const router = Router();

router.post("/", createFlight);
router.get("/", getAllFlights);
router.get("/:id", getFlightById);
router.put("/:id", updateFlight);
router.delete("/:id", deleteFlight);

export default router;
