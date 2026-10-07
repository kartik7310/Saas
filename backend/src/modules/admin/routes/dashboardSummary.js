import express from "express";
import { protect, authorize } from "../../../middleware/authMiddleware.js";
import { UserRole } from "../../../models/user.model.js";
import { adminDashboard, getMonthlyListing } from "../controllers/dashboardSummary.js";

const router = express.Router();

router.get("/dashboard-summary", protect, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), adminDashboard);
router.get("/monthly-listing", protect, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), getMonthlyListing);

export default router;