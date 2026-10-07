import express from "express";
import { createFeatureOrder, verifyFeaturePayment, checkFeatureAvailability } from "../controllers/payment.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/check-feature-availability", protect, checkFeatureAvailability);
router.post("/create-feature-order", protect, createFeatureOrder);
router.post("/verify-feature-payment", protect, verifyFeaturePayment);

export default router;

