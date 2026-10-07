import { Notification } from "../models/notification.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get notifications for user or admin
export const getMyNotifications = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error("Not authorized");
    }

    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};
    if (userRole === "SUPER_ADMIN") {
        // Super admins see notifications specifically for admin, or for themselves personally
        query = {
            $or: [{ forAdmin: true }, { recipient: userId }]
        };
    } else {
        query = { recipient: userId };
    }

    const notifications = await Notification.find({ ...query, isRead: false })
        .sort({ createdAt: -1 })
        .limit(50);

    const unreadCount = await Notification.countDocuments({
        ...query,
        isRead: false
    });

    return res.status(200).json({
        success: true,
        data: notifications || [],
        unreadCount: unreadCount || 0
    });
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
        id,
        { isRead: true },
        { returnDocument: "after" }
    );
    return res.status(200).json({
        success: true,
        data: notification
    });
});

// Mark all as read
export const markAllAsRead = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error("Not authorized");
    }

    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};
    if (userRole === "SUPER_ADMIN") {
        query = {
            $or: [{ forAdmin: true }, { recipient: userId }]
        };
    } else {
        query = { recipient: userId };
    }

    await Notification.updateMany(
        { ...query, isRead: false },
        { isRead: true }
    );

    return res.status(200).json({
        success: true,
        message: "All notifications marked as read"
    });
});
