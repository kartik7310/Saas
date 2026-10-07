import mongoose from "mongoose";
import { FeaturedProperty } from "../models/FeaturedProperty.model.js";
import logger from "../config/logger.js";

export const getFeaturedProperties = async (req, res) => {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: "Database connection not ready. Please ensure your IP is whitelisted in MongoDB Atlas and check your network connectivity.",
            readyState: mongoose.connection.readyState
        });
    }

    try {
        const { role, city, propertyType, minPrice, maxPrice, purpose } = req.query;

        const now = new Date();

        const featuredMatch = {
            status: "ACTIVE",
            expireAt: { $gte: now },
        };
        if (role) {
            featuredMatch.role = role;
        }

        const propertyMatch = {
            "property.status": "PUBLISHED",
            "property.propertyApprovedStatus": "APPROVED"
        };

        const andConditions = [];

        if (city) {
            andConditions.push({ "property.location.city": new RegExp(city, "i") });
        }

        if (propertyType) {
            andConditions.push({ "property.residential.propertyType": propertyType });
        }

        if (purpose) {
            andConditions.push({ "property.purpose": purpose });
        }

        if (minPrice || maxPrice) {
            const priceMatch = [];
            if (minPrice && !isNaN(Number(minPrice))) {
                priceMatch.push({
                    $or: [
                        { "property.pricing.startingPrice": { $gte: Number(minPrice) } },
                        { "property.pricing.expectedPrice": { $gte: Number(minPrice) } }
                    ]
                });
            }
            if (maxPrice && !isNaN(Number(maxPrice))) {
                priceMatch.push({
                    $or: [
                        { "property.pricing.startingPrice": { $lte: Number(maxPrice) } },
                        { "property.pricing.expectedPrice": { $lte: Number(maxPrice) } }
                    ]
                });
            }

            if (priceMatch.length > 0) {
                andConditions.push({ $and: priceMatch });
            }
        }

        if (andConditions.length > 0) {
            propertyMatch.$and = andConditions;
        }

        const featured = await FeaturedProperty.aggregate([
            {
                $match: featuredMatch,
            },
            {
                $sample: { size: 10 }, // 🔥 RANDOM selection
            },
            {
                $lookup: {
                    from: "properties",
                    localField: "propertyId",
                    foreignField: "_id",
                    as: "property",
                },
            },
            { $unwind: "$property" },
            {
                $match: propertyMatch
            },
            {
                $replaceRoot: { newRoot: "$property" },
            },
        ]);

        res.json({
            success: true,
            data: featured,
        });
    } catch (error) {
        logger.error("Error in getFeaturedProperties:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};