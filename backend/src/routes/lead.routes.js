import express from "express";
import { createLead, getLeads, updateLeadStatus, getAllLeadsForAdmin } from "../controllers/lead.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { UserRole } from "../models/user.model.js";

const router = express.Router();

router.route("/")
    .post(createLead)
    .get(protect, getLeads);

router.route("/admin/all")
    .get(protect, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), getAllLeadsForAdmin);

router.route("/:id/status")
    .patch(protect, updateLeadStatus);

export default router;
