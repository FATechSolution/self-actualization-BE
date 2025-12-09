/**
 * Seed basic QuestionLearning content for each regular (section 1) question.
 * Creates one learning item per need/question if missing.
 *
 * Usage:
 *   node scripts/seedQuestionLearning.js
 *
 * Requires MONGO_URI in env.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "../src/models/Questions.js";
import QuestionLearning from "../src/models/QuestionLearning.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ma7260712_db_user:jVOzoHihPmoxdITQ@cluster0.psuigku.mongodb.net/?appName=Cluster0";

const TEMPLATE = (needLabel) => ({
  title: `${needLabel}: Why it matters and how to improve`,
  content: `This learning piece explains the importance of ${needLabel} for self-actualization, with simple steps to improve.\n\nQuick actions:\n- Understand what good ${needLabel.toLowerCase()} looks like\n- Identify one small change to try this week\n- Track how it impacts your energy and wellbeing`,
  learningType: "general",
  readTimeMinutes: 4,
});

async function connect() {
  console.log("🟡 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");
}

async function seed() {
  const parents = await Question.find({ sectionType: "regular", section: 1 }).lean();
  console.log(`Found ${parents.length} parent questions`);

  let created = 0;
  for (const q of parents) {
    const exists = await QuestionLearning.findOne({ questionId: q._id });
    if (exists) continue;

    const payload = {
      questionId: q._id,
      ...TEMPLATE(q.needLabel || q.questionText),
      thumbnailUrl: null,
      isActive: true,
    };
    await QuestionLearning.create(payload);
    created += 1;
  }

  console.log(`✅ Seeded ${created} learning items (skipped existing)`);
}

async function run() {
  try {
    await connect();
    await seed();
  } catch (err) {
    console.error("❌ Seed error", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 MongoDB connection closed");
  }
}

run();

