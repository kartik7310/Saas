import mongoose from 'mongoose';
import 'dotenv/config';
import { FeaturedProperty } from './src/models/FeaturedProperty.model.js';
import { Property } from './src/models/property.model.js';

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const now = new Date();
        const allFeatured = await FeaturedProperty.find({});
        console.log(`Total FeaturedProperty documents: ${allFeatured.length}`);

        if (allFeatured.length > 0) {
            console.log('Sample document:', JSON.stringify(allFeatured[0], null, 2));
            
            const activeAndValid = allFeatured.filter(f => 
                f.status === 'ACTIVE' && f.expireAt >= now
            );
            console.log(`Active and not expired: ${activeAndValid.length}`);
            
            if (activeAndValid.length > 0) {
                const roles = [...new Set(activeAndValid.map(f => f.role))];
                console.log(`Available roles in active set: ${roles.join(', ')}`);

                // Test the lookup
                const sample = activeAndValid[0];
                const property = await Property.findById(sample.propertyId);
                console.log(`Lookup test for propertyId ${sample.propertyId}: ${property ? 'Found' : 'NOT FOUND'}`);
            }
        } else {
            console.log('No documents found in FeaturedProperty collection.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
