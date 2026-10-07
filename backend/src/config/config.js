import 'dotenv/config'; // Triggering restart

const config = {
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL,
  jwtSecret: process.env.JWT_SECRET,
  mongoUri: process.env.MONGODB_URI,
  EMAIL_HOST: process.env.SMTP_HOST || process.env.MAIL_HOST || process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.SMTP_PORT || process.env.MAIL_PORT || process.env.EMAIL_PORT,
  EMAIL_USER: process.env.SMTP_USER || process.env.MAIL_USER || process.env.EMAIL_USER,
  EMAIL_PASS: process.env.SMTP_PASS || process.env.MAIL_PASS || process.env.EMAIL_PASS,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.MAIL_USER || process.env.EMAIL_USER,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayPlan: process.env.RAZORPAY_PLAN,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  env: process.env.NODE_ENV || 'development',
};

export default config;
