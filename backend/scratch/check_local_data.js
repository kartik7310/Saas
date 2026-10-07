import mongoose from 'mongoose';

const localURI = 'mongodb://localhost:27017/Link2Builder';

try {
    await mongoose.connect(localURI);
    console.log('Connected to local MongoDB');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`Collection ${col.name} count: ${count}`);
    }

    process.exit(0);
} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
