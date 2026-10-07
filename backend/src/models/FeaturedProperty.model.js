import mongoose from "mongoose";

const featuredPropertySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
            index: true,
        },

        role: {
            type: String,
            enum: ["BUILDER", "SELLER", "BROKER"],
            required: true,
            index: true,
        },

        planType: {
            type: String,
            enum: ["7_DAYS", "15_DAYS", "30_DAYS"],
            required: true,
        },

        startedAt: {
            type: Date,
            required: true,
        },

        expireAt: {
            type: Date,
            required: true,
            index: true,
        },

        status: {
            type: String,
            enum: ["ACTIVE", "EXPIRED", "CANCELLED"],
            default: "ACTIVE",
            index: true,
        },

        paymentId: {
            type: String,
        },
    },
    { timestamps: true }
);
featuredPropertySchema.index({
    role: 1,
    status: 1,
    expireAt: 1,
});
export const FeaturedProperty = mongoose.model(
    "FeaturedProperty",
    featuredPropertySchema
);