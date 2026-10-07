import mongoose from 'mongoose';
import 'dotenv/config';
import { FeaturedProperty } from "../src/models/FeaturedProperty.model.js";
import config from './src/config/config.js';

async function checkData() {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB");
    
    const count = await FeaturedProperty.countDocuments({});
    console.log(`Total Featured Properties: ${count}`);
    
    const all = await FeaturedProperty.find({}).limit(5);
    console.log("Entries:", JSON.stringify(all, null, 2));
    
    const now = new Date();
    const active = await FeaturedProperty.find({
        status: "ACTIVE",
        expireAt: { $gte: now }
    });
    console.log(`Active & Not Expired count: ${active.length}`);

    await mongoose.disconnect();
}

checkData();
