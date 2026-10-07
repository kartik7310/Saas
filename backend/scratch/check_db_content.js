import mongoose from 'mongoose';
import 'dotenv/config';
import { FeaturedProperty } from '../src/models/FeaturedProperty.model.js';
import { Property } from '../src/models/property.model.js';

const mongoURI = process.env.MONGODB_URI;

try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const featuredCount = await FeaturedProperty.countDocuments();
    console.log('FeaturedProperty count:', featuredCount);

    const propertiesCount = await Property.countDocuments();
    console.log('Property count:', propertiesCount);

    const samples = await FeaturedProperty.find().limit(5);
    console.log('FeaturedProperty samples:', JSON.stringify(samples, null, 2));

    process.exit(0);
} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
