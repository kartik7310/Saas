import mongoose from 'mongoose';
import dns from 'node:dns';
import config from './config.js';
import logger from './logger.js';

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

const connectDB = async () => {
    try {
        const mongoURI = config.mongoUri;

        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        logger.info(`Connecting to MongoDB...`);
        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 15000,
            heartbeatFrequencyMS: 10000,
            // family: 4, // Removed forced IPv4 to allow standard resolution
        });

        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        reconnectAttempts = 0; // Reset on successful connection

        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected. Attempting to reconnect...');
            handleReconnect();
        });

    } catch (error) {
        logger.error(`Error connecting to MongoDB: ${error.message}`);
        handleReconnect();
    }
};

const handleReconnect = () => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        logger.error(`Failed to reconnect to MongoDB after ${MAX_RECONNECT_ATTEMPTS} attempts.`);
        return;
    }

    reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
    logger.info(`Reconnecting to MongoDB in ${delay / 1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

    setTimeout(async () => {
        try {
            if (mongoose.connection.readyState === 0) {
                await connectDB();
            }
        } catch (err) {
            logger.error(`Reconnect attempt ${reconnectAttempts} failed: ${err.message}`);
        }
    }, delay);
};

export default connectDB;