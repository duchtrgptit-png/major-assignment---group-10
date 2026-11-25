
import { Router } from "express";
import {
  createAirport,
  getAllAirports,
  getAirportById,
  updateAirport,
  deleteAirport,
} from "../controllers/airport.controller.js";

const router = Router();

router.post("/", createAirport);
router.get("/", getAllAirports);
router.get("/:id", getAirportById);
router.put("/:id", updateAirport);
router.delete("/:id", deleteAirport);

export default router;
