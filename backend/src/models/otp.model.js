import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            index: true,
        },
        otpHash: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }, // Automatically delete after expiry
        },
        attempts: {
            type: Number,
            default: 0,
        },
        type: {
            type: String,
            enum: ["VERIFICATION", "LOGIN"],
            default: "VERIFICATION",
        }
    },
    { timestamps: true }
);

export const OTP = mongoose.model("OTP", otpSchema);
