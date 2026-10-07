import nodemailer from 'nodemailer';
import logger from '../config/logger.js';
import config from '../config/config.js';

const transport = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: parseInt(config.EMAIL_PORT),
  secure: parseInt(config.EMAIL_PORT) === 465,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify SMTP connection
console.log("SMTP connecting...");
transport.verify((error, success) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP connected");
  }
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    console.log(`[Email Service] Triggering email for: ${to} | Subject: ${subject}`);

    const info = await transport.sendMail({
      from: `"Link2Builder" <${config.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent");
    console.log(`[Email Service] Email sent successfully to: ${to} | MessageId: ${info.messageId}`);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Email Service] FAILED to send email to ${to}: ${error.message}`);
    logger.error(`Error sending email to ${to}: ${error.message}`);
    throw error; // Rethrow to allow controller to catch it
  }
};

export const notifyAdminNewUser = async (user) => {
  const adminDashboardUrl = `${config.clientUrl}/admin-dashboard/builders?status=PENDING`;
  const subject = `New ${user.role} Registration: ${user.name}`;
  const text = `A new ${user.role} has registered and is pending approval.\n\nName: ${user.name}\nEmail: ${user.email}\n\nPlease login to the admin dashboard to approve or reject this user at: ${adminDashboardUrl}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">New User Registration</h2>
      <p>A new <strong>${user.role}</strong> has registered and requires your approval.</p>
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Name:</strong> ${user.name}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
        <p style="margin: 5px 0;"><strong>Role:</strong> ${user.role}</p>
      </div>
      <p style="margin-bottom: 25px;">Please review the application in the admin dashboard.</p>
      <a href="${adminDashboardUrl}" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
      <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">This is an automated notification from Link2Builder Admin System.</p>
    </div>
  `;

  return sendEmail({ to: config.ADMIN_EMAIL || 'admin@example.com', subject, text, html });
};

export const sendOTPEmail = async (email, otp, type = "VERIFICATION") => {
  const subject = type === "VERIFICATION" ? "Verify Your Email - Link2Builder" : "Login OTP - Link2Builder";
  const actionText = type === "VERIFICATION" ? "verify your email address" : "log in to your account";

  const text = `Your One-Time Password (OTP) is: ${otp}\n\nThis code will expire in 10 minutes. Please use it to ${actionText}.`;
  const html = `
    <div style="font-family: sans-serif; padding: 40px; color: #333; max-width: 600px; margin: auto; text-align: center; border: 1px solid #eee; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <h1 style="color: #4f46e5; margin-bottom: 30px;">Link2Builder</h1>
        <p style="font-size: 18px; margin-bottom: 10px;">Hello,</p>
        <p style="font-size: 16px; color: #666; margin-bottom: 30px;">Use the following code to ${actionText}:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; display: inline-block; margin-bottom: 30px;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #111827;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #9ca3af; margin-bottom: 30px;">This code is valid for <strong>10 minutes</strong>. If you did not request this code, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 30px;" />
        <p style="font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} Link2Builder. All rights reserved.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

export const notifyUserApproval = async (user, isLogin = false) => {
  const subject = isLogin ? `Welcome Back to Link2Builder` : `Welcome to Link2Builder`;
  const welcomeMessage = isLogin
    ? `We're glad to see you again! Your ${user.role} account is ready for use.`
    : `Your account as a ${user.role} has been created successfully. We're excited to have you on board!`;

  const text = `Hi ${user.name},\n\n${welcomeMessage}\n\nBest regards,\nLink2Builder Team`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">${isLogin ? 'Welcome Back!' : 'Welcome to Link2Builder!'}</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>${welcomeMessage}</p>
      <p>You can now access all features of the platform.</p>
      <p>Best regards,<br>Link2Builder Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, text, html });
};

export const notifyUserRejection = async (email, name) => {
  const subject = `Account Application Update`;
  const text = `Hi ${name},\n\nThank you for your interest. Unfortunately, your account application has been rejected at this time.\n\nBest regards,\nLink2Builder Team`;
  const html = `
    <h1>Account Application Update</h1>
    <p>Hi ${name},</p>
    <p>Thank you for your interest. Unfortunately, your account application has been rejected at this time.</p>
    <p>Best regards,<br>Link2Builder Team</p>
  `;

  return sendEmail({ to: email, subject, text, html });
};

export const notifyMeetingApproval = async (meeting, recipientEmail, recipientName) => {
  const meetingLink = "https://us05web.zoom.us/j/84225365912?pwd=HRAycPfEstZ7x5gwmdTZhFTVv5yB1I.1";
  const subject = `Confirmed: Video Call for ${meeting.propertyTitle}`;

  const dateStr = new Date(meeting.date).toDateString();
  const timeStr = meeting.time;

  const text = `Hello ${recipientName},\n\nYour video meeting request for property "${meeting.propertyTitle}" has been approved by the admin.\n\nMeeting Details:\nDate: ${dateStr}\nTime: ${timeStr}\nMeeting Link: ${meetingLink}\n\nThank you,\nLink2Builder Team`;

  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4f46e5;">Meeting Approved!</h2>
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>Your video meeting request for property <strong>"${meeting.propertyTitle}"</strong> has been approved by the admin.</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Date:</strong> ${dateStr}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${timeStr}</p>
        <p style="margin: 5px 0;"><strong>Link:</strong> <a href="${meetingLink}" style="color: #4f46e5; font-weight: bold;">Join Video Meeting</a></p>
      </div>
      <p>You can also join directly from your dashboard "My Meetings" section.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">This is an automated message from Link2Builder.</p>
    </div>
  `;

  return sendEmail({ to: recipientEmail, subject, text, html });
};

export const sendFeaturedConfirmationEmail = async (email, name, propertyDetails, planDetails) => {
  const subject = `Featured Plan Activated: ${propertyDetails.title}`;
  const text = `Hi ${name},\n\nYour featured plan for "${propertyDetails.title}" (${propertyDetails.location}) has been activated successfully.\n\nPlan Details:\nDuration: ${planDetails.duration} days\nStart Date: ${planDetails.startDate.toDateString()}\nExpiry Date: ${planDetails.expiryDate.toDateString()}\n\nThank you for choosing Link2Builder.`;
  const html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Featured Plan Activated</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your property is now featured on Link2Builder!</p>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Property:</strong> ${propertyDetails.title}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${propertyDetails.location}</p>
                <p style="margin: 5px 0;"><strong>Plan Duration:</strong> ${planDetails.duration} days</p>
                <p style="margin: 5px 0;"><strong>Start Date:</strong> ${planDetails.startDate.toDateString()}</p>
                <p style="margin: 5px 0;"><strong>Expiry Date:</strong> ${planDetails.expiryDate.toDateString()}</p>
            </div>
            <p>Best regards,<br>Link2Builder Team</p>
        </div>
    `;

  return sendEmail({ to: email, subject, text, html });
};

export const sendFeaturedExpiryReminderEmail = async (email, name, propertyTitle) => {
  const subject = `Your Featured Property is Expiring Soon`;
  const text = `Hi ${name},\n\nYour featured plan for "${propertyTitle}" will expire in 1 day. You can renew it from your dashboard to keep it highlighted.\n\nBest regards,\nLink2Builder Team`;
  const html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #e11d48; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Featured Plan Expiring Soon</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>This is a reminder that your featured plan for <strong>"${propertyTitle}"</strong> will expire in <strong>1 day</strong>.</p>
            <p>To keep your property highlighted at the top of search results, you can renew your plan from your dashboard.</p>
            <div style="margin-top: 25px;">
                <a href="${config.clientUrl}/dashboard/properties" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Renew Plan</a>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">Best regards,<br>Link2Builder Team</p>
        </div>
    `;

  return sendEmail({ to: email, subject, text, html });
};

export const notifyMeetingScheduledByAdmin = async (meeting, recipientEmail, recipientName, otherParticipantName) => {
  const meetingLink = "https://us05web.zoom.us/j/84225365912?pwd=HRAycPfEstZ7x5gwmdTZhFTVv5yB1I.1";
  const subject = `Meeting Scheduled: Link2Builder Consultation`;

  const dateStr = new Date(meeting.date).toDateString();
  const timeStr = meeting.time;

  const text = `Hello ${recipientName},\n\nA video meeting has been scheduled for you by the Link2Builder Admin team.\n\nMeeting Details:\nParticipants: You and ${otherParticipantName}\nDate: ${dateStr}\nTime: ${timeStr}\nMeeting Link: ${meetingLink}\n\nThank you,\nLink2Builder Team`;

  const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4f46e5;">New Meeting Scheduled!</h2>
        <p>Hello <strong>${recipientName}</strong>,</p>
        <p>A video meeting has been scheduled for you by the Link2Builder Admin team.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Participants:</strong> You and ${otherParticipantName}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${dateStr}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${timeStr}</p>
          <p style="margin: 5px 0;"><strong>Link:</strong> <a href="${meetingLink}" style="color: #4f46e5; font-weight: bold;">Join Video Meeting</a></p>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">This is an automated message from Link2Builder Admin System.</p>
      </div>
    `;

  return sendEmail({ to: recipientEmail, subject, text, html });
};

