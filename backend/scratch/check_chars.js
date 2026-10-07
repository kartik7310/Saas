import mongoose from 'mongoose';
import { Property } from '../src/models/property.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const properties = await Property.find({ listingType: "COMMERCIAL" });
    properties.forEach(p => {
        const cat = p.commercial?.propertyCategory;
        const codes = cat ? Array.from(cat).map(c => c.charCodeAt(0)) : [];
        console.log(`Property ${p._id}: Category='${cat}' CharCodes=[${codes}]`);
    });
    process.exit(0);
}

check();
