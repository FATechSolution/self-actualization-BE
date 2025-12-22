/**
 * Fixes the firebaseUid index on the users collection:
 * - Drops existing firebaseUid_1 index (which is currently unique on null)
 * - Recreates it as { firebaseUid: 1 } with { unique: true, sparse: true }
 *
 * Usage:
 *   cd Backend
 *   node scripts/fixFirebaseUidIndex.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ma7260712_db_user:jVOzoHihPmoxdITQ@cluster0.psuigku.mongodb.net/?appName=Cluster0";

async function connect() {
  console.log("🟡 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");
}

async function fixIndex() {
  try {
    const collection = User.collection;

    console.log("\n🔍 Current indexes on users collection:");
    const indexes = await collection.indexes();
    indexes.forEach((idx) => console.log(" -", JSON.stringify(idx)));

    // First, clean up any documents where firebaseUid is explicitly null
    console.log("\n🧹 Unsetting firebaseUid on documents where it is null...");
    const unsetResult = await collection.updateMany(
      { firebaseUid: null },
      { $unset: { firebaseUid: "" } }
    );
    console.log(
      `✅ Unset firebaseUid on ${unsetResult.modifiedCount || 0} document(s) where firebaseUid was null`
    );

    // Drop existing firebaseUid_1 index if present
    const hasFirebaseIndex = indexes.some((idx) => idx.name === "firebaseUid_1");
    if (hasFirebaseIndex) {
      console.log("\n🧹 Dropping existing index: firebaseUid_1");
      await collection.dropIndex("firebaseUid_1");
      console.log("✅ Dropped firebaseUid_1 index");
    } else {
      console.log("\nℹ️ No existing firebaseUid_1 index found to drop");
    }

    // Recreate index as unique + sparse
    console.log("\n🛠  Creating sparse unique index on { firebaseUid: 1 }");
    await collection.createIndex({ firebaseUid: 1 }, { unique: true, sparse: true, name: "firebaseUid_1" });
    console.log("✅ Created sparse unique index firebaseUid_1 on { firebaseUid: 1 }");

    console.log("\n🔍 Indexes after update:");
    const newIndexes = await collection.indexes();
    newIndexes.forEach((idx) => console.log(" -", JSON.stringify(idx)));

    console.log("\n🎉 Index fix completed successfully");
  } catch (err) {
    console.error("❌ Error fixing firebaseUid index:", err);
    throw err;
  }
}

async function run() {
  try {
    await connect();
    await fixIndex();
  } catch (err) {
    // already logged
  } finally {
    await mongoose.connection.close();
    console.log("\n🔒 MongoDB connection closed");
  }
}

run();


