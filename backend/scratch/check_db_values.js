import mongoose from 'mongoose';
import { Property } from '../src/models/property.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const properties = await Property.find({ listingType: "COMMERCIAL" });
    properties.forEach(p => {
        console.log(`Property ${p._id}: Category='${p.commercial?.propertyCategory}'`);
    });
    process.exit(0);
}

check();
