
import { Router } from "express";
import {
  createAircraft,
  getAllAircrafts,
  getAircraftById,
  updateAircraft,
  deleteAircraft,
} from "../controllers/aircraft.controller.js";

const router = Router();

router.post("/", createAircraft);
router.get("/", getAllAircrafts);
router.get("/:id", getAircraftById);
router.put("/:id", updateAircraft);
router.delete("/:id", deleteAircraft);

export default router;
