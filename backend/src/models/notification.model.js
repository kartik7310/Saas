import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false, // if null, it means it's for ADMIN roles globally
        },
        forAdmin: {
            type: Boolean,
            default: false, // if true, all admins should see it
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["SIGNUP", "PROPERTY_LISTED", "PROPERTY_APPROVED", "USER_APPROVED", "NEW_INQUIRY", "INFO", "MEETING_REQUEST", "MEETING_STATUS", "MEETING_REJECTED"],
            default: "INFO",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId, // Can be user id or property id
        },
    },
    { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
