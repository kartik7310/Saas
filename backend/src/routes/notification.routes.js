import { Router } from "express";
import { getMyNotifications, markAsRead, markAllAsRead } from "../controllers/notification.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/", getMyNotifications);
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead); // Must be before /:id/read if conflicting, but it's fine here because of rigid string "read-all" instead of dynamic ID

export default router;
