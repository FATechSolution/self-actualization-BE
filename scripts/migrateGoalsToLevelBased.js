/**
 * Migration Script: Convert Time-Based Goals to Level-Based Goals
 * 
 * This script updates existing goals in the database to include the new
 * level-based tracking fields (currentLevel, targetLevel, userNotes, completedAt)
 * 
 * Run this script ONCE after deploying the new goal system changes.
 * 
 * Usage:
 *   node Backend/scripts/migrateGoalsToLevelBased.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Goal from "../src/models/Goal.js";

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/self-actualization-analysis";

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

/**
 * Migrate existing goals to level-based system
 */
const migrateGoals = async () => {
  try {
    console.log("\n🔄 Starting goal migration...\n");

    // Find all goals that don't have the new level fields
    const goalsToMigrate = await Goal.find({
      $or: [
        { currentLevel: { $exists: false } },
        { targetLevel: { $exists: false } },
      ],
    });

    console.log(`📊 Found ${goalsToMigrate.length} goals to migrate\n`);

    if (goalsToMigrate.length === 0) {
      console.log("✅ No goals need migration. All goals are up to date!");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const goal of goalsToMigrate) {
      try {
        const updates = {};

        // Set default currentLevel (starting point)
        if (goal.currentLevel === undefined) {
          updates.currentLevel = 1;
        }

        // Set default targetLevel (maximum)
        if (goal.targetLevel === undefined) {
          updates.targetLevel = 7;
        }

        // Migrate description to userNotes if userNotes doesn't exist
        if (goal.userNotes === undefined) {
          updates.userNotes = goal.description || "";
        }

        // Set completedAt for already completed goals
        if (goal.completedAt === undefined && goal.isCompleted) {
          // Use updatedAt as completedAt for already completed goals
          updates.completedAt = goal.updatedAt || goal.createdAt || new Date();
        } else if (goal.completedAt === undefined) {
          updates.completedAt = null;
        }

        // Apply updates
        await Goal.updateOne({ _id: goal._id }, { $set: updates });

        successCount++;
        console.log(`✅ Migrated goal: ${goal._id} - "${goal.title}"`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating goal ${goal._id}:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary:");
    console.log("=".repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} goals`);
    console.log(`❌ Failed to migrate: ${errorCount} goals`);
    console.log(`📈 Total processed: ${goalsToMigrate.length} goals`);
    console.log("=".repeat(60) + "\n");

    if (errorCount === 0) {
      console.log("🎉 Migration completed successfully!\n");
    } else {
      console.log("⚠️  Migration completed with some errors. Please review the logs.\n");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

/**
 * Verify migration results
 */
const verifyMigration = async () => {
  try {
    console.log("🔍 Verifying migration results...\n");

    const totalGoals = await Goal.countDocuments({});
    const goalsWithLevels = await Goal.countDocuments({
      currentLevel: { $exists: true },
      targetLevel: { $exists: true },
    });

    console.log(`📊 Total goals in database: ${totalGoals}`);
    console.log(`✅ Goals with level fields: ${goalsWithLevels}`);

    if (totalGoals === goalsWithLevels) {
      console.log("\n✅ All goals have been successfully migrated!\n");
    } else {
      console.log(`\n⚠️  ${totalGoals - goalsWithLevels} goals still need migration.\n`);
    }

    // Sample a few migrated goals
    const sampleGoals = await Goal.find({
      currentLevel: { $exists: true },
      targetLevel: { $exists: true },
    })
      .limit(3)
      .lean();

    if (sampleGoals.length > 0) {
      console.log("📋 Sample migrated goals:\n");
      sampleGoals.forEach((goal, index) => {
        console.log(`${index + 1}. ${goal.title}`);
        console.log(`   - Current Level: ${goal.currentLevel}`);
        console.log(`   - Target Level: ${goal.targetLevel}`);
        console.log(`   - User Notes: ${goal.userNotes ? goal.userNotes.substring(0, 50) + "..." : "(empty)"}`);
        console.log(`   - Completed: ${goal.isCompleted ? "Yes" : "No"}`);
        if (goal.completedAt) {
          console.log(`   - Completed At: ${goal.completedAt}`);
        }
        console.log("");
      });
    }
  } catch (error) {
    console.error("❌ Verification failed:", error);
  }
};

/**
 * Main execution
 */
const main = async () => {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🚀 Goal Migration Script - Time-Based to Level-Based");
    console.log("=".repeat(60) + "\n");

    await connectDB();
    await migrateGoals();
    await verifyMigration();

    console.log("✅ Migration script completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration script failed:", error);
    process.exit(1);
  }
};

// Run the migration
main();
