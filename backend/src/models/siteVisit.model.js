import mongoose from "mongoose";

const { Schema } = mongoose;

const SiteVisitSchema = new Schema(
    {
        meetingId: {
            type: Schema.Types.ObjectId,
            ref: "Meeting",
            required: true,
        },
        propertyId: {
            type: Schema.Types.ObjectId,
            ref: "Property",
            required: false,
        },
        buyerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sellerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        buyerStatus: {
            type: String,
            enum: ["PENDING", "VISITED", "NOT_VISITED"],
            default: "PENDING",
        },
        sellerStatus: {
            type: String,
            enum: ["PENDING", "VISITED", "NOT_VISITED"],
            default: "PENDING",
        },
        buyerFeedback: {
            type: String,
        },
        sellerFeedback: {
            type: String,
        },
        interestLevel: {
            type: String,
            enum: ["HIGH", "MEDIUM", "LOW"],
        },
        actualVisitDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["PENDING", "VISITED", "NOT_VISITED", "CANCELLED"],
            default: "PENDING",
        },
        buyerUpdatedAt: {
            type: Date,
        },
        sellerUpdatedAt: {
            type: Date,
        }
    },
    {
        timestamps: true,
    }
);

const SiteVisit = mongoose.model("SiteVisit", SiteVisitSchema);

export default SiteVisit;
