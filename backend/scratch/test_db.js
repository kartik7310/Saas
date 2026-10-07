import mongoose from 'mongoose';
import 'dotenv/config';

const mongoURI = process.env.MONGODB_URI;

console.log('Connecting to:', mongoURI);

try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log('SUCCESS: Connected to MongoDB');
    process.exit(0);
} catch (err) {
    console.error('FAILURE: Could not connect to MongoDB');
    console.error(err);
    process.exit(1);
}
