import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const uri = process.env.MONGODB_URI;

async function seed() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        const db = mongoose.connection.db;
        const User = db.collection('users');

        const email = "SuperadminL2B@gmail.com";
        const password = await bcrypt.hash("Admin@123", 10);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("Super Admin already exists");
            // Update role if needed
            await User.updateOne({ email }, { $set: { role: "SUPER_ADMIN" } });
        } else {
            const newUser = {
                name: "Super Admin",
                email: email,
                password: password,
                role: "SUPER_ADMIN",
                phone: "9999999999",
                isEmailVerified: true,
                isPhoneVerified: true,
                status: "ACTIVE",
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await User.insertOne(newUser);
            console.log("Super Admin created successfully");
        }

        process.exit(0);
    } catch (err) {
        console.error("Error seeding:", err);
        process.exit(1);
    }
}

seed();
