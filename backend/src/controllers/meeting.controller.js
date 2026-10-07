import asyncHandler from '../utils/asyncHandler.js';
import Meeting from '../models/meeting.model.js';
import SiteVisit from '../models/siteVisit.model.js';
import { Property } from '../models/property.model.js';
import { Notification } from '../models/notification.model.js';
import { notifyMeetingApproval, notifyMeetingScheduledByAdmin } from '../utils/emailUtils.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';

/**
 * Shared helper to check for meeting conflicts (overlaps)
 * @returns {Promise<Object|null>} returns the conflicting meeting if found
 */
const checkMeetingConflict = async ({ attendeeId, propertyId, hostId, slotStartTime, slotEndTime, excludeMeetingId = null }) => {
    const query = {
        status: { $in: ["PENDING", "APPROVED", "IN_PROGRESS", "COMPLETED"] },
        $or: [
            { slotStartTime: { $lt: slotEndTime, $gte: slotStartTime } },
            { slotEndTime: { $gt: slotStartTime, $lte: slotEndTime } },
            { slotStartTime: { $lte: slotStartTime }, slotEndTime: { $gte: slotEndTime } }
        ]
    };

    if (excludeMeetingId) {
        query._id = { $ne: excludeMeetingId };
    }

    // 1. Check if the property already has a booking in this slot
    if (propertyId) {
        const propConflict = await Meeting.findOne({ ...query, propertyId });
        if (propConflict) return { type: 'PROPERTY', meeting: propConflict };
    }

    // 2. Check if the buyer already has a booking in this slot (any property)
    if (attendeeId) {
        const buyerConflict = await Meeting.findOne({ ...query, attendeeId });
        if (buyerConflict) return { type: 'BUYER', meeting: buyerConflict };
    }

    // 3. Check if the Host is already busy in this slot (any property they manage)
    if (hostId) {
        const hostConflict = await Meeting.findOne({ ...query, hostId });
        if (hostConflict) return { type: 'HOST', meeting: hostConflict };
    }

    return null;
};

// @desc    Book a new meeting
// @route   POST /api/v1/meetings
// @access  Private
export const bookMeeting = asyncHandler(async (req, res) => {
    const { propertyId, attendeeName, attendeePhone, date, time, otherOwnerNames } = req.body;

    if (!propertyId || !date || !time) {
        res.status(400);
        throw new Error("Missing required fields: propertyId, date, or time.");
    }

    // 1. Calculate slotStartTime and slotEndTime (Fixed 1-hour slot)
    // The frontend now sends the full combined ISO string in the 'date' field
    const slotStartTime = new Date(date);
    
    // If the date passed was just a date (no 'T' indicating an ISO timestamp),
    // we should still combine them to be safe for legacy/other callers.
    if (typeof date === 'string' && !date.includes('T') && time) {
        const [timeStr, period] = time.split(' ');
        let [hours, minutes] = timeStr.split(':').map(Number);
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        slotStartTime.setUTCHours(hours, minutes, 0, 0);
    }

    const slotEndTime = new Date(slotStartTime);
    slotEndTime.setUTCHours(slotStartTime.getUTCHours() + 1);

    if (isNaN(slotStartTime.getTime())) {
        res.status(400);
        throw new Error("Invalid date or time format.");
    }

    // 2. Validate: No past date/time (1-minute grace period)
    const now = new Date();
    if (slotStartTime.getTime() < (now.getTime() - 60000)) {
        res.status(400);
        throw new Error("Cannot book a meeting in the past.");
    }

    // 4. Fetch property details
    const property = await Property.findById(propertyId);
    if (!property) {
        res.status(404);
        throw new Error("Property not found.");
    }

    const hostId = property.createdBy;

    // 5. Centralized Conflict Validation (Now including host check)
    const conflict = await checkMeetingConflict({
        attendeeId: req.user._id,
        propertyId,
        hostId,
        slotStartTime,
        slotEndTime
    });

    if (conflict) {
        res.status(400);
        if (conflict.type === 'PROPERTY') {
            throw new Error("This slot is already booked for this property.");
        } else if (conflict.type === 'BUYER') {
            const propTitle = conflict.meeting.propertyTitle || "another property";
            throw new Error(`You already have a booking for ${propTitle} that overlaps with this slot.`);
        } else {
            throw new Error("The property representative is already busy with another video call in this slot. Please choose another time.");
        }
    }

    const propertyTitle = property.residential?.propertyTitle || property.location?.projectName || property.title || "Selected Property";

    // 6. Create Booking
    const meeting = await Meeting.create({
        title: "Video Call Inquiry",
        hostId,
        propertyId,
        attendeeId: req.user._id,
        attendeeName: attendeeName || req.user.name,
        attendeePhone: attendeePhone || req.user.phone,
        slotStartTime,
        slotEndTime,
        date: slotStartTime,
        time,
        propertyTitle,
        otherOwnerNames: otherOwnerNames?.trim().substring(0, 300) || null,
        status: 'PENDING'
    });

    // 6. Notifications
    await Notification.create({
        forAdmin: true,
        title: "New Meeting Booking",
        message: `${attendeeName} requested a video call for ${propertyTitle}`,
        type: "MEETING_REQUEST",
        relatedId: meeting._id
    });

    await Notification.create({
        recipient: hostId,
        title: "New Meeting Request",
        message: `A buyer has requested a video call for your property: ${propertyTitle}. Waiting for admin approval.`,
        type: "MEETING_REQUEST",
        relatedId: meeting._id
    });

    res.status(201).json({
        message: "Meeting request sent successfully. Waiting for admin approval.",
        meeting
    });
});

// @desc    Reschedule a meeting
// @route   PATCH /api/v1/meetings/:id/reschedule
// @access  Private
export const rescheduleMeeting = asyncHandler(async (req, res) => {
    const { date, time } = req.body;
    const meetingId = req.params.id;

    if (!date || !time) {
        res.status(400);
        throw new Error("Please provide new date and time.");
    }

    const oldMeeting = await Meeting.findById(meetingId);
    if (!oldMeeting) {
        res.status(404);
        throw new Error("Meeting not found.");
    }

    if (oldMeeting.attendeeId.toString() !== req.user._id.toString() && !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
        res.status(403);
        throw new Error("Not authorized to reschedule this meeting.");
    }

    // New Slot calculation
    const newStartTime = new Date(date);
    if (typeof date === 'string' && !date.includes('T') && time) {
        const [timeStr, period] = time.split(' ');
        let [hours, minutes] = timeStr.split(':').map(Number);
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        newStartTime.setUTCHours(hours, minutes, 0, 0);
    }
    const newEndTime = new Date(newStartTime);
    newEndTime.setUTCHours(newStartTime.getUTCHours() + 1);

    if (newStartTime.getTime() < (new Date().getTime() - 60000)) {
        res.status(400);
        throw new Error("Cannot reschedule to a past time.");
    }

    // Centralized Conflict Validation
    const conflict = await checkMeetingConflict({
        attendeeId: oldMeeting.attendeeId,
        propertyId: oldMeeting.propertyId,
        hostId: oldMeeting.hostId,
        slotStartTime: newStartTime,
        slotEndTime: newEndTime,
        excludeMeetingId: oldMeeting._id
    });

    if (conflict) {
        res.status(400);
        if (conflict.type === 'PROPERTY') {
            throw new Error("The selected slot is already booked for this property.");
        } else if (conflict.type === 'BUYER') {
            const propTitle = conflict.meeting.propertyTitle || "another property";
            throw new Error(`You already have a booking for ${propTitle} that overlaps with this time slot.`);
        } else {
            throw new Error("The property representative is already busy with another video call at this time.");
        }
    }

    // Update process
    oldMeeting.status = 'RESCHEDULED';
    await oldMeeting.save();

    const newMeeting = await Meeting.create({
        ...oldMeeting.toObject(),
        _id: new mongoose.Types.ObjectId(),
        slotStartTime: newStartTime,
        slotEndTime: newEndTime,
        date: newStartTime,
        time,
        status: 'PENDING',
        rescheduledFromBookingId: oldMeeting._id,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    res.json({
        message: "Meeting rescheduled successfully. Waiting for admin approval.",
        meeting: newMeeting
    });
});

// @desc    Get user's meetings (as host or attendee)
export const getMyMeetings = asyncHandler(async (req, res) => {
    const isAnyAdmin = ["SUPER_ADMIN", "ADMIN"].includes(req.user.role);
    const role = req.user.role?.toUpperCase();
    let query = {};

    if (role === 'BUYER') {
        query = { attendeeId: req.user._id };
    } else if (['SELLER', 'BROKER', 'BUILDER'].includes(role)) {
        const properties = await Property.find({ createdBy: req.user._id, creatorRole: role }).select('_id');
        const propertyIds = properties.map(p => p._id);
        query = { 
            hostId: req.user._id,
            propertyId: { $in: propertyIds }
        };
    } else {
        query = {
            $or: [
                { hostId: req.user._id },
                { attendeeId: req.user._id }
            ]
        };
    }

    if (!isAnyAdmin) {
        query.scheduledBy = { $eq: null };
    }

    const meetings = await Meeting.find(query)
    .populate('propertyId')
    .populate('attendeeId', 'name email phone avatar')
    .populate('hostId', 'name role')
    .sort({ slotStartTime: -1 })
    .lean();

    const meetingsWithVisitInfo = await Promise.all(meetings.map(async (meeting) => {
        const siteVisit = await SiteVisit.findOne({ meetingId: meeting._id });
        return {
            ...meeting,
            siteVisit: siteVisit ? {
                status: siteVisit.status,
                buyerStatus: siteVisit.buyerStatus,
                sellerStatus: siteVisit.sellerStatus,
                buyerUpdatedAt: siteVisit.buyerUpdatedAt,
                sellerUpdatedAt: siteVisit.sellerUpdatedAt
            } : null
        };
    }));

    res.json(meetingsWithVisitInfo);
});

// @desc    Get all meetings (Admin only)
export const getAllMeetings = asyncHandler(async (req, res) => {
    console.log("[Controller] getAllMeetings called with query:", req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, search, date } = req.query;

    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (search) {
        query.$or = [
            { attendeeName: new RegExp(search, 'i') },
            { propertyTitle: new RegExp(search, 'i') }
        ];
    }

    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        query.slotStartTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const [meetings, total, stats] = await Promise.all([
        Meeting.find(query)
            .populate('hostId', 'name email role')
            .populate('attendeeId', 'name email')
            .populate('scheduledBy', 'name email role')
            .populate('propertyId', 'media.photos location residential pricing')
            .sort({ slotStartTime: -1 })
            .skip(skip)
            .limit(limit),
        Meeting.countDocuments(query),
        Meeting.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ])
    ]);

    const statsMap = stats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});
    const totalAll = stats.reduce((a, b) => a + b.count, 0);

    res.json({
        meetings,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats: {
            total: totalAll,
            pending: statsMap['PENDING'] || 0,
            approved: statsMap['APPROVED'] || 0,
            in_progress: statsMap['IN_PROGRESS'] || 0,
            rejected: statsMap['REJECTED'] || 0,
            expired: statsMap['EXPIRED'] || 0,
            completed: statsMap['COMPLETED'] || 0,
        }
    });
});

// @desc    Update meeting status
export const updateMeetingStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    if (!["APPROVED", "REJECTED", "COMPLETED", "CANCELLED", "IN_PROGRESS"].includes(status)) {
        res.status(400);
        throw new Error("Invalid status.");
    }

    const meeting = await Meeting.findById(req.params.id)
        .populate('attendeeId', 'name email')
        .populate('hostId', 'name email')
        .populate({
            path: 'propertyId',
            populate: { path: 'createdBy', select: 'name email' }
        });
    
    if (!meeting) {
        res.status(404);
        throw new Error("Meeting not found.");
    }

    const isAnyAdmin = ["SUPER_ADMIN", "ADMIN"].includes(req.user.role);
    const isHost = meeting.hostId?._id?.toString() === req.user._id.toString() || meeting.hostId.toString() === req.user._id.toString();

    if (!isAnyAdmin && !isHost) {
        res.status(403);
        throw new Error("Not authorized to update this meeting status.");
    }

    if (status === "IN_PROGRESS") {
        meeting.meetingStartedAt = new Date();
    }

    if (status === "COMPLETED") {
        meeting.meetingEndedAt = new Date();
    }

    meeting.status = status;
    if (isAnyAdmin) meeting.auditedBy = req.user._id;
    
    await meeting.save();

    // Create SiteVisit on Approval
    if (status === 'APPROVED') {
        const existingVisit = await SiteVisit.findOne({ meetingId: meeting._id });
        if (!existingVisit) {
            await SiteVisit.create({
                meetingId: meeting._id,
                propertyId: meeting.propertyId?._id || meeting.propertyId,
                buyerId: meeting.attendeeId?._id || meeting.attendeeId,
                sellerId: meeting.hostId?._id || meeting.hostId,
                status: 'PENDING'
            });
        }
    }

    // Notifications
    if (!meeting.scheduledBy) {
        const isRejected = status === 'REJECTED';
        await Notification.create({
            recipient: meeting.attendeeId?._id || meeting.attendeeId,
            title: `Meeting ${status.toLowerCase()}`,
            message: isRejected 
                ? `Your video call request for ${meeting.propertyTitle} was rejected. Click here to reschedule with a different slot.`
                : `Your video call request for ${meeting.propertyTitle} has been ${status.toLowerCase()}.`,
            type: isRejected ? "MEETING_REJECTED" : "MEETING_STATUS",
            relatedId: meeting._id
        });
    }

    // Email on Approval
    if (status === 'APPROVED') {
        process.nextTick(async () => {
            try {
                if (meeting.attendeeId?.email) await notifyMeetingApproval(meeting, meeting.attendeeId.email, meeting.attendeeId.name);
                if (meeting.hostId?.email) await notifyMeetingApproval(meeting, meeting.hostId.email, meeting.hostId.name);
            } catch (err) {
                console.error("Email fail", err);
            }
        });
    }

    res.json({ message: `Meeting status updated to ${status}`, meeting });
});

// @desc    Admin Joins a meeting
export const joinMeeting = asyncHandler(async (req, res) => {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
        res.status(404);
        throw new Error("Meeting not found.");
    }

    if (meeting.status !== "APPROVED" && meeting.status !== "IN_PROGRESS") {
        res.status(400);
        throw new Error("Only approved or in-progress meetings can be joined.");
    }

    const isAnyAdmin = ["SUPER_ADMIN", "ADMIN"].includes(req.user.role);
    const isHost = meeting.hostId.toString() === req.user._id.toString();
    const isAttendee = meeting.attendeeId.toString() === req.user._id.toString();

    if (!isAnyAdmin && !isHost && !isAttendee) {
        res.status(403);
        throw new Error("Unauthorized to join meetings.");
    }

    // Automatically set status to IN_PROGRESS if first time joining
    if (meeting.status === "APPROVED") {
        if (!isAnyAdmin) {
            res.status(403);
            throw new Error("Firstly admin will start meeting");
        }
        meeting.status = "IN_PROGRESS";
        meeting.meetingStartedAt = new Date();
        meeting.joinedBy = req.user._id;
        meeting.joinedAt = new Date();
    }

    await meeting.save();

    res.json({ message: "Joined successfully.", meeting });
});

// @desc    Get occupied slots
export const getPropertyOccupiedSlots = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const { date } = req.query;

    if (!propertyId || !date) {
        res.status(400);
        throw new Error("Missing propertyId or date.");
    }

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const meetings = await Meeting.find({
        propertyId,
        status: { $in: ["PENDING", "APPROVED", "IN_PROGRESS", "COMPLETED"] },
        slotStartTime: { $gte: startOfDay, $lte: endOfDay }
    }).select('slotStartTime slotEndTime status');

    res.json(meetings);
});

// ... rest of the file (site visits, admin schedule) stays same but uses slotStartTime for sorting/queries
// I will keep the rest of the original file content below for consistency

export const updateSiteVisitFeedback = asyncHandler(async (req, res) => {
    const { feedback, interestLevel, visitorStatus } = req.body;
    let siteVisit = await SiteVisit.findOne({ meetingId: req.params.id });
    if (!siteVisit) {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) { res.status(404); throw new Error("Meeting not found."); }
        siteVisit = await SiteVisit.create({
            meetingId: meeting._id,
            propertyId: meeting.propertyId,
            buyerId: meeting.attendeeId,
            sellerId: meeting.hostId,
            status: 'PENDING'
        });
    }
    const isHost = siteVisit.sellerId.toString() === req.user._id.toString();
    const isAttendee = siteVisit.buyerId.toString() === req.user._id.toString();
    if (!isHost && !isAttendee) { res.status(403); throw new Error("Not authorized."); }
    if (isHost) {
        const { siteVisitStatus: hostSelectedStatus } = req.body;
        siteVisit.sellerFeedback = feedback;
        siteVisit.sellerStatus = hostSelectedStatus || 'PENDING';
        siteVisit.sellerUpdatedAt = new Date();
        if (siteVisit.sellerStatus === 'VISITED') siteVisit.status = 'VISITED';
    } else {
        const { siteVisitStatus: buyerSelectedStatus, visitDate } = req.body;
        siteVisit.buyerFeedback = feedback;
        siteVisit.interestLevel = interestLevel;
        siteVisit.buyerStatus = buyerSelectedStatus;
        siteVisit.actualVisitDate = visitDate ? new Date(visitDate) : null;
        siteVisit.buyerUpdatedAt = new Date();
        if (buyerSelectedStatus === 'VISITED') siteVisit.status = 'VISITED';
    }
    await siteVisit.save();
    res.json({ message: "Updated", siteVisit });
});

export const getPendingSiteVisit = asyncHandler(async (req, res) => {
    const query = { status: 'PENDING' };
    if (req.user.role === 'BUYER') {
        query.buyerId = req.user._id;
        query.buyerUpdatedAt = { $exists: false };
    } else {
        const properties = await Property.find({ createdBy: req.user._id, creatorRole: req.user.role }).select('_id');
        const propertyIds = properties.map(p => p._id);
        
        query.sellerId = req.user._id;
        query.propertyId = { $in: propertyIds };
        query.sellerUpdatedAt = { $exists: false };
    }
    const pendingVisit = await SiteVisit.findOne(query)
        .populate('propertyId', 'title residential location')
        .populate('meetingId', 'slotStartTime slotEndTime')
        .sort({ updatedAt: -1 });
    res.json(pendingVisit);
});

export const getAllSiteVisits = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, search, date } = req.query;
    const query = { };
    if (status && status !== 'ALL') query.status = status;
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        const matchingUsers = await User.find({ $or: [{ name: searchRegex }, { email: searchRegex }] }).select('_id');
        const userIds = matchingUsers.map(u => u._id);
        const matchingProperties = await Property.find({ $or: [{ title: searchRegex }, { "residential.propertyTitle": searchRegex }, { "location.projectName": searchRegex }] }).select('_id');
        const propertyIds = matchingProperties.map(p => p._id);
        query.$or = [{ buyerId: { $in: userIds } }, { propertyId: { $in: propertyIds } }];
    }
    if (date) {
        const startOfDay = new Date(date); startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(date); endOfDay.setHours(23,59,59,999);
        const matchingMeetings = await Meeting.find({ slotStartTime: { $gte: startOfDay, $lte: endOfDay } }).select('_id');
        const meetingIds = matchingMeetings.map(m => m._id);
        const dateCondition = { $or: [{ meetingId: { $in: meetingIds } }, { actualVisitDate: { $gte: startOfDay, $lte: endOfDay } }] };
        if (query.$or) query.$and = [{ $or: query.$or }, dateCondition]; else query.$or = dateCondition.$or;
    }
    const [siteVisits, totalCount, statsResult] = await Promise.all([
        SiteVisit.find(query).populate('sellerId', 'name').populate('buyerId', 'name').populate('propertyId', 'title location').populate('meetingId', 'slotStartTime status').sort({ createdAt: -1 }).skip(skip).limit(limit),
        SiteVisit.countDocuments(query),
        SiteVisit.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    ]);
    // Format stats for frontend
    const stats = {
        total: totalCount,
        visited: statsResult.find(s => s._id === 'VISITED')?.count || 0,
        not_visited: statsResult.find(s => s._id === 'NOT_VISITED')?.count || 0,
        pending: statsResult.find(s => s._id === 'PENDING')?.count || 0
    };

    res.json({ 
        siteVisits, 
        total: totalCount, 
        stats,
        page, 
        limit, 
        totalPages: Math.ceil(totalCount / limit) 
    });
});

// @desc    Admin schedules a meeting
// @route   POST /api/v1/meetings/schedule
// @access  Private (Admin only)
export const scheduleMeetingByAdmin = asyncHandler(async (req, res) => {
    const { buyerEmail, buyerName, proEmail, proName, date, time } = req.body;

    const [buyer, pro] = await Promise.all([
        User.findOne({ email: buyerEmail }),
        User.findOne({ email: proEmail })
    ]);

    if (!buyer || !pro) {
        res.status(404);
        throw new Error("Buyer or Professional not found with provided email.");
    }

    const start = new Date(date);
    if (typeof date === 'string' && !date.includes('T') && time) {
        const [timeStr, period] = time.split(' ');
        let [hours, minutes] = timeStr.split(':').map(Number);
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        start.setUTCHours(hours, minutes, 0, 0);
    }
    const end = new Date(start);
    end.setUTCHours(start.getUTCHours() + 1);

    // Centralized Conflict Validation for Admin scheduling
    const conflict = await checkMeetingConflict({
        attendeeId: buyer._id,
        hostId: pro._id,
        slotStartTime: start,
        slotEndTime: end
    });

    if (conflict) {
        res.status(400);
        if (conflict.type === 'BUYER') {
            const propTitle = conflict.meeting.propertyTitle || "another property";
            throw new Error(`The buyer already has a booking for ${propTitle} at this time.`);
        } else {
            throw new Error(`The professional (host) is already busy with another video call at this time.`);
        }
    }

    const meeting = await Meeting.create({
        title: "Admin Scheduled Meeting",
        hostId: pro._id,
        propertyId: null, // Admin meetings might not be tied to a specific property listing
        attendeeId: buyer._id,
        attendeeName: buyerName || buyer.name,
        attendeePhone: buyer.phone,
        slotStartTime: start,
        slotEndTime: end,
        status: 'APPROVED',
        scheduledBy: req.user._id,
        propertyTitle: `Scheduled by Admin`
    });

    res.status(201).json({
        success: true,
        message: "Meeting scheduled successfully by admin.",
        meeting
    });
});

// @desc    Get single meeting by ID
// @route   GET /api/v1/meetings/:id
// @access  Private
export const getMeetingById = asyncHandler(async (req, res) => {
    const meeting = await Meeting.findById(req.params.id)
        .populate('propertyId')
        .populate('hostId', 'name email phone avatar');

    if (!meeting) {
        res.status(404);
        throw new Error("Meeting not found.");
    }

    // Authorization: Admin, Host, or Attendee
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(req.user.role);
    const isHost = meeting.hostId?._id?.toString() === req.user._id.toString() || meeting.hostId?.toString() === req.user._id.toString();
    const isAttendee = meeting.attendeeId?.toString() === req.user._id.toString();

    if (!isAdmin && !isHost && !isAttendee) {
        res.status(403);
        throw new Error("Not authorized to view this meeting.");
    }

    res.json(meeting);
});
