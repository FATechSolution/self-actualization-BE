/**
 * Complete Migration Script: Fix Old Goals
 * 
 * This script:
 * 1. Maps old type values ("Health", "Personal") to new valid types
 * 2. Adds missing required fields (currentLevel, targetLevel)
 * 3. Migrates description to userNotes
 * 4. Sets completedAt for completed goals
 * 
 * Usage:
 *   node scripts/migrateGoalsComplete.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Goal from "../src/models/Goal.js";

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/self-actualization-analysis";

// Map old type values to new valid types
const TYPE_MAPPING = {
  "Health": "Survival",      // Health goals → Survival category
  "Personal": "Self",         // Personal goals → Self category
  // Add more mappings if needed
};

const VALID_TYPES = ["Survival", "Safety", "Social", "Self", "Meta-Needs"];

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
 * Migrate existing goals
 */
const migrateGoals = async () => {
  try {
    console.log("\n🔄 Starting complete goal migration...\n");

    // Find all goals that need migration (use find() without lean() to get Mongoose documents)
    const allGoals = await Goal.find({}).lean(); // Use lean() for reading, then fetch full docs for updating
    console.log(`📊 Found ${allGoals.length} total goals in database\n`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const goal of allGoals) {
      try {
        const updates = {};
        let needsUpdate = false;

        // 1. Fix invalid type values
        if (goal.type && !VALID_TYPES.includes(goal.type)) {
          const newType = TYPE_MAPPING[goal.type];
          if (newType) {
            updates.type = newType;
            needsUpdate = true;
            console.log(`   📝 Mapping type "${goal.type}" → "${newType}" for goal: ${goal._id}`);
          } else {
            // If no mapping found, default to "Survival"
            updates.type = "Survival";
            needsUpdate = true;
            console.log(`   ⚠️  Unknown type "${goal.type}", defaulting to "Survival" for goal: ${goal._id}`);
          }
        }

        // 2. Add missing currentLevel (check if field doesn't exist or is null)
        if (!goal.currentLevel || goal.currentLevel === null || goal.currentLevel === undefined) {
          updates.currentLevel = 1; // Default starting level
          needsUpdate = true;
        }

        // 3. Add missing targetLevel (check if field doesn't exist or is null)
        if (!goal.targetLevel || goal.targetLevel === null || goal.targetLevel === undefined) {
          updates.targetLevel = 7; // Default target level
          needsUpdate = true;
        }

        // 4. Migrate description to userNotes if userNotes is empty
        if ((goal.userNotes === undefined || goal.userNotes === "" || goal.userNotes === null) && goal.description) {
          updates.userNotes = goal.description;
          needsUpdate = true;
        }

        // 5. Set completedAt for already completed goals
        if (goal.isCompleted && (goal.completedAt === undefined || goal.completedAt === null)) {
          updates.completedAt = goal.updatedAt || goal.createdAt || new Date();
          needsUpdate = true;
        } else if (!goal.isCompleted && goal.completedAt) {
          // Clear completedAt if goal is not completed
          updates.completedAt = null;
          needsUpdate = true;
        }

        // Apply updates if needed
        if (needsUpdate) {
          // Use updateOne with $set to ensure fields are added
          const result = await Goal.updateOne(
            { _id: goal._id },
            { $set: updates },
            { upsert: false }
          );
          
          if (result.modifiedCount > 0 || result.matchedCount > 0) {
            successCount++;
            const updateDetails = Object.keys(updates).join(", ");
            console.log(`✅ Migrated goal: ${goal._id} - "${goal.title || 'Untitled'}" (${updateDetails})`);
          } else {
            errorCount++;
            console.error(`❌ Failed to update goal: ${goal._id} - No document matched or modified`);
          }
        } else {
          skippedCount++;
          console.log(`⏭️  Skipped goal: ${goal._id} - "${goal.title || 'Untitled'}" (already up to date)`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating goal ${goal._id}:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary:");
    console.log("=".repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} goals`);
    console.log(`⏭️  Skipped (already up to date): ${skippedCount} goals`);
    console.log(`❌ Failed to migrate: ${errorCount} goals`);
    console.log(`📈 Total processed: ${allGoals.length} goals`);
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
      currentLevel: { $exists: true, $ne: null },
      targetLevel: { $exists: true, $ne: null },
    });
    const goalsWithValidTypes = await Goal.countDocuments({
      type: { $in: VALID_TYPES },
    });

    console.log(`📊 Total goals in database: ${totalGoals}`);
    console.log(`✅ Goals with level fields: ${goalsWithLevels}`);
    console.log(`✅ Goals with valid types: ${goalsWithValidTypes}`);

    if (totalGoals === goalsWithLevels && totalGoals === goalsWithValidTypes) {
      console.log("\n✅ All goals have been successfully migrated!\n");
    } else {
      const missingLevels = totalGoals - goalsWithLevels;
      const invalidTypes = totalGoals - goalsWithValidTypes;
      if (missingLevels > 0) {
        console.log(`\n⚠️  ${missingLevels} goals still missing level fields.`);
      }
      if (invalidTypes > 0) {
        console.log(`⚠️  ${invalidTypes} goals still have invalid types.`);
      }
    }

    // Show sample migrated goals
    const sampleGoals = await Goal.find({})
      .limit(3)
      .lean();

    if (sampleGoals.length > 0) {
      console.log("\n📋 Sample goals after migration:\n");
      sampleGoals.forEach((goal, index) => {
        console.log(`${index + 1}. ${goal.title || 'Untitled'}`);
        console.log(`   - Type: ${goal.type}`);
        console.log(`   - Current Level: ${goal.currentLevel || 'MISSING'}`);
        console.log(`   - Target Level: ${goal.targetLevel || 'MISSING'}`);
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
    console.log("🚀 Complete Goal Migration Script");
    console.log("=".repeat(60));
    console.log("This will:");
    console.log("  • Fix invalid type values (Health → Survival, Personal → Self)");
    console.log("  • Add missing currentLevel and targetLevel fields");
    console.log("  • Migrate description to userNotes");
    console.log("  • Set completedAt for completed goals");
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
