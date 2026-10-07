import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import logger from './config/logger.js';
import config from './config/config.js';
import connectDB from './config/db.js';
import userRoutes from './routes/user.routes.js';
import propertyRoutes from './modules/properties/routes/propertyRoutes.js';
import adminRoutes from './modules/admin/routes/dashboardSummary.js';
import adminPropertyRoutes from './modules/admin/routes/adminProperty.routes.js';
import leadRoutes from './routes/lead.routes.js';
import meetingRoutes from './routes/meeting.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import testRoutes from './routes/test.routes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { razorpayWebhook } from './controllers/subscription.controller.js';
import subscriptionRoutes from './routes/subscription.route.js';
import paymentRoutes from './routes/payment.routes.js';
import featuredRoutes from './routes/featured.routes.js';
import { initCronJobs } from './utils/cronJobs.js';
// Connect to Database
connectDB();

// Initialize Cron Jobs
initCronJobs();

const app = express();

// Middleware
app.use(helmet());
app.use(cookieParser());

app.post(
  "/razorpay/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: config.clientUrl, // frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
};

app.use(cors(corsOptions));
// Request logging middleware
app.use((req, res, next) => {
  console.log(`[Express] ${req.method} ${req.url}`);
  logger.info(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});


app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Real Estate API' });
});

// Routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/audit', adminPropertyRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/meetings', meetingRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1', featuredRoutes);
app.use('/api/v1', testRoutes);

app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${config.env} mode`);
});
