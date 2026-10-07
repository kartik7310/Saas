import express from 'express';
// Route to fetch a single meeting by ID
import {
    bookMeeting,
    getMyMeetings,
    getAllMeetings,
    updateMeetingStatus,
    getPropertyOccupiedSlots,
    updateSiteVisitFeedback,
    getPendingSiteVisit,
    getAllSiteVisits,
    joinMeeting,
    scheduleMeetingByAdmin,
    rescheduleMeeting,
    getMeetingById
} from '../controllers/meeting.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { UserRole } from '../models/user.model.js';

const router = express.Router();

router.use(protect);

// Specific Routes (MUST be before :id routes)
router.get('/all', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SELLER, UserRole.BROKER, UserRole.BUILDER, UserRole.BUYER), getAllMeetings);
router.get('/upcoming', getMyMeetings);
router.get('/pending-site-visit', getPendingSiteVisit);
router.get('/site-visits', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), getAllSiteVisits);
router.post('/schedule', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), scheduleMeetingByAdmin);

// Parameterized Routes
router.post('/', bookMeeting);
router.get('/availability/:propertyId', getPropertyOccupiedSlots);
router.get('/:id', getMeetingById);
router.post('/:id/join', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SELLER, UserRole.BROKER, UserRole.BUILDER, UserRole.BUYER), joinMeeting);
router.patch('/:id/status', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SELLER, UserRole.BROKER, UserRole.BUILDER), updateMeetingStatus);
router.patch('/:id/site-visit-feedback', updateSiteVisitFeedback);
router.patch('/:id/reschedule', rescheduleMeeting);


export default router;
