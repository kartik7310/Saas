import cron from "node-cron";
import { FeaturedProperty } from "../models/FeaturedProperty.model.js";
import { User } from "../models/user.model.js";
import { Property } from "../models/property.model.js";
import Meeting from "../models/meeting.model.js";
import { Notification } from "../models/notification.model.js";
import { sendFeaturedExpiryReminderEmail } from "./emailUtils.js";
import logger from "../config/logger.js";

/**
 * @desc Initialize all cron jobs
 */
export const initCronJobs = () => {
    // Run every day at midnight (00:00)
    cron.schedule("0 0 * * *", async () => {
        logger.info("Running daily Featured Property expiry check...");
        
        try {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            
            // Set range for tomorrow (00:00:00 to 23:59:59)
            const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
            const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

            // Find properties expiring tomorrow
            const expiringSoon = await FeaturedProperty.find({
                status: "ACTIVE",
                expireAt: {
                    $gte: tomorrowStart,
                    $lte: tomorrowEnd
                }
            }).populate("userId", "name email").populate("propertyId", "title residential.propertyTitle");

            logger.info(`Found ${expiringSoon.length} properties expiring tomorrow.`);

            for (const feature of expiringSoon) {
                if (feature.userId && feature.userId.email) {
                    const propertyTitle = feature.propertyId?.title || feature.propertyId?.residential?.propertyTitle || "Your Property";
                    
                    try {
                        await sendFeaturedExpiryReminderEmail(
                            feature.userId.email,
                            feature.userId.name,
                            propertyTitle
                        );
                        logger.info(`Sent expiry reminder to ${feature.userId.email} for property ${propertyTitle}`);
                    } catch (emailError) {
                        logger.error(`Failed to send expiry reminder to ${feature.userId.email}: ${emailError.message}`);
                    }
                }
            }
        } catch (error) {
            logger.error(`Error in Featured Property cron job: ${error.message}`);
        }
    });

    // Run every 15 minutes to check for expired VC bookings
    cron.schedule("*/15 * * * *", async () => {
        logger.info("Running VC booking auto-expiry check...");
        try {
            const now = new Date();
            // Find meetings that have passed their end time and are not in progress or completed
            const expiredMeetings = await Meeting.find({
                status: { $in: ["PENDING", "APPROVED"] },
                slotEndTime: { $lt: now }
            }).populate("attendeeId", "name email");

            logger.info(`Found ${expiredMeetings.length} expired meetings.`);

            for (const meeting of expiredMeetings) {
                meeting.status = "EXPIRED";
                meeting.autoExpiredAt = now;
                await meeting.save();

                // Notify Buyer
                if (meeting.attendeeId) {
                    await Notification.create({
                        recipient: meeting.attendeeId._id,
                        title: "Meeting Expired",
                        message: "Your meeting could not be scheduled or conducted on time. Please book another slot or reschedule.",
                        type: "MEETING_EXPIRED",
                        relatedId: meeting._id
                    });
                }
            }
        } catch (error) {
            logger.error(`Error in VC auto-expiry cron job: ${error.message}`);
        }
    });

    logger.info("Cron jobs initialized.");
};
