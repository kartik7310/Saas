import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import { FeaturedProperty } from "../models/FeaturedProperty.model.js";
import { Property } from "../models/property.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import config from "../config/config.js";
import { sendFeaturedConfirmationEmail } from "../utils/emailUtils.js";

/**
 * @desc Create Razorpay Order for Featured Property
 * @route POST /api/v1/payments/create-feature-order
 * @access Private
 */
export const createFeatureOrder = asyncHandler(async (req, res) => {
    const { planType } = req.body;

    if (!planType) {
        return res.status(400).json({ message: "Plan type is required" });
    }

    // Map planType to amount (in paise)
    // 7_DAYS -> 9900, 15_DAYS -> 14900, 30_DAYS -> 24900
    let amount = 0;
    if (planType === "7_DAYS") amount = 9900;
    else if (planType === "15_DAYS") amount = 14900;
    else if (planType === "30_DAYS") amount = 24900;
    else {
        return res.status(400).json({ message: "Invalid plan type" });
    }

    const options = {
        amount,
        currency: "INR",
        receipt: `receipt_feature_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ message: "Failed to create Razorpay order" });
    }
});

/**
 * @desc Check Feature Availability
 * @route GET /api/v1/payments/check-feature-availability
 * @access Private
 */
export const checkFeatureAvailability = asyncHandler(async (req, res) => {
    const role = req.user.role;
    const { propertyId } = req.query;

    if (!role) {
        return res.status(400).json({ message: "User role not found" });
    }

    const now = new Date();

    // 1. Get all active featured properties for this role
    const activeFeatured = await FeaturedProperty.find({
        role,
        status: "ACTIVE",
        expireAt: { $gte: now }
    }).sort({ expireAt: 1 }); // Sort by earliest expiry

    // 2. Check if current property is already featured
    const isAlreadyFeatured = activeFeatured.some(f => f.propertyId.toString() === propertyId);

    if (isAlreadyFeatured || activeFeatured.length < 10) {
        return res.status(200).json({
            success: true,
            available: true,
            count: activeFeatured.length,
            message: isAlreadyFeatured ? "Property already featured, you can extend it." : "Slots available."
        });
    }

    // 3. If full (10 or more), find when the earliest one expires
    const earliestExpiry = activeFeatured[0].expireAt;
    const diffTime = Math.abs(earliestExpiry - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return res.status(200).json({
        success: true,
        available: false,
        count: activeFeatured.length,
        nextAvailableAt: earliestExpiry,
        daysToWait: diffDays,
        message: `Featured slots for ${role} are full. Next slot available in ${diffDays} days.`
    });
});

/**
 * @desc Verify Payment and Activate Featured Property
 * @route POST /api/v1/payments/verify-feature-payment
 * @access Private
 */
export const verifyFeaturePayment = asyncHandler(async (req, res) => {
    const { 
        propertyId, 
        planType, 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature 
    } = req.body;

    if (!propertyId || !planType || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: "Missing required payment fields" });
    }

    // 1. Verify Razorpay Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", config.razorpayKeySecret)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid payment signature" });
    }

    // 2. Validate User + Property
    const userId = req.user._id;
    const role = req.user.role;

    const property = await Property.findById(propertyId);
    if (!property) {
        return res.status(404).json({ message: "Property not found" });
    }

    // Ensure property.createdBy === userId
    if (property.createdBy.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Unauthorized: You do not own this property" });
    }

    // 3. Plan Duration Logic
    let days = 0;
    if (planType === "7_DAYS") days = 7;
    else if (planType === "15_DAYS") days = 15;
    else if (planType === "30_DAYS") days = 30;
    else {
        return res.status(400).json({ message: "Invalid plan type" });
    }

    const now = new Date();
    
    // 4. Feature Logic: check existing ACTIVE + not expired
    const existing = await FeaturedProperty.findOne({
        propertyId,
        status: "ACTIVE",
        expireAt: { $gte: now }
    });

    // 5. Check Role Slot Limit if NOT extending
    if (!existing) {
        const activeCount = await FeaturedProperty.countDocuments({
            role,
            status: "ACTIVE",
            expireAt: { $gte: now }
        });

        if (activeCount >= 10) {
            return res.status(400).json({ 
                success: false, 
                message: "Featured slots for your role are currently full. Please try again later." 
            });
        }
    }

    let startedAt = now;
    let expireAt = new Date();
    
    if (existing) {
        // Extend existing
        expireAt = new Date(existing.expireAt);
        expireAt.setDate(expireAt.getDate() + days);
    } else {
        // New promotion
        expireAt.setDate(now.getDate() + days);
    }

    // 6. DB Operation: findOneAndUpdate with upsert
    const featured = await FeaturedProperty.findOneAndUpdate(
        { propertyId, status: "ACTIVE" },
        {
            userId,
            propertyId,
            role,
            planType,
            paymentId: razorpay_payment_id,
            startedAt,
            expireAt,
            status: "ACTIVE"
        },
        { upsert: true, returnDocument: "after" }
    );

    // 7. Send Confirmation Email
    try {
        const propertyDetails = {
            title: property.title || property.residential?.propertyTitle || "Property",
            location: `${property.location?.city || ""}, ${property.location?.state || ""}`
        };
        const planDetails = {
            duration: days,
            startDate: startedAt,
            expiryDate: expireAt
        };
        await sendFeaturedConfirmationEmail(req.user.email, req.user.name, propertyDetails, planDetails);
    } catch (emailError) {
        console.error("Failed to send featured confirmation email:", emailError);
        // We don't want to fail the whole request if email fails
    }

    res.status(200).json({
        success: true,
        message: "Property featured successfully",
        data: featured
    });
});

