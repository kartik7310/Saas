import express from 'express';
import { sendEmail } from '../utils/emailUtils.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/test-email', asyncHandler(async (req, res) => {
  const { to } = req.body;

  if (!to) {
    return res.status(400).json({
      success: false,
      error: "Recipient email 'to' is required"
    });
  }

  try {
    await sendEmail({
      to,
      subject: "Link2Builder SMTP Test",
      text: "If you received this email, SMTP is working correctly."
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send email"
    });
  }
}));

export default router;
