import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { UserRole } from "../models/user.model.js";
import { createSubscription, getMySubscriptions } from "../controllers/subscription.controller.js";

const router = express.Router();

router.route("/create")
    .post(protect, authorize(UserRole.BUILDER, UserRole.SELLER, UserRole.BROKER), createSubscription);

router.route("/my")
    .get(protect, authorize(UserRole.BUILDER, UserRole.SELLER, UserRole.BROKER), getMySubscriptions);

export default router;
