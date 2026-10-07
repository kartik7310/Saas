import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

async function test() {
    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.db;
        const FeaturedProperty = db.collection("featuredproperties");

        console.log("Testing with NaN in match...");
        try {
            const result = await FeaturedProperty.aggregate([
                { $match: { status: "ACTIVE" } },
                { $lookup: { from: "properties", localField: "propertyId", foreignField: "_id", as: "property" } },
                { $unwind: "$property" },
                { $match: { "property.pricing.startingPrice": { $gte: NaN } } }
            ]).toArray();
            console.log("Result with NaN:", result.length);
        } catch (e) {
            console.error("Aggregation with NaN failed:", e.message);
        }

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

test();
