import Lead from "../models/lead.model.js";
import { Property } from "../models/property.model.js";
import { Notification } from "../models/notification.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc Create a new lead
// @route POST /api/leads
// @access Public
export const createLead = asyncHandler(async (req, res) => {
    const { propertyId, buyerName, buyerMobile, message } = req.body;

    if (!propertyId || !buyerName || !buyerMobile) {
        res.status(400);
        throw new Error("Please provide property details and buyer information");
    }

    // Find the property to get the ownerId
    const property = await Property.findById(propertyId);
    if (!property) {
        res.status(404);
        throw new Error("Property not found");
    }

    const lead = await Lead.create({
        propertyId,
        ownerId: property.createdBy,
        buyerId: req.user?._id, // Save the logged in user as the buyer
        buyerName,
        buyerMobile,
        message,
    });

    // Create Notification for the Owner
    await Notification.create({
        recipient: property.createdBy,
        title: "New Property Inquiry",
        message: `${buyerName} sent an inquiry for "${property.residential?.propertyTitle || property.title || 'your property'}"`,
        type: "NEW_INQUIRY",
        relatedId: lead._id
    });

    res.status(201).json({
        success: true,
        message: "Your query has been sent to the property owner.",
        data: lead,
    });
});

// @desc Get leads for the logged in owner
// @route GET /api/leads
// @access Private
export const getLeads = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const role = req.user.role?.toUpperCase();
    
    let query = {};
    if (role === 'BUYER') {
        // Buyers see leads they have SENT
        query = { buyerId: req.user._id };
    } else {
        // Sellers/Brokers see leads they have RECEIVED for properties listed under their CURRENT role
        const properties = await Property.find({ createdBy: req.user._id, creatorRole: role }).select('_id');
        const propertyIds = properties.map(p => p._id);
        query = { propertyId: { $in: propertyIds } };
    }

    if (status && status !== "All") {
        query.status = status;
    }

    const leads = await Lead.find(query)
        .populate("propertyId", "title residential.propertyTitle location.projectName location.city")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: leads.length,
        data: leads.map(lead => {
            const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
            return {
                _id: lead._id,
                buyerName: lead.buyerName,
                buyerMobile: isAdmin ? lead.buyerMobile : (lead.buyerMobile ? String(lead.buyerMobile).replace(/.(?=.{4})/g, "#") : "N/A"),
                message: lead.message,
                status: lead.status,
                propertyTitle: lead.propertyId?.residential?.propertyTitle || lead.propertyId?.location?.projectName || lead.propertyId?.title || "N/A",
                propertyLocation: lead.propertyId?.location?.city || "N/A",
                createdAt: lead.createdAt,
            };
        }),
    });
});

// @desc Update lead status
// @route PATCH /api/leads/:id/status
// @access Private
export const updateLeadStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
        res.status(400);
        throw new Error("Please provide a status");
    }

    const lead = await Lead.findById(id);

    if (!lead) {
        res.status(404);
        throw new Error("Lead not found");
    }

    // Check if the buyer is the owner (should be property creator)
    if (lead.ownerId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to update this lead");
    }

    lead.status = status;
    await lead.save();

    res.status(200).json({
        success: true,
        message: "Status updated successfully",
        data: lead,
    });
});

// @desc Admin: Get all leads in the system
// @route GET /api/leads/admin/all
// @access Private (Admin only)
export const getAllLeadsForAdmin = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    const query = {};
    if (status && status !== 'All') query.status = status;
    if (search) {
        query.$or = [
            { buyerName: new RegExp(search, 'i') },
            { buyerMobile: new RegExp(search, 'i') },
            { message: new RegExp(search, 'i') }
        ];
    }

    const [leads, total, stats] = await Promise.all([
        Lead.find(query)
            .populate("propertyId", "title residential.propertyTitle location.projectName location.city")
            .populate("ownerId", "name role email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Lead.countDocuments(query),
        Lead.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ])
    ]);

    const statsMap = stats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});
    const totalAll = stats.reduce((a, b) => a + b.count, 0);

    res.status(200).json({
        success: true,
        count: leads.length,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats: {
            total: totalAll,
            new: statsMap['New'] || 0,
            contacted: statsMap['Contacted'] || 0,
            interested: statsMap['Interested'] || 0,
            notInterested: statsMap['Not Interested'] || 0,
        },
        data: leads.map(lead => {
            const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
            return {
                _id: lead._id,
                buyerName: lead.buyerName,
                buyerMobile: isAdmin ? lead.buyerMobile : (lead.buyerMobile ? String(lead.buyerMobile).replace(/.(?=.{4})/g, "#") : "N/A"),
                message: lead.message,
                status: lead.status,
                propertyTitle: lead.propertyId?.residential?.propertyTitle || lead.propertyId?.location?.projectName || lead.propertyId?.title || "N/A",
                propertyLocation: lead.propertyId?.location?.city || "N/A",
                ownerName: lead.ownerId?.name || "Unknown",
                ownerRole: lead.ownerId?.role || "N/A",
                createdAt: lead.createdAt,
            };
        }),
    });
});
