import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB Already Connected");
      return;
    }

    // Check if MONGO_URI is provided
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not defined in environment variables");
      if (process.env.VERCEL || process.env.VERCEL_ENV) {
        console.error("⚠️  Continuing without DB connection (serverless mode)");
        return;
      } else {
        throw new Error("MONGO_URI is required");
      }
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB Connection Failed:", err.message);
    // Don't exit process in serverless environment (Vercel)
    // Connection will retry on next request
    if (process.env.VERCEL || process.env.VERCEL_ENV) {
      console.error("⚠️  Continuing without DB connection (serverless mode)");
    } else {
      process.exit(1);
    }
  }
};
