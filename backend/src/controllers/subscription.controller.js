import crypto from "crypto";
import config from "../config/config.js";
import razorpay from "../config/razorpay.js";
import Subscription from "../models/subscription.js";
import { User } from "../models/user.model.js";
import { FeaturedProperty } from "../models/FeaturedProperty.model.js";
import logger from "../config/logger.js";

export const createSubscription = async (req, res) => {
    try {
        const { _id: userId } = req.user;

        const subscription = await razorpay.subscriptions.create({
            plan_id: config.razorpayPlan,
            customer_notify: 1,
            total_count: 1,
            notes: {
                userId: userId.toString()
            }
        });

        // Save minimal data
        await Subscription.create({
            userId,
            razorpaySubId: subscription.id,
            status: "created"
        });

        res.json({
            subscriptionId: subscription.id
        });
    } catch (error) {
        logger.error("Create subscription error:", error);
        res.status(500).json({ message: error.message || "Failed to create subscription" });
    }
};

export const razorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = config.razorpayWebhookSecret;
        const signature = req.headers["x-razorpay-signature"];

        // ✅ Verify signature
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.body)
            .digest("hex");

        if (expectedSignature !== signature) {
            logger.info("❌ Invalid webhook signature");
            return res.status(400).send("Invalid signature");
        }

        // ✅ Parse event
        const body = JSON.parse(req.body.toString());
        const event = body.event;
        const sub = body.payload.subscription?.entity;

        if (!sub) return res.status(200).send("No subscription data");

        logger.info("✅ Webhook event:", event);

        // ----------------------------
        // 🔥 1. ACTIVATED
        // ----------------------------
        if (event === "subscription.activated") {
            await Subscription.updateOne(
                { razorpaySubId: sub.id },
                {
                    status: "active",
                    currentPeriodStart: new Date(sub.current_start * 1000),
                    currentPeriodEnd: new Date(sub.current_end * 1000),
                }
            );

            await User.updateOne(
                { _id: sub.notes.userId },
                {
                    membershipType: "PAID",
                    isTrusted: true,
                }
            );
        }

        // ----------------------------
        // ❌ 2. CANCELLED
        // ----------------------------
        if (event === "subscription.cancelled") {
            await Subscription.updateOne(
                { razorpaySubId: sub.id },
                {
                    status: "cancelled",
                }
            );

            await User.updateOne(
                { _id: sub.notes.userId },
                {
                    membershipType: "FREE",
                    isTrusted: false,
                }
            );
        }

        // ----------------------------
        // ⚠️ 3. HALTED (optional)
        // ----------------------------
        if (event === "subscription.halted") {
            await Subscription.updateOne(
                { razorpaySubId: sub.id },
                {
                    status: "expired",
                }
            );

            await User.updateOne(
                { _id: sub.notes.userId },
                {
                    membershipType: "FREE",
                    isTrusted: false,
                }
            );
        }

        return res.status(200).json({ status: "ok" });

    } catch (error) {
        logger.error("Webhook error:", error);
        return res.status(500).send("Server error");
    }
};

export const getMySubscriptions = async (req, res) => {
    try {
        const { _id: userId } = req.user;

        const subscriptions = await FeaturedProperty.find({ userId })
            .populate("propertyId", "title media location")
            .sort({ expireAt: 1 });

        const formattedSubscriptions = subscriptions.map(sub => {
            const property = sub.propertyId;
            let status = sub.status;
            
            // Auto-expire check
            if (status === "ACTIVE" && new Date(sub.expireAt) < new Date()) {
                status = "EXPIRED";
            }
            
            return {
                id: sub._id,
                propertyId: sub.propertyId?._id,
                propertyName: property?.title || "General Consultation",
                propertyImage: property?.media?.photos?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80",
                planType: sub.planType.replace("_", " ") + " Plan",
                startDate: sub.startedAt,
                expiryDate: sub.expireAt,
                status: status
            };
        });

        res.json({
            success: true,
            data: formattedSubscriptions
        });
    } catch (error) {
        logger.error("Get my subscriptions error:", error);
        res.status(500).json({ message: error.message || "Failed to fetch subscriptions" });
    }
};