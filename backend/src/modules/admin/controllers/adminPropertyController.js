import asyncHandler from "../../../utils/asyncHandler.js";
import { Property } from "../../properties/../../models/property.model.js";
import { Notification } from "../../../models/notification.model.js";
import logger from "../../../config/logger.js";
import { deleteFromImageKit } from "../../../utils/uploadfile.js";

/**
 * @desc Get all properties pending admin approval
 * @route GET /api/v1/admin/pending-properties
 * @access Private/Admin
 */
export const getPendingProperties = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { listingType, search } = req.query;

    const query = { propertyApprovedStatus: "PENDING" };
    if (listingType && listingType !== "ALL") query.listingType = listingType;
    if (search) {
        query.$or = [
            { title: new RegExp(search, "i") },
            { "location.city": new RegExp(search, "i") },
            { "residential.propertyTitle": new RegExp(search, "i") },
            { "commercial.propertyTitle": new RegExp(search, "i") }
        ];
    }

    const [comp_properties, total, stats] = await Promise.all([
        Property.find(query)
            .populate("createdBy", "name email role")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Property.countDocuments(query),
        Property.aggregate([
            { $match: { propertyApprovedStatus: "PENDING" } },
            { $group: { _id: "$listingType", count: { $sum: 1 } } }
        ])
    ]);

    const statsMap = stats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});

    res.json({
        properties: comp_properties,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats: {
            total: stats.reduce((a, b) => a + b.count, 0),
            residential: statsMap['RESIDENTIAL'] || 0,
            commercial: statsMap['COMMERCIAL'] || 0,
        }
    });
});

/**
 * @desc Approve or Reject a property
 * @route PATCH /api/v1/admin/update-property-status/:id
 * @access Private/Admin
 */
export const updatePropertyStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, rejectionReason, rejectionComments } = req.body; // "APPROVED" or "REJECTED"

    if (!["APPROVED", "REJECTED"].includes(status)) {
        res.status(400);
        throw new Error("Invalid status. Must be APPROVED or REJECTED.");
    }

    const property = await Property.findById(id);

    if (!property) {
        res.status(404);
        throw new Error("Property not found");
    }

    // Role-based Audit Guard
    if (property.auditedBy && property.auditedBy.toString() !== req.user._id.toString()) {
        if (req.user.role !== "SUPER_ADMIN") {
            res.status(403);
            throw new Error("Forbidden: This property is being audited by another Admin.");
        }
    }

    property.propertyApprovedStatus = status;
    // Always record the auditor who is performing this specific action
    property.auditedBy = req.user._id;

    if (status === "REJECTED") {
        property.rejectionReason = rejectionReason;
        property.rejectionComments = rejectionComments;
    } else {
        // Clear rejection details if approved (in case it was previously rejected)
        property.rejectionReason = undefined;
        property.rejectionComments = undefined;
    }

    await property.save();

    // Notify Owner
    const propertyTitle = property.residential?.propertyTitle || property.title || "Your Property";
    let notificationTitle = status === "APPROVED" ? "Property Approved" : "Property Rejected";
    let notificationMessage = status === "APPROVED" 
        ? `Your property "${propertyTitle}" has been approved and is now live.`
        : `Your property "${propertyTitle}" was rejected. Reason: ${rejectionReason}`;

    await Notification.create({
        recipient: property.createdBy,
        title: notificationTitle,
        message: notificationMessage,
        type: status === "APPROVED" ? "PROPERTY_APPROVED" : "INFO",
        relatedId: property._id
    });

    logger.info(`Property ${id} status updated to ${status} by admin ${req.user._id}`);

    res.json({
        message: `Property ${status.toLowerCase()} successfully`,
        property: {
            _id: property._id,
            propertyApprovedStatus: property.propertyApprovedStatus
        }
    });
});

/**
 * @desc Delete uploaded property video
 * @route DELETE /api/v1/admin/audit/property-video/:id
 * @access Private/Admin
 */
export const deletePropertyVideo = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);
    if (!property) {
        res.status(404);
        throw new Error("Property not found");
    }

    // Role-based Audit Guard for modifying audit-related media
    if (property.auditedBy && property.auditedBy.toString() !== req.user._id.toString()) {
        if (req.user.role !== "SUPER_ADMIN") {
            res.status(403);
            throw new Error("Forbidden: This property is being audited by another Admin.");
        }
    }

    if (property.media?.uploadedVideo?.fileId) {
        await deleteFromImageKit(property.media.uploadedVideo.fileId);
    }

    // Initialize media object if it doesn't exist
    if (!property.media) property.media = {};
    property.media.uploadedVideo = undefined;
    
    // We usage markModified if nested objects change but sometimes Mongoose handles it
    property.markModified('media');
    await property.save();

    res.json({ message: "Video deleted successfully" });
});

/**
 * @desc Update admin-specific media (like YouTube link)
 * @route PATCH /api/v1/admin/audit/update-media/:id
 * @access Private/Admin
 */
export const updateAdminMedia = asyncHandler(async (req, res) => {
    const { youtubeLink } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
        res.status(404);
        throw new Error("Property not found");
    }

    // Role-based Audit Guard for modifying admin media links
    if (property.auditedBy && property.auditedBy.toString() !== req.user._id.toString()) {
        if (req.user.role !== "SUPER_ADMIN") {
            res.status(403);
            throw new Error("Forbidden: This property is being audited by another Admin.");
        }
    }

    if (!property.media) property.media = {};
    property.media.adminYoutubeLink = youtubeLink;
    
    property.markModified('media');
    await property.save();

    res.json({ message: "Media updated successfully", property });
});
