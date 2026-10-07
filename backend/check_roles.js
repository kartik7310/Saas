import mongoose from 'mongoose';
import { Property } from './src/models/property.model.js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: 'd:/LinktwoBulider/Link2Builder_BE/.env' });

async function checkCounts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const counts = await Property.aggregate([
            { 
                $match: { 
                    status: { $in: ["LIVE", "PUBLISHED"] },
                    propertyApprovedStatus: "APPROVED"
                } 
            },
            { $group: { _id: '$creatorRole', count: { $sum: 1 } } }
        ]);
        console.log('Published & Approved Property counts by creatorRole:', JSON.stringify(counts, null, 2));
        
        const totalPublished = await Property.countDocuments({ 
            status: { $in: ["LIVE", "PUBLISHED"] },
            propertyApprovedStatus: "APPROVED"
        });
        console.log('Total Published & Approved Properties:', totalPublished);
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkCounts();
