/**
 * Updates existing questions in the database with Quality and Volume sub-questions.
 * 
 * This script:
 * - Reads the quality/volume sub-questions mapping from data/qualityVolumeSubQuestions.js
 * - Finds each question in the database by matching mainQuestionText
 * - Updates the question with qualitySubQuestion and volumeSubQuestion data
 * - Only updates questions with sectionType "regular" (main questions)
 * 
 * Usage:
 *   node scripts/updateQualityVolumeSubQuestions.js
 * 
 * Requires MONGO_URI in environment.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "../src/models/Questions.js";
import { QUALITY_VOLUME_SUB_QUESTIONS } from "../data/qualityVolumeSubQuestions.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ma7260712_db_user:jVOzoHihPmoxdITQ@cluster0.psuigku.mongodb.net/?appName=Cluster0";

async function connect() {
  try {
    console.log("🟡 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

async function updateQuestions() {
  console.log(`\n📋 Processing ${QUALITY_VOLUME_SUB_QUESTIONS.length} question mappings...\n`);

  let updated = 0;
  let notFound = 0;
  let errors = 0;
  const notFoundQuestions = [];
  const errorQuestions = [];

  for (let i = 0; i < QUALITY_VOLUME_SUB_QUESTIONS.length; i++) {
    const mapping = QUALITY_VOLUME_SUB_QUESTIONS[i];
    const { mainQuestionText, qualitySubQuestion, volumeSubQuestion } = mapping;

    try {
      // Find the question by exact text match (case-sensitive)
      // Only update questions with sectionType "regular" (main questions)
      const question = await Question.findOne({
        questionText: mainQuestionText,
        sectionType: "regular",
        section: 1,
      });

      if (!question) {
        console.log(`⚠️  [${i + 1}/${QUALITY_VOLUME_SUB_QUESTIONS.length}] Not found: "${mainQuestionText.substring(0, 60)}..."`);
        notFound++;
        notFoundQuestions.push(mainQuestionText);
        continue;
      }

      // Update the question with quality and volume sub-questions
      question.qualitySubQuestion = {
        questionText: qualitySubQuestion.questionText,
        ratingOptions: qualitySubQuestion.ratingOptions,
      };

      question.volumeSubQuestion = {
        questionText: volumeSubQuestion.questionText,
        ratingOptions: volumeSubQuestion.ratingOptions,
      };

      await question.save();

      console.log(`✅ [${i + 1}/${QUALITY_VOLUME_SUB_QUESTIONS.length}] Updated: "${mainQuestionText.substring(0, 60)}..."`);
      updated++;

    } catch (err) {
      console.error(`❌ [${i + 1}/${QUALITY_VOLUME_SUB_QUESTIONS.length}] Error updating "${mainQuestionText.substring(0, 60)}...":`, err.message);
      errors++;
      errorQuestions.push({ question: mainQuestionText, error: err.message });
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 UPDATE SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Successfully updated: ${updated}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log(`❌ Errors: ${errors}`);
  console.log("=".repeat(60));

  if (notFoundQuestions.length > 0) {
    console.log("\n⚠️  Questions not found in database:");
    notFoundQuestions.forEach((q, idx) => {
      console.log(`   ${idx + 1}. "${q}"`);
    });
  }

  if (errorQuestions.length > 0) {
    console.log("\n❌ Questions with errors:");
    errorQuestions.forEach((item, idx) => {
      console.log(`   ${idx + 1}. "${item.question.substring(0, 60)}..."`);
      console.log(`      Error: ${item.error}`);
    });
  }

  if (updated === QUALITY_VOLUME_SUB_QUESTIONS.length) {
    console.log("\n🎉 All questions updated successfully!");
  } else {
    console.log(`\n⚠️  Only ${updated}/${QUALITY_VOLUME_SUB_QUESTIONS.length} questions were updated.`);
    console.log("   Please review the not found and error lists above.");
  }
}

async function run() {
  try {
    await connect();
    await updateQuestions();
  } catch (err) {
    console.error("❌ Script error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔒 MongoDB connection closed");
  }
}

run();

