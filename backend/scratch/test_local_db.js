import mongoose from 'mongoose';

const localURI = 'mongodb://localhost:27017/Link2Builder';

console.log('Connecting to local:', localURI);

try {
    await mongoose.connect(localURI, { serverSelectionTimeoutMS: 5000 });
    console.log('SUCCESS: Connected to local MongoDB');
    process.exit(0);
} catch (err) {
    console.error('FAILURE: Could not connect to local MongoDB');
    console.error(err);
    process.exit(1);
}
