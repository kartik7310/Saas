import logger from '../config/logger.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, UserStatus } from '../models/user.model.js';
import { Property } from '../models/property.model.js';
import Lead from '../models/lead.model.js';
import Meeting from '../models/meeting.model.js';
import { Notification } from '../models/notification.model.js';
import { OTP } from '../models/otp.model.js';
import { generateToken } from '../utils/authUtils.js';
import { signupSchema, loginSchema } from '../utils/validation.js';
import config from '../config/config.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  sendOTPEmail,
  notifyAdminNewUser,
  notifyUserApproval,
  notifyUserRejection
} from '../utils/emailUtils.js';
import { generateOTP, hashOTP, compareOTP } from '../utils/otpUtils.js';

export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ message: "User logged out successfully" });
});

const setTokenCookie = (res, token) => {
  const isProduction = config.env === "production";

  res.cookie("token", token, {
    httpOnly: true,
    path: "/",
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

//   Register a new user
export const registerUser = asyncHandler(async (req, res) => {
  const validation = signupSchema.safeParse(req.body);

  if (!validation.success) {
    throw validation.error;
  }

  const { name, email, role, phone } = validation.data;
  if (role === "SUPER_ADMIN") {
    throw new Error("You cannot register as SUPER_ADMIN");
  }

  const userExists = await User.findOne({ email });
  if (userExists && userExists.isEmailVerified) {
    res.status(400);
    throw new Error('User already exists');
  }

  const autoApprovedRoles = ["BUYER"];
  const status = autoApprovedRoles.includes(role) ? UserStatus.APPROVED : UserStatus.PENDING;

  let user = userExists;
  if (!user) {
    user = await User.create({
      name,
      email,
      role,
      phone,
      status,
      isEmailVerified: false,
    });
  } else {
    user.name = name;
    user.role = role;
    user.phone = phone;
    user.status = status;
    await user.save();
  }

  const otpCode = generateOTP();
  const otpHash = await hashOTP(otpCode);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Rate Limiting Check (optional here but good practice)
  await OTP.deleteMany({ email, type: "VERIFICATION" });
  await OTP.create({ email, otpHash, expiresAt, type: "VERIFICATION" });
  // Send OTP Email
  try {
    await sendOTPEmail(email, otpCode, "VERIFICATION");
  } catch (emailError) {
    logger.error(`Failed to send verification OTP to ${email}: ${emailError.message}`);
    // If it's a new user, we might want to let them know the OTP failed
    // But if we already created/updated the user/OTP, we should return a meaningful error
    res.status(500);
    throw new Error("User created but failed to send verification email. Please try to 'Resend OTP'.");
  }

  // Notify Admin about new registration (Non-blocking)
  notifyAdminNewUser(user).catch(err => {
    logger.error(`Admin notification failed for new user ${email}: ${err.message}`);
  });

  res.status(201).json({
    success: true,
    message: "Registration successful. Please check your email for the verification code.",
    email: user.email,
    requiresVerification: true
  });
});

/**
 * Verify Registration OTP
 */
export const verifyRegistrationOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error("Email and OTP are required");
  }

  const otpRecord = await OTP.findOne({ email, type: "VERIFICATION" });

  if (!otpRecord) {
    res.status(400);
    throw new Error("OTP expired or not found. Please request a new one.");
  }

  if (otpRecord.attempts >= 5) {
    await OTP.deleteOne({ _id: otpRecord._id });
    res.status(400);
    throw new Error("Too many failed attempts. Please register again.");
  }

  const isMasterOTP = otp === '123456'; // REMOVE THIS AFTER TESTING (MASTER OTP)
  const isMatch = isMasterOTP || (await compareOTP(otp, otpRecord.otpHash));

  if (!isMatch) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    res.status(400);
    throw new Error("Invalid OTP");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.isEmailVerified = true;
  await user.save();
  await OTP.deleteOne({ _id: otpRecord._id });

  // Treat all users as approved after email verification
  const token = generateToken({ id: user._id, role: user.role });
  setTokenCookie(res, token);

  // Send welcome email
  try {
    await notifyUserApproval(user, false);
  } catch (emailError) {
    logger.error(`Welcome email failed for ${user.email}: ${emailError.message}`);
  }

  return res.status(200).json({
    success: true,
    message: "Email verified and logged in successfully",
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

/**
 * Initiate Passwordless Login (OTP)
 */
export const initiateOTPLogin = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(404);
    throw new Error("Account not found with this email");
  }

  if (user.isEmailVerified === false) {
    res.status(403);
    throw new Error("Please verify your email address first.");
  }

  if (user.role !== "SUPER_ADMIN" && ![UserStatus.APPROVED, UserStatus.ACTIVE].includes(user.status)) {
    res.status(403);
    if (user.status === UserStatus.PENDING) {
      throw new Error("Your account is currently under review by our team. You will be notified via email once it is approved.");
    } else if (user.status === UserStatus.REJECTED) {
      throw new Error("Your account application has been rejected. Please contact support for more information.");
    } else if (user.status === UserStatus.BLOCKED) {
      throw new Error("Your account has been blocked. Please contact support.");
    }
    throw new Error(`Your account status is: ${user.status}. Access restricted.`);
  }

  const otpCode = generateOTP();
  const otpHash = await hashOTP(otpCode);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.deleteMany({ email, type: "LOGIN" });
  await OTP.create({ email, otpHash, expiresAt, type: "LOGIN" });
  await sendOTPEmail(email, otpCode, "LOGIN");

  res.status(200).json({
    success: true,
    message: "Login code sent to your email."
  });
});

/**
 * Verify Login OTP
 */
export const verifyOTPLogin = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error("Email and code are required");
  }

  const otpRecord = await OTP.findOne({ email, type: "LOGIN" });

  if (!otpRecord) {
    res.status(400);
    throw new Error("Code expired or not found.");
  }
  // const isMatch = await compareOTP(otp, otpRecord.otpHash);
  const isMasterOTP = otp === '123456'; // REMOVE THIS AFTER TESTING (MASTER OTP)
  const isMatch = isMasterOTP || (await compareOTP(otp, otpRecord.otpHash));

  if (!isMatch) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    res.status(400);
    throw new Error("Invalid code");
  }

  const user = await User.findOne({ email });
  const token = generateToken({ id: user._id, role: user.role });
  setTokenCookie(res, token);
  await OTP.deleteOne({ _id: otpRecord._id });

  // Send welcome back email
  try {
    await notifyUserApproval(user, true);
  } catch (emailError) {
    logger.error(`Welcome back email failed for ${user.email}: ${emailError.message}`);
  }

  res.json({
    success: true,
    message: "Logged in successfully",
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

//  Authenticate user & get token
export const loginUser = asyncHandler(async (req, res) => {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    throw validation.error;
  }

  const { email, password } = validation.data;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (user && user.role === "SUPER_ADMIN" && password && (await bcrypt.compare(password, user.password))) {
    const token = generateToken({ id: user._id, role: user.role });
    setTokenCookie(res, token);
    res.json({
      message: "Admin logged in successfully",
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else if (user) {
    res.status(403);
    throw new Error('Please use OTP to log in.');
  } else {
    res.status(404);
    throw new Error('User not found. Please sign up.');
  }
});

//   Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

//   Get user dashboard stats
export const getUserDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const role = req.user.role;

  const publishedProjectsCount = await Property.countDocuments({
    createdBy: userId,
    creatorRole: role,
    propertyApprovedStatus: 'APPROVED'
  });

  const properties = await Property.find({ createdBy: userId, creatorRole: role }).select('_id');
  const propertyIds = properties.map(p => p._id);

  const totalLeadsCount = await Lead.countDocuments({ propertyId: { $in: propertyIds } });
  const totalMeetingsCount = await Meeting.countDocuments({ hostId: userId, status: 'Scheduled' });

  // Generate last 6 months data
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyLeads = await Lead.aggregate([
    {
      $match: {
        propertyId: { $in: propertyIds },
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 }
      }
    }
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();

  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    let d = new Date();
    d.setMonth(currentMonth - i);
    const mthIndex = d.getMonth();
    const found = monthlyLeads.find(l => l._id === mthIndex + 1);
    chartData.push({
      month: monthNames[mthIndex].substring(0, 1),
      leads: found ? found.count : 0,
      revenue: 0 // Placeholder
    });
  }

  res.json({
    publishedProjects: publishedProjectsCount,
    newLeads: totalLeadsCount,
    meetings: totalMeetingsCount,
    totalSales: "₹ 0", // Placeholder
    chartData
  });
});

// Admin: Get all users that need management (exclude SUPER_ADMIN)
export const getAllBuilders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { role, status, search } = req.query;

  const query = { role: { $ne: 'SUPER_ADMIN' } };

  if (role && role !== 'ALL') query.role = role;
  if (status && status !== 'ALL') query.status = status;
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];
  }

  const [users, total, stats] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
    User.aggregate([
      { $match: { role: { $ne: 'SUPER_ADMIN' } } },
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ])
  ]);

  const statsMap = stats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});
  const globalTotal = stats.reduce((acc, curr) => acc + curr.count, 0);

  logger.info(`Fetching users for management. Page: ${page}, Limit: ${limit}, Total: ${total}`);

  res.json({
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    stats: {
      total: globalTotal,
      builders: statsMap['BUILDER'] || 0,
      sellers: statsMap['SELLER'] || 0,
      buyers: statsMap['BUYER'] || 0,
      brokers: statsMap['BROKER'] || 0,
      admins: statsMap['ADMIN'] || 0,
    }
  });
});

// Admin: Get all users pending approval
export const getPendingUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ status: UserStatus.PENDING });
  res.json(users);
});

// Admin: Approve a user
export const approveUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({
    _id: id,
    status: UserStatus.PENDING
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found or not in PENDING state');
  }

  // Role-based Audit Guard
  if (user.auditedBy && user.auditedBy.toString() !== req.user._id.toString()) {
    if (req.user.role !== "SUPER_ADMIN") {
      res.status(403);
      throw new Error("Forbidden: This user is being audited by another Admin.");
    }
  }

  if (user && user.status === UserStatus.APPROVED) {
    logger.info(`User already approved: ${user.email}`);
    res.json({ message: 'User already approved' });
  }
  else if (user) {
    user.status = UserStatus.APPROVED;
    // Always record the auditor who is performing this specific action
    user.auditedBy = req.user._id;
    await user.save();

    logger.info(`User approved: ${user.email}`);
    // Notify User via Email
    notifyUserApproval(user);

    // Create Notification for User
    await Notification.create({
      recipient: user._id,
      title: "Account Approved",
      message: `Your account as ${user.role} has been approved. You can now access all features.`,
      type: "USER_APPROVED",
      relatedId: user._id
    });

    res.json({ message: 'User approved successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Admin: Reject a user (delete their account or mark as rejected)
export const rejectUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({
    _id: id,
    status: UserStatus.PENDING
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found or not in PENDING state');
  }

  // Role-based Audit Guard
  if (user.auditedBy && user.auditedBy.toString() !== req.user._id.toString()) {
    if (req.user.role !== "SUPER_ADMIN") {
      res.status(403);
      throw new Error("Forbidden: This user is being audited by another Admin.");
    }
  }

  if (user && user.status === UserStatus.REJECTED) {
    logger.info(`User already rejected: ${user.email}`);
    res.json({ message: 'User already rejected' });
  }
  else if (user) {
    user.status = UserStatus.REJECTED;
    // Always record the auditor who is performing this specific action
    user.auditedBy = req.user._id;
    await user.save();

    logger.info(`User rejected: ${user.email}`);
    // Notify User
    notifyUserRejection(user.email, user.name);
    res.json({ message: 'User rejected successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Super Admin: Create new Admin
export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, phone, location } = req.body;

  if (!name || !email) {
    res.status(400);
    throw new Error('Name and email are required');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create admin user with a random-ish password since they use OTP to login
  const defaultPassword = Math.random().toString(36).slice(-10);
  const hashedPassword = await bcrypt.hash(password || defaultPassword, 10);
  const adminUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "ADMIN",
    status: UserStatus.APPROVED,
    isEmailVerified: true,
    phone,
    location,
  });

  if (adminUser) {
    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid admin data');
  }
});

// Super Admin: Get all admins
export const getAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: "ADMIN" }).sort({ createdAt: -1 });
  res.json(admins);
});

// Admin/Super Admin: Get activity history for an admin
export const getAdminActivities = asyncHandler(async (req, res) => {
  const { id } = req.params; // Admin ID

  // Authorization check: Self or Super Admin
  if (req.user.role !== 'SUPER_ADMIN' && req.user._id.toString() !== id) {
    res.status(403);
    throw new Error('Not authorized to view these activities');
  }

  const adminObjectId = new mongoose.Types.ObjectId(id);

  // Fetch Properties audited by this admin
  const propertyActivities = await Property.find({ auditedBy: adminObjectId })
    .populate('createdBy', 'name email role')
    .sort({ updatedAt: -1 })
    .lean();

  const formattedProperties = propertyActivities.map(p => ({
    ...p,
    type: 'PROPERTY',
    displayTitle: p.title || p.residential?.propertyTitle || "Untitled Property",
    displayContext: p.listingType
  }));

  // Fetch Meetings audited by this admin
  const meetingActivities = await Meeting.find({ auditedBy: adminObjectId })
    .populate('attendeeId', 'name email')
    .populate('hostId', 'name email role')
    .sort({ updatedAt: -1 })
    .lean();

  const formattedMeetings = meetingActivities.map(m => ({
    ...m,
    type: 'MEETING',
    displayTitle: m.propertyTitle || m.title || "Video Call",
    displayContext: `MEETING: ${m.attendeeName}`
  }));

  // Fetch User Accounts audited by this admin
  const userActivities = await User.find({ auditedBy: adminObjectId })
    .sort({ updatedAt: -1 })
    .lean();

  const formattedUsers = userActivities.map(u => ({
    ...u,
    type: 'USER',
    displayTitle: u.name,
    displayContext: `ACCOUNT: ${u.role}`
  }));

  // Combine and sort by updatedAt desc
  const allActivities = [
    ...formattedProperties,
    ...formattedMeetings,
    ...formattedUsers
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  res.json(allActivities);
});

// Super Admin: Toggle admin status (Approve/Block)
export const toggleAdminStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (![UserStatus.APPROVED, UserStatus.BLOCKED].includes(status)) {
    res.status(400);
    throw new Error('Invalid status. Admin can only be toggled between APPROVED and BLOCKED');
  }

  const user = await User.findById(id);
  if (!user || user.role !== 'ADMIN') {
    res.status(404);
    throw new Error('Admin user not found');
  }

  user.status = status;
  await user.save();

  res.json({ message: `Admin account has been ${status.toLowerCase()}`, user });
});

// Admin: Search user by email for auto-fill in scheduling
export const searchUserByEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email, isEmailVerified: true }).select('name email role');

  if (!user) {
    res.status(404);
    throw new Error('User not found or not verified');
  }

  res.json(user);
});

// User: Switch Role (Toggle between Buyer, Seller, Builder, Broker)
export const switchUserRole = asyncHandler(async (req, res) => {
  const { newRole } = req.body;
  const userId = req.user.id;

  const allowedRoles = ["BUYER", "SELLER", "BUILDER", "BROKER"];
  if (!allowedRoles.includes(newRole?.toUpperCase())) {
    res.status(400);
    throw new Error('Invalid role specified. Must be BUYER, SELLER, BUILDER, or BROKER');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent admins from switching to other roles via this endpoint for security
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    res.status(403);
    throw new Error('Administrators cannot switch roles using this feature');
  }

  user.role = newRole.toUpperCase();
  await user.save();

  // Generate new token with updated role
  const token = generateToken({ id: user._id, role: user.role });
  setTokenCookie(res, token);

  res.json({
    success: true,
    message: `Account type switched to ${user.role} successfully`,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    token
  });
});
