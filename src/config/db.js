import mongoose from "mongoose";

// Cache the connection promise to avoid multiple connection attempts
let cachedConnection = null;

export const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB Already Connected");
      return mongoose.connection;
    }

    // If connection is in progress, return the cached promise
    if (cachedConnection) {
      console.log("⏳ MongoDB Connection in progress...");
      return await cachedConnection;
    }

    // Check if MONGO_URI is provided
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not defined in environment variables");
      throw new Error("MONGO_URI is required");
    }

    // Create connection promise with proper options for serverless
    cachedConnection = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      connectTimeoutMS: 10000, // 10 seconds connection timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1, // Maintain at least 1 socket connection
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    });

    await cachedConnection;
    console.log("✅ MongoDB Connected Successfully");
    
    // Reset cached connection on disconnect
    mongoose.connection.on("disconnected", () => {
      console.log("⚠️  MongoDB Disconnected");
      cachedConnection = null;
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB Connection Error:", err);
      cachedConnection = null;
    });

    return mongoose.connection;
  } catch (err) {
    console.error("❌ DB Connection Failed:", err.message);
    cachedConnection = null;
    
    // Don't exit process in serverless environment (Vercel)
    if (process.env.VERCEL || process.env.VERCEL_ENV) {
      console.error("⚠️  Connection failed, will retry on next request");
      throw err; // Re-throw to let caller handle
    } else {
      process.exit(1);
    }
  }
};

// Helper function to ensure connection before operations
export const ensureConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  if (mongoose.connection.readyState === 2) {
    // Connection in progress, wait for it
    await new Promise((resolve, reject) => {
      mongoose.connection.once("connected", resolve);
      mongoose.connection.once("error", reject);
      setTimeout(() => reject(new Error("Connection timeout")), 10000);
    });
    return;
  }
  
  // Not connected, establish connection
  await connectDB();
};
