import asyncHandler from "../../../utils/asyncHandler.js";
import { Property } from "../../../models/property.model.js";
import { User, UserRole } from "../../../models/user.model.js";
import logger from "../../../config/logger.js";
import Lead from "../../../models/lead.model.js";
import Meeting from "../../../models/meeting.model.js";
import SiteVisit from "../../../models/siteVisit.model.js";

export const adminDashboard = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalBuilders,
        totalSellers,
        totalBuyers,
        totalBrokers,
        totalAdmins,
        totalProperties,
        totalLeads,
        totalMeetings,
        pendingMeetings,
        approvedMeetings,
        listingTypeAnalytics,
        bhkAnalytics,
        commercialAnalytics,
        meetingStatusAnalytics,
        leadStatusAnalytics,
        siteVisitAnalytics
    ] = await Promise.all([

        User.countDocuments({ role: { $ne: UserRole.SUPER_ADMIN } }),

        User.countDocuments({ role: UserRole.BUILDER }),
        User.countDocuments({ role: UserRole.SELLER }),
        User.countDocuments({ role: UserRole.BUYER }),
        User.countDocuments({ role: UserRole.BROKER }),
        User.countDocuments({ role: UserRole.ADMIN }),
        Property.countDocuments(),
        Lead.countDocuments(),
        Meeting.countDocuments(),
        Meeting.countDocuments({ status: "PENDING" }),
        Meeting.countDocuments({ status: "APPROVED" }),

        // Commercial vs Residential
        Property.aggregate([
            {
                $group: {
                    _id: "$listingType",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    type: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]),

        // BHK Analytics
        Property.aggregate([
            {
                $match: {
                    listingType: "RESIDENTIAL",
                    "residential.bhkType": { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: "$residential.bhkType",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    bhk: "$_id",
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { count: -1 }
            }
        ]),

        // Commercial Analytics
        Property.aggregate([
            {
                $match: {
                    listingType: "COMMERCIAL",
                    "commercial.propertyCategory": { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: "$commercial.propertyCategory",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    category: "$_id",
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { count: -1 }
            }
        ]),

        // Meeting Status Analytics
        Meeting.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: "$_id",
                    value: "$count",
                    _id: 0
                }
            }
        ]),

        // Lead Status Analytics
        Lead.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: "$_id",
                    value: "$count",
                    _id: 0
                }
            }
        ]),

        // Site Visit Analytics
        SiteVisit.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: { $ifNull: ["$_id", "PENDING"] },
                    value: "$count",
                    _id: 0
                }
            }
        ])
    ]);

    res.status(200).json({
        success: true,
        data: {
            summary: {
                totalUsers,
                totalBuilders,
                totalSellers,
                totalBuyers,
                totalBrokers,
                totalAdmins,
                totalProperties,
                totalLeads,
                totalMeetings,
                pendingMeetings,
                approvedMeetings
            },
            listingTypeAnalytics,
            bhkAnalytics,
            commercialAnalytics,
            meetingStatusAnalytics: meetingStatusAnalytics || [],
            leadStatusAnalytics: leadStatusAnalytics || [],
            siteVisitAnalytics: siteVisitAnalytics || []
        }
    });
});
export const getMonthlyListing = asyncHandler(async (req, res) => {
    const data = await Property.aggregate([
        {
            $group: {
                _id: {
                    month: { $month: "$createdAt" }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id.month": 1 }
        }
    ]);

    res.json(data);
});