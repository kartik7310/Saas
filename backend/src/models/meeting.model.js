import mongoose from "mongoose";

const { Schema } = mongoose;

const MeetingSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        hostId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        propertyId: {
            type: Schema.Types.ObjectId,
            ref: "Property",
            required: false,
        },
        attendeeId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        attendeeName: {
            type: String,
            required: true,
        },
        attendeePhone: {
            type: String,
        },
        // Legacy fields kept for compatibility during migration if needed
        date: {
            type: Date,
        },
        time: {
            type: String,
        },
        // New precise slot fields
        slotStartTime: {
            type: Date,
            required: true,
        },
        slotEndTime: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED", "EXPIRED", "RESCHEDULED", "CANCELLED"],
            default: "PENDING",
        },
        propertyTitle: {
            type: String,
        },
        otherOwnerNames: {
            type: String,
            trim: true,
            maxlength: 300,
            default: null,
        },
        joinedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        joinedAt: {
            type: Date,
            default: null,
        },
        meetingStartedAt: {
            type: Date,
            default: null,
        },
        meetingEndedAt: {
            type: Date,
            default: null,
        },
        autoExpiredAt: {
            type: Date,
            default: null,
        },
        rescheduledFromBookingId: {
            type: Schema.Types.ObjectId,
            ref: "Meeting",
            default: null,
        },
        auditedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        scheduledBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for validation and performance
// 1. Property-based restriction: Only one booking per property per slot
MeetingSchema.index({ propertyId: 1, slotStartTime: 1, slotEndTime: 1 }, { 
    unique: true, 
    partialFilterExpression: { status: { $in: ["PENDING", "APPROVED", "IN_PROGRESS", "COMPLETED"] } } 
});

// 2. Buyer-based restriction: Only one booking per buyer per slot (across all properties)
MeetingSchema.index({ attendeeId: 1, slotStartTime: 1, slotEndTime: 1 }, { 
    unique: true, 
    partialFilterExpression: { status: { $in: ["PENDING", "APPROVED", "IN_PROGRESS", "COMPLETED"] } } 
});

const Meeting = mongoose.model("Meeting", MeetingSchema);

export default Meeting;
