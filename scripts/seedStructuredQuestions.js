/**
 * Seeds/updates questions to enforce Regular + V + Q structure with need metadata.
 *
 * - Adds needKey/needLabel/needOrder to parents and children.
 * - Creates/updates V (volume) and Q (quality) questions for each regular question.
 * - Reuses existing questions by questionText; creates if missing.
 *
 * Usage:
 *   node scripts/seedStructuredQuestions.js
 *
 * Requires MONGO_URI in environment (falls back to value in importQuestions).
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "../src/models/Questions.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ma7260712_db_user:jVOzoHihPmoxdITQ@cluster0.psuigku.mongodb.net/?appName=Cluster0";

// Base 41 regular questions with need metadata and custom V/Q prompts
// sectionOrder is sequential to preserve intended flow
const BASE_QUESTIONS = [
  {
    questionText: "I get 7-8 hours of quality, restorative sleep most nights",
    category: "Survival",
    needKey: "sleep",
    needLabel: "Sleep",
    sectionOrder: 1,
    vQuestionText: "How many hours of sleep do you typically get each night?",
    qQuestionText: "How would you rate the quality of your sleep?",
  },
  {
    questionText: "I eat nutritious, whole foods that fuel my body well",
    category: "Survival",
    needKey: "nutrition",
    needLabel: "Nutrition",
    sectionOrder: 2,
    vQuestionText: "How often do you eat balanced, nutritious meals each week?",
    qQuestionText: "How satisfied are you with the quality of the food you eat?",
  },
  {
    questionText: "I exercise regularly (3+ times/week) and feel physically vital",
    category: "Survival",
    needKey: "exercise",
    needLabel: "Exercise",
    sectionOrder: 3,
    vQuestionText: "How many days per week do you exercise?",
    qQuestionText: "How satisfied are you with the quality/effectiveness of your exercise?",
  },
  {
    questionText: "I have sufficient physical energy to do what matters to me",
    category: "Survival",
    needKey: "energy",
    needLabel: "Energy",
    sectionOrder: 4,
    vQuestionText: "How often do you feel low on energy in a typical week?",
    qQuestionText: "How would you rate the quality of your daily energy levels?",
  },
  {
    questionText: "I take care of my body and my overall health is good",
    category: "Survival",
    needKey: "health",
    needLabel: "Health",
    sectionOrder: 5,
    vQuestionText: "How consistently do you follow health routines (sleep, food, movement)?",
    qQuestionText: "How would you rate the quality of your overall health habits?",
  },
  {
    questionText: "I have sufficient money to meet my basic needs without constant stress",
    category: "Survival",
    needKey: "basic-finances",
    needLabel: "Basic Finances",
    sectionOrder: 6,
    vQuestionText: "How often do you meet basic expenses without strain?",
    qQuestionText: "How satisfied are you with the quality of your basic financial stability?",
  },
  {
    questionText: "My body feels healthy, strong, and capable",
    category: "Survival",
    needKey: "physical-strength",
    needLabel: "Physical Strength",
    sectionOrder: 7,
    vQuestionText: "How often do you feel physically capable doing daily tasks?",
    qQuestionText: "How satisfied are you with the quality of your physical strength?",
  },
  {
    questionText: "I feel physically safe in my home and daily environment",
    category: "Safety",
    needKey: "physical-safety",
    needLabel: "Physical Safety",
    sectionOrder: 8,
    vQuestionText: "How often do you encounter situations that feel physically unsafe?",
    qQuestionText: "How secure do you feel about the quality of your physical safety?",
  },
  {
    questionText: "I feel secure about my financial situation and future",
    category: "Safety",
    needKey: "financial-security",
    needLabel: "Financial Security",
    sectionOrder: 9,
    vQuestionText: "How consistently do you meet financial obligations without worry?",
    qQuestionText: "How satisfied are you with the quality of your financial security?",
  },
  {
    questionText: "I have structure, order, and routine in my life that supports me",
    category: "Safety",
    needKey: "structure-routine",
    needLabel: "Structure & Routine",
    sectionOrder: 10,
    vQuestionText: "How often do you follow a predictable daily/weekly routine?",
    qQuestionText: "How effective is the quality of your routines and structures?",
  },
  {
    questionText: "My life has sufficient stability (I'm not in constant chaos or crisis)",
    category: "Safety",
    needKey: "stability",
    needLabel: "Stability",
    sectionOrder: 11,
    vQuestionText: "How frequently do major disruptions impact your life?",
    qQuestionText: "How would you rate the quality of stability in your life?",
  },
  {
    questionText: "I feel in control of my life circumstances and able to influence outcomes",
    category: "Safety",
    needKey: "control-agency",
    needLabel: "Control & Agency",
    sectionOrder: 12,
    vQuestionText: "How often do you feel you can act to change your situation?",
    qQuestionText: "How satisfied are you with the quality of your personal agency?",
  },
  {
    questionText: "I have deep, meaningful connections with others who truly know me",
    category: "Social",
    needKey: "connection-depth",
    needLabel: "Deep Connection",
    sectionOrder: 13,
    vQuestionText: "How often do you engage in deep conversations each week?",
    qQuestionText: "How satisfied are you with the quality of your closest connections?",
  },
  {
    questionText: "I give and receive love, affection, and care in my relationships",
    category: "Social",
    needKey: "affection",
    needLabel: "Affection & Care",
    sectionOrder: 14,
    vQuestionText: "How frequently do you exchange affection with close others?",
    qQuestionText: "How satisfied are you with the quality of affection you give/receive?",
  },
  {
    questionText: "I feel like I belong to a community or group that matters to me",
    category: "Social",
    needKey: "belonging",
    needLabel: "Belonging",
    sectionOrder: 15,
    vQuestionText: "How often do you interact with your community/group?",
    qQuestionText: "How strong is the quality of your sense of belonging?",
  },
  {
    questionText: "I have at least one relationship of deep trust and intimacy",
    category: "Social",
    needKey: "trust-intimacy",
    needLabel: "Trust & Intimacy",
    sectionOrder: 16,
    vQuestionText: "How frequently do you share vulnerably with someone you trust?",
    qQuestionText: "How would you rate the quality of trust/intimacy in that relationship?",
  },
  {
    questionText: "I have friends/companions I enjoy spending time with regularly",
    category: "Social",
    needKey: "companionship",
    needLabel: "Companionship",
    sectionOrder: 17,
    vQuestionText: "How often do you spend enjoyable time with friends each week?",
    qQuestionText: "How satisfying is the quality of time with friends/companions?",
  },
  {
    questionText: "I respect myself, my choices, and my accomplishments",
    category: "Self",
    needKey: "self-respect",
    needLabel: "Self-Respect",
    sectionOrder: 18,
    vQuestionText: "How often do you acknowledge your own wins and good choices?",
    qQuestionText: "How would you rate the quality of your self-respect?",
  },
  {
    questionText: "I have a strong sense of my own dignity and inherent worth as a person",
    category: "Self",
    needKey: "self-worth",
    needLabel: "Self-Worth",
    sectionOrder: 19,
    vQuestionText: "How often do you feel grounded in your inherent worth?",
    qQuestionText: "How would you rate the quality of your sense of dignity/worth?",
  },
  {
    questionText: "I feel respected and valued by others (colleagues, family, friends)",
    category: "Self",
    needKey: "respect-from-others",
    needLabel: "Respect From Others",
    sectionOrder: 20,
    vQuestionText: "How frequently do others show you respect and appreciation?",
    qQuestionText: "How would you rate the quality of respect you receive?",
  },
  {
    questionText: "My voice and opinions matter; I'm listened to and taken seriously",
    category: "Self",
    needKey: "voice-agency",
    needLabel: "Voice & Agency",
    sectionOrder: 21,
    vQuestionText: "How often do you speak up and feel heard?",
    qQuestionText: "How would you rate the quality of being heard/taken seriously?",
  },
  {
    questionText: "I'm actively learning, growing, and expanding my understanding",
    category: "Meta-Needs",
    needKey: "learning-growth",
    needLabel: "Learning & Growth",
    sectionOrder: 22,
    vQuestionText: "How many hours per week do you invest in learning/growth?",
    qQuestionText: "How satisfied are you with the quality of your learning efforts?",
  },
  {
    questionText: "I seek truth and understanding in areas that matter to me",
    category: "Meta-Needs",
    needKey: "truth",
    needLabel: "Truth & Understanding",
    sectionOrder: 23,
    vQuestionText: "How often do you explore topics to deepen your understanding?",
    qQuestionText: "How satisfied are you with the depth/quality of that exploration?",
  },
  {
    questionText: "I'm curious about life and enjoy exploring new ideas",
    category: "Meta-Needs",
    needKey: "curiosity",
    needLabel: "Curiosity",
    sectionOrder: 24,
    vQuestionText: "How often do you pursue new ideas or experiences each week?",
    qQuestionText: "How would you rate the quality of your curiosity and exploration?",
  },
  {
    questionText: "I notice, appreciate, and create beauty in my life",
    category: "Meta-Needs",
    needKey: "beauty",
    needLabel: "Beauty",
    sectionOrder: 25,
    vQuestionText: "How often do you engage in activities that involve beauty or aesthetics?",
    qQuestionText: "How satisfied are you with the quality of beauty in your life?",
  },
  {
    questionText: "I express myself creatively in some form",
    category: "Meta-Needs",
    needKey: "creativity",
    needLabel: "Creativity",
    sectionOrder: 26,
    vQuestionText: "How often do you engage in creative expression each week?",
    qQuestionText: "How satisfied are you with the quality of your creative output?",
  },
  {
    questionText: "I express my authentic self rather than a false persona",
    category: "Meta-Needs",
    needKey: "authenticity",
    needLabel: "Authenticity",
    sectionOrder: 27,
    vQuestionText: "How often do you feel free to show your authentic self?",
    qQuestionText: "How would you rate the quality of your authenticity day-to-day?",
  },
  {
    questionText: "I'm expressing my best self and highest qualities regularly",
    category: "Meta-Needs",
    needKey: "best-self",
    needLabel: "Best Self",
    sectionOrder: 28,
    vQuestionText: "How often do you show up as your best self each week?",
    qQuestionText: "How satisfied are you with the quality of expressing your best self?",
  },
  {
    questionText: "I'm using and developing my unique talents and gifts",
    category: "Meta-Needs",
    needKey: "talents",
    needLabel: "Talents & Gifts",
    sectionOrder: 29,
    vQuestionText: "How often do you intentionally develop your talents?",
    qQuestionText: "How satisfied are you with the quality of using your talents?",
  },
  {
    questionText: "I'm actively choosing my own path rather than just following others",
    category: "Meta-Needs",
    needKey: "autonomy",
    needLabel: "Autonomy",
    sectionOrder: 30,
    vQuestionText: "How often do you make independent choices about your direction?",
    qQuestionText: "How satisfied are you with the quality of your autonomy?",
  },
  {
    questionText: "I have a clear sense of purpose that guides my decisions",
    category: "Meta-Needs",
    needKey: "purpose",
    needLabel: "Purpose",
    sectionOrder: 31,
    vQuestionText: "How often do you revisit or act on your sense of purpose?",
    qQuestionText: "How clear and strong is the quality of your purpose?",
  },
  {
    questionText: "I'm living aligned with my highest values and principles",
    category: "Meta-Needs",
    needKey: "values-alignment",
    needLabel: "Values Alignment",
    sectionOrder: 32,
    vQuestionText: "How often do you check decisions against your values?",
    qQuestionText: "How satisfied are you with the quality of your values alignment?",
  },
  {
    questionText: "I'm making a meaningful contribution to something beyond myself",
    category: "Meta-Needs",
    needKey: "contribution",
    needLabel: "Contribution",
    sectionOrder: 33,
    vQuestionText: "How often do you contribute to causes beyond yourself?",
    qQuestionText: "How would you rate the quality/impact of your contributions?",
  },
  {
    questionText: "My life and work have positive impact on others or the world",
    category: "Meta-Needs",
    needKey: "impact",
    needLabel: "Impact",
    sectionOrder: 34,
    vQuestionText: "How often do you see evidence of positive impact from your work/life?",
    qQuestionText: "How satisfied are you with the quality of your impact?",
  },
  {
    questionText: "I regularly serve or help others in ways that matter",
    category: "Meta-Needs",
    needKey: "service",
    needLabel: "Service",
    sectionOrder: 35,
    vQuestionText: "How often do you serve or help others each week?",
    qQuestionText: "How would you rate the quality/meaningfulness of that service?",
  },
  {
    questionText: "I care deeply about and extend myself for others' wellbeing",
    category: "Meta-Needs",
    needKey: "compassion",
    needLabel: "Compassion",
    sectionOrder: 36,
    vQuestionText: "How often do you take action for others' wellbeing?",
    qQuestionText: "How satisfied are you with the quality of your compassion in action?",
  },
  {
    questionText: "I'm generous with my time, attention, resources, and love",
    category: "Meta-Needs",
    needKey: "generosity",
    needLabel: "Generosity",
    sectionOrder: 37,
    vQuestionText: "How often do you give time/attention/resources to others?",
    qQuestionText: "How would you rate the quality of your generosity?",
  },
  {
    questionText: "I regularly experience moments of flow, peak performance, or transcendence",
    category: "Meta-Needs",
    needKey: "flow",
    needLabel: "Flow & Peak",
    sectionOrder: 38,
    vQuestionText: "How often do you enter flow or peak performance states?",
    qQuestionText: "How would you rate the quality of those flow/peak experiences?",
  },
  {
    questionText: "My life feels deeply meaningful and purposeful",
    category: "Meta-Needs",
    needKey: "meaning",
    needLabel: "Meaning",
    sectionOrder: 39,
    vQuestionText: "How often do you feel a deep sense of meaning in your week?",
    qQuestionText: "How strong is the quality of meaning in your life?",
  },
  {
    questionText: "I'm becoming the person I'm capable of being; I'm actualizing my potential",
    category: "Meta-Needs",
    needKey: "self-actualization",
    needLabel: "Self-Actualization",
    sectionOrder: 40,
    vQuestionText: "How often do you take steps toward your potential each week?",
    qQuestionText: "How satisfied are you with the quality of your self-actualization?",
  },
];

async function connect() {
  console.log("🟡 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");
}

async function seed() {
  for (const base of BASE_QUESTIONS) {
    const {
      questionText,
      category,
      needKey,
      needLabel,
      sectionOrder,
      vQuestionText,
      qQuestionText,
    } = base;

    // Upsert parent (regular) question
    const parent = await Question.findOneAndUpdate(
      { questionText },
      {
        questionText,
        category,
        answerOptions: [
          "1 - Not at all true",
          "2 - Rarely true",
          "3 - Sometimes true",
          "4 - Often true",
          "5 - Usually true",
          "6 - Almost always true",
          "7 - Completely true",
        ],
        correctAnswer: null,
        pointValue: 0,
        questionType: "Multiple Choice - Horizontal",
        section: 1,
        sectionType: "regular",
        parentQuestionId: null,
        sectionOrder,
        needKey,
        needLabel,
        needOrder: sectionOrder,
        isActive: true,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const commonChildFields = {
      category,
      answerOptions: parent.answerOptions,
      correctAnswer: null,
      pointValue: 0,
      questionType: "Multiple Choice - Horizontal",
      parentQuestionId: parent._id,
      sectionOrder,
      needKey,
      needLabel,
      needOrder: sectionOrder,
      isActive: true,
    };

    // Upsert V question
    await Question.findOneAndUpdate(
      { parentQuestionId: parent._id, sectionType: "V" },
      {
        ...commonChildFields,
        section: 2,
        sectionType: "V",
        questionText: vQuestionText,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Upsert Q question
    await Question.findOneAndUpdate(
      { parentQuestionId: parent._id, sectionType: "Q" },
      {
        ...commonChildFields,
        section: 3,
        sectionType: "Q",
        questionText: qQuestionText,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`✅ Seeded/updated ${BASE_QUESTIONS.length} parent questions with V/Q children`);
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

