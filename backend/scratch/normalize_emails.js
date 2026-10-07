import mongoose from 'mongoose';
import 'dotenv/config';
import { User } from '../src/models/user.model.js';

const mongoURI = process.env.MONGODB_URI;

try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users. Normalizing emails...`);

    for (const user of users) {
        if (user.email !== user.email.toLowerCase()) {
            const oldEmail = user.email;
            user.email = user.email.toLowerCase();
            await user.save();
            console.log(`Normalized: ${oldEmail} -> ${user.email}`);
        }
    }

    console.log('All emails normalized to lowercase.');
    process.exit(0);
} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
