import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
console.log("Connecting to:", uri);

async function test() {
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("Connected successfully!");
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

        // Test the aggregation logic
        const FeaturedProperty = db.collection("featuredproperties");
        const now = new Date();
        
        console.log("Running aggregation...");
        const result = await FeaturedProperty.aggregate([
            {
                $match: {
                    status: "ACTIVE",
                    expireAt: { $gte: now }
                }
            },
            {
                $lookup: {
                    from: "properties",
                    localField: "propertyId",
                    foreignField: "_id",
                    as: "property",
                },
            },
            { $unwind: "$property" }
        ]).toArray();

        console.log("Aggregation result count:", result.length);
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

test();
