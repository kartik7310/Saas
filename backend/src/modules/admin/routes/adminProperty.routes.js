import express from "express";
import { protect, authorize } from "../../../middleware/authMiddleware.js";
import { UserRole } from "../../../models/user.model.js";
import { 
    getPendingProperties, 
    updatePropertyStatus,
    deletePropertyVideo,
    updateAdminMedia
} from "../controllers/adminPropertyController.js";

const router = express.Router();

// Get all properties pending approval
router.get("/pending-properties", protect, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), getPendingProperties);

// Approve or Reject a property
router.patch("/update-property-status/:id", protect, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), updatePropertyStatus);

// Delete uploaded video
router.delete("/property-video/:id", protect, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), deletePropertyVideo);

// Update YouTube link
router.patch("/update-media/:id", protect, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), updateAdminMedia);

export default router;
