import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  getUserDashboardStats,
  getPendingUsers,
  getAllBuilders,
  approveUser,
  rejectUser,
  logoutUser,
  verifyRegistrationOTP,
  initiateOTPLogin,
  verifyOTPLogin,
  createAdmin,
  getAdmins,
  getAdminActivities,
  toggleAdminStatus,
  searchUserByEmail,
  switchUserRole
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { UserRole } from '../models/user.model.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/verify-otp', verifyRegistrationOTP);
router.post('/login-otp-init', initiateOTPLogin);
router.post('/login-otp-verify', verifyOTPLogin);
router.get('/profile', protect, getUserProfile);
router.get('/dashboard-stats', protect, getUserDashboardStats);

// Admin only routes
router.get('/admin-data', protect, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => {
  res.json({ message: 'Welcome Admin, this is sensitive data.' });
});

router.get('/admin/pending', protect, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), getPendingUsers);
router.get('/admin/builders', protect, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), getAllBuilders);
router.put('/admin/approve/:id', protect, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), approveUser);
router.put('/admin/reject/:id', protect, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), rejectUser);

router.post('/admin/create-admin', protect, authorize(UserRole.SUPER_ADMIN), createAdmin);
router.get('/admin/list-admins', protect, authorize(UserRole.SUPER_ADMIN), getAdmins);
router.get('/admin/search-by-email', protect, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), searchUserByEmail);
router.get('/admin/activities/:id', protect, getAdminActivities);
router.patch('/admin/toggle-status/:id', protect, authorize(UserRole.SUPER_ADMIN), toggleAdminStatus);

router.patch('/switch-role', protect, switchUserRole);

export default router;


