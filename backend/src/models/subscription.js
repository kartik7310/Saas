import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    razorpaySubId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["created", "active", "cancelled", "expired"],
        default: "created"
    },
    currentPeriodStart: {
        type: Date
    },
    currentPeriodEnd: {
        type: Date
    },
    planId: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model("Subscription", SubscriptionSchema);