import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';
import config from '../config/config.js';
import { User } from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';

// Optional protect - populate req.user if token exists, but don't fail if not
export const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      // Don't fail, just continue as guest
      logger.warn('Optional auth failed, continuing as guest');
      next();
    }
  } else {
    next();
  }
});

// Protect routes - verify JWT token and user existence
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check cookies first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Then check Authorization header`
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);

      // Fetch user from DB to ensure they still exist and have correct role
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      if (req.user.status === 'BLOCKED') {
        res.status(403);
        throw new Error('Your account has been blocked. Please contact support.');
      }

      next();
    } catch (error) {
      logger.error('Not authorized, token failed');
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Authorize roles - check if user role is permitted
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`User role ${req.user?.role || 'unknown'} is not authorized to access this route`);
    }
    next();
  };
};
