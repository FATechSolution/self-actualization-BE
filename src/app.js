import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, ensureConnection } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import questionLearningRoutes from "./routes/questionLearningRoutes.js";
import audioRoutes from "./routes/audioRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import reflectionRoutes from "./routes/reflectionRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminAuthRoutes from "./routes/admin/adminAuthRoutes.js";
import adminDashboardRoutes from "./routes/admin/adminDashboardRoutes.js";
import adminAudioRoutes from "./routes/admin/adminAudioRoutes.js";
import adminVideoRoutes from "./routes/admin/adminVideoRoutes.js";
import adminArticleRoutes from "./routes/admin/adminArticleRoutes.js";
import adminUserRoutes from "./routes/admin/adminUserRoutes.js";
import { errorHandler } from "./utils/errorHandler.js";

dotenv.config();

const app = express();

// Connect to database (non-blocking for serverless)
// This won't block the function from starting even if DB connection fails
connectDB().catch((err) => {
  console.error("Database connection error:", err);
});

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    try {
      // Always include these origins
      const defaultOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "https://self-admin-pannel.vercel.app",
        "https://self-actualization-app.vercel.app",
      ];
      
      // Add any additional origins from environment variable
      const envOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
        : [];
      
      const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

      // Allow requests with no origin (Postman, curl, etc.) and from allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    } catch (error) {
      console.error("CORS Error:", error);
      callback(error);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400, // 24 hours
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection middleware - ensures DB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await ensureConnection();
    next();
  } catch (error) {
    console.error("Database connection error in middleware:", error);
    res.status(503).json({
      success: false,
      error: "Database connection failed. Please try again later.",
    });
  }
});

// Welcome/root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Self Actualization Analysis API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        firebaseLogin: "POST /api/auth/firebase-login (Google/Apple)",
        oauth: "POST /api/auth/oauth (Legacy)",
        forgotPassword: "POST /api/auth/forgot-password",
        resetPassword: "POST /api/auth/reset-password",
        verifyResetToken: "POST /api/auth/verify-reset-token",
        getCurrentUser: "GET /api/auth/me",
        updateProfile: "PUT /api/auth/profile",
      },
      questions: {
        list: "GET /api/questions",
      },
      questionLearning: {
        list: "GET /api/question-learning",
        getByQuestion: "GET /api/question-learning/question/:questionId",
        getById: "GET /api/question-learning/:id",
        create: "POST /api/question-learning",
        update: "PATCH /api/question-learning/:id",
        delete: "DELETE /api/question-learning/:id",
      },
      audios: {
        list: "GET /api/audios",
        retrieve: "GET /api/audios/:id",
      },
      videos: {
        list: "GET /api/videos",
        retrieve: "GET /api/videos/:id",
      },
      articles: {
        list: "GET /api/articles",
        retrieve: "GET /api/articles/:id",
      },
      assessment: {
        submit: "POST /api/assessment/submit",
        result: "GET /api/assessment/result",
      },
      goals: {
        create: "POST /api/goals",
        list: "GET /api/goals",
        needsByCategory: "GET /api/goals/needs/:category",
        retrieve: "GET /api/goals/:id",
        update: "PATCH /api/goals/:id",
        delete: "DELETE /api/goals/:id",
      },
      reflections: {
        create: "POST /api/reflections",
        list: "GET /api/reflections",
        retrieve: "GET /api/reflections/:id",
        update: "PATCH /api/reflections/:id",
        delete: "DELETE /api/reflections/:id",
      },
      subscriptions: {
        create: "POST /api/subscriptions",
        getCurrent: "GET /api/subscriptions/current",
        getAvailableCategories: "GET /api/subscriptions/available-categories",
        updateStatus: "PATCH /api/subscriptions/status",
      },
      achievements: {
        getAchievements: "GET /api/achievements",
        getFocusStreak: "GET /api/achievements/streak",
        getLeaderboard: "GET /api/achievements/leaderboard",
      },
      notifications: {
        saveFCMToken: "POST /api/notifications/fcm-token",
        removeFCMToken: "DELETE /api/notifications/fcm-token",
        getSettings: "GET /api/notifications/settings",
        updateSettings: "PATCH /api/notifications/settings",
        testNotification: "POST /api/notifications/test",
      },
      adminAuth: {
        register: "POST /api/admin/auth/register",
        login: "POST /api/admin/auth/login",
        me: "GET /api/admin/auth/me",
      },
      adminDashboard: {
        dashboard: "GET /api/admin/dashboard",
      },
      adminAudios: {
        list: "GET /api/admin/audios",
        create: "POST /api/admin/audios",
        retrieve: "GET /api/admin/audios/:id",
        update: "PATCH /api/admin/audios/:id",
        delete: "DELETE /api/admin/audios/:id",
      },
      adminVideos: {
        list: "GET /api/admin/videos",
        create: "POST /api/admin/videos",
        retrieve: "GET /api/admin/videos/:id",
        update: "PATCH /api/admin/videos/:id",
        delete: "DELETE /api/admin/videos/:id",
      },
      adminArticles: {
        list: "GET /api/admin/articles",
        create: "POST /api/admin/articles",
        retrieve: "GET /api/admin/articles/:id",
        update: "PATCH /api/admin/articles/:id",
        delete: "DELETE /api/admin/articles/:id",
      },
      adminUsers: {
        list: "GET /api/admin/users",
        retrieve: "GET /api/admin/users/:id",
        delete: "DELETE /api/admin/users/:id",
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/question-learning", questionLearningRoutes);
app.use("/api/audios", audioRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/reflections", reflectionRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/audios", adminAudioRoutes);
app.use("/api/admin/videos", adminVideoRoutes);
app.use("/api/admin/articles", adminArticleRoutes);
app.use("/api/admin/users", adminUserRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
