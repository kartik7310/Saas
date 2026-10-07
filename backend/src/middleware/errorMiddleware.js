import logger from '../config/logger.js';
import config from '../config/config.js';
import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Zod Validation Error
  if (err instanceof ZodError) {
    statusCode = 400;
    message = err.issues.map(issue => issue.message).join(', ');
  }

  // Handle Mongoose CastError (Invalid ID)
  else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Handle Mongoose ValidationError
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Handle MongoDB Duplicate Key Error
  else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    if (field === 'propertyId') {
      message = "This time slot is already booked for this property.";
    } else if (field === 'attendeeId') {
      message = "You already have a video call scheduled for this time slot.";
    } else {
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }
  }

  // Handle JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.name === 'MongooseServerSelectionError' || err.name === 'MongoNetworkError' || err.message.includes('buffering timed out')) {
    statusCode = 503;
    message = 'Database unreachable or connection lost. Please check your network and ensure your IP is whitelisted in MongoDB Atlas.';
  }

  logger.error(`${message} - ${req.method} ${req.url} - ${req.ip} - ${err.stack}`);
  
  res.status(statusCode).json({
    success: false,
    message
  });
};
