/**
 * Adds the Sex question to the database and creates learning articles for Sleep and Sex.
 * 
 * This script:
 * 1. Creates the Sex question in the database (if it doesn't exist)
 * 2. Updates it with Quality/Volume sub-questions
 * 3. Creates learning article for Sleep (if it doesn't exist)
 * 4. Creates learning article for Sex (if it doesn't exist)
 * 
 * Usage:
 *   node scripts/addSexQuestionAndArticles.js
 * 
 * Requires MONGO_URI in environment.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "../src/models/Questions.js";
import QuestionLearning from "../src/models/QuestionLearning.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ma7260712_db_user:jVOzoHihPmoxdITQ@cluster0.psuigku.mongodb.net/?appName=Cluster0";

// Sex question data
const SEX_QUESTION = {
  questionText: "My sexual life is healthy and fulfilling",
  category: "Survival",
  needKey: "sex",
  needLabel: "Sex",
  sectionOrder: 8, // After exercise, before money
  qualitySubQuestion: {
    questionText: "How would you rate the quality of your sexual well-being?",
    ratingOptions: [
      "1 = Severely troubled (major dysfunction/distress)",
      "2 = Very poor (significant dissatisfaction)",
      "3 = Poor (frustrating, unfulfilling)",
      "4 = Fair (acceptable but not satisfying)",
      "5 = Good (satisfying and healthy)",
      "6 = Very good (fulfilling and pleasurable)",
      "7 = Excellent (deeply fulfilling and joyful)"
    ]
  },
  volumeSubQuestion: {
    questionText: "How well are your sexual needs being met? (frequency relative to your needs)",
    ratingOptions: [
      "1 = Completely unmet (severe deprivation)",
      "2 = Mostly unmet (significant gap)",
      "3 = Often unmet (frequent frustration)",
      "4 = Sometimes unmet (moderate gap)",
      "5 = Usually met (occasional gap)",
      "6 = Well met (rarely wanting)",
      "7 = Fully met (completely satisfied)"
    ]
  }
};

// Sleep article content
const SLEEP_ARTICLE = {
  title: "UNLEASHING YOUR SLEEP POTENTIAL",
  subtitle: "A Strategy for Peaceful and Rejuvenating Sleep",
  author: "Shawn Dwyer, ACMC",
  content: `Have you ever noticed how just a few nights of poor sleep can completely derail your life?

I'm writing this after watching and hearing from too many clients struggle with sleep- and after my own battles with restless nights. What I've discovered is that most of us are accidentally experts at preventing good sleep. We've mastered the art of sabotaging what should be a natural process.

Let me be direct: sleeping well is critical for maintaining vitality. It doesn't take many nights of tossing and turning before everything suffers. Your energy tanks. Your focus evaporates. Your memory becomes unreliable. Work quality declines. You experience those micro-sleeps during the day—those dangerous moments when you mentally check out. Small accidents happen. Big ones become possible.

## The Real Problem

Poor sleep and sleep deprivation for extended periods will undermine your physical health, mental well-being, and emotional vitality. None of this is good. So what can we do?

Using the NLP Communication Model, I've modelled both "not sleeping well" and "peaceful, rejuvenating sleep." What emerged was fascinating: we're actively creating our sleep problems through specific strategies. The good news? We can reverse-engineer the process.

## How We Sabotage Our Sleep

Here's the perfect recipe for terrible sleep:

Go to bed with too much on your mind. It could be "all the things I have to do"—even exciting, fun things. But more likely, go to bed stressed. Feel worn out mentally and emotionally. Worry and fret about everything. Be apprehensive about getting it all done. Stay up late and "burn the candle at both ends."

Want to amplify the problem? Jump into bed, rushing from staying up too late to suddenly being horizontal. Skip any transition time. Or if there is a transition, make sure it's chaotic. Watch some action-packed show that revs you up. Or watch the news, especially if you don't know how to watch it without it stressing you.

The absolute best way to create poor sleep? Go to bed distressed. Not just stressed—distressed. Go to bed fearful, intensely worried, angry, sad, or depressed. Take all your troubles to bed with you. That will guarantee a fitful sleep.

Sound familiar?

## The Three-Stage Sleep Strategy

Knowing how we mess up this natural process gives us insight into what we need to change. Here's what actually works:

### Stage 1: Prepare for Restful Sleep

Take time to slow things down. Create a ritual—or several rituals—that make a smooth transition from your day's activities to getting into bed.

What will you do to slow down? What preparations will you make in your home and bedroom?

If you have a lot left to do, get into the habit of writing your "to do list" for tomorrow. If you feel stressed, write down your stresses. Identify the triggers and your thinking about them. The very act of writing—as a neuro-muscular activity—helps you de-stress. Or perhaps talk it out with someone you trust.

### Stage 2: The Transition Stage

Having things prepared enables you to smoothly engage in your chosen rituals. Here are possibilities:

• A relaxing bath or shower
• Stretching or deep breathing
• Listening to slow, relaxing music
• Reading something for pleasure—poetry or a novel
• Having a glass of warm milk or tea
• Turning down the lights for the last 20 minutes
• Lighting candles
• Meditating or praying
• Releasing the tensions of the day
• Taking an imaginary trip to a quiet place in your mind

Choose what resonates with you. The key is consistency.

### Stage 3: Into Bed You Go

Here's something crucial: link and anchor your bed to sleep and lovemaking only. Don't read in bed. Don't do homework or projects in bed. Keep the bed your space for sleeping so it cues you for rest.

Set a thought in your mind: "I wonder what I'll dream about tonight..."

Then let it go. "My creative unconscious will handle that. I don't have to know."

## Your Inner Game of Sleep

All of that addresses the behavioral level—your actions, environment, immediate thoughts and emotions. Now let's go meta. Let's explore your Inner Game of Sleep: the beliefs, decisions, understandings, and permissions that drive everything else.

**What do you believe about sleep?**

Is it a waste of time? Or is it your time to rejuvenate in mind and body? Try this belief on: "Restful sleep is the source of my energy and vitality."

**What do you believe about time?**

That you don't have enough? Or can you tell yourself: "I'll take care of things tomorrow. There are wonderful things to do in the coming days. No need to rush."

Consider this empowering belief: "Sleeping is essential for integrating my learnings."

**What do you believe about dreaming?**

I like this frame: "I commission my creative unconscious to delight me with dreams that will make me a better and more resourceful person." And here's the relief—you don't have to remember the dreams for them to work.

**What do you believe about achievements and work? About people calling late at night?** Your beliefs about these things directly impact your ability to release the day and embrace rest.

## Your Sleep Checklist

Here's how to know if you're implementing this strategy effectively:

**Preparation (30 minutes before bed):**
☐ I take time to slow down
☐ I have developed at least one transition ritual
☐ I write a "to do" list for tomorrow
☐ I do breathing and stretching exercises
☐ I mentally inventory things accomplished today

**Transition Activities (choose what works):**
☐ Relaxing bath or shower
☐ Slow, relaxing music
☐ Reading for pleasure
☐ Warm milk or tea
☐ Dimmed lights for last 20 minutes
☐ Candles
☐ Meditation or prayer
☐ Releasing tensions
☐ Imaginary quiet place visualization

**Into Bed:**
☐ I set the thought: "I wonder what I'll dream about tonight..."
☐ I mentally let things go
☐ I use a releasing pattern

**Enhancing Beliefs (install these):**
☐ "Restful sleep is the source of my energy and vitality."
☐ "I have plenty of time to do the things that are important."
☐ "I can and will take care of unfinished things tomorrow."
☐ "There are wonderful things to do in the coming days."
☐ "There is no need to rush."
☐ "Sleeping is essential for integrating my learnings."

## The Bottom Line

Sleep doesn't have to be a struggle. By understanding the structure of both poor sleep and rejuvenating sleep, you can consciously shift from one to the other.

Start tonight. Pick one transition ritual. Install one empowering belief. Notice what changes. Your vitality depends on it.

---

**Author:** Shawn Dwyer, Licensed Meta-Coach ACMC

Shawn Dwyer, is an Associate Certified Meta-Coach and International Licensed Trainer in Neuro Semantics and Meta-NLP. He lives in regional NSW and provides internationally accredited coaching and training programs in Neuro-Semantics. Shawn is the Regional Director of The Meta-Coach Foundation in Australia. He is also the International Vice-President of Meta-Coaching Foundation.

**Contact:**
Ph: 0439194323
Email: shawn@thecoachingcentre.com.au
Website: www.thecoachingcentre.com.au`
};

// Sex article content
const SEX_ARTICLE = {
  title: "SEX ISN'T WHAT YOU THINK IT IS",
  subtitle: "Why Understanding Your Real Needs Changes Everything",
  author: "Shawn Dwyer, ACMC",
  content: `Why do so many of us feel frustrated, confused, or disappointed about our sex lives?

I've spent years coaching people through relationship struggles, and I keep seeing the same pattern: we're asking sex to solve problems it wasn't designed to solve. We've turned it into the primary answer for needs that require multiple sources of fulfillment. And then we wonder why we feel empty, disconnected, or endlessly unsatisfied.

Let me share what I've discovered—and what research confirms—about what's really happening when we pursue sex.

## The Fundamental Distinction

A critical insight that changes how we think about sexuality: sex functions more as a psychological and social strategy than as a pure survival need.

I know that might sound counterintuitive. We often hear sex described as a "basic need" alongside food, water, and sleep. But there's an important distinction: while you will die without food, water, or sleep, you won't die from sexual abstinence. Celibate people and asexual individuals can live full, healthy lives.

This doesn't mean sex is unimportant—far from it. Research shows that sexual activity correlates with better cardiovascular health, stress reduction, immune function, and relationship satisfaction. For most people, sexuality is deeply connected to overall well-being.

**The key:** the primary function of sex for humans has evolved beyond reproduction into a complex strategy for meeting psychological and social needs. Understanding this distinction changes everything about how we approach our sexual lives.

## What We Actually Need

Decades of psychological research have identified fundamental psychological needs that must be met for mental health and stability. While different frameworks exist, most converge on needs like these:

**Security**—We need to feel safe, stable, and protected in our world.

**Self-esteem**—We need to feel valuable, competent, and worthy of respect.

**Autonomy**—We need to feel in control of our own choices and direction.

**Connection**—We need to feel bonded with other human beings.

When these needs go unmet for extended periods, we suffer—sometimes severely. Research consistently shows that chronic loneliness and social isolation increase mortality risk more than obesity, alcoholism, or smoking 15 cigarettes a day. Prolonged lack of esteem or autonomy correlates with depression, anxiety, and even suicidal ideation.

These psychological needs are not optional luxuries—they're essential for human flourishing.

## Sex as Strategy

Where this gets interesting: we use various activities and relationships as strategies to meet our psychological needs.

Sports fulfill needs for connection (team belonging) and esteem (achievement). A healthy family provides connection, esteem, and security. Learning a skill fulfills autonomy and esteem. Meaningful work provides purpose, esteem, and sometimes security.

Sex serves as a powerful, multifaceted strategy that humans have evolved to use for meeting psychological needs—particularly connection and esteem. The neurochemistry of sex (oxytocin, dopamine, endorphins) directly supports bonding, pleasure, and feelings of wellbeing. Sexual satisfaction within relationships correlates strongly with relationship quality and life satisfaction.

**The critical point:** when sex becomes your primary or only strategy for meeting fundamental psychological needs, dysfunction follows.

Why? Because over-reliance on any single strategy creates fragility. If sex is your only source of feeling valued, losing access to it becomes catastrophic. If it's your only path to connection, you become desperate and clingy. The very neediness undermines your ability to attract and maintain healthy sexual relationships.

## Where We Get It Wrong

Research suggests that people often pursue sex to satisfy different psychological needs—and these patterns sometimes correlate with gender, though individual variation is enormous and cultural context matters tremendously.

Some research indicates that:

Many women (though certainly not all) report seeking sex primarily as an expression of emotional intimacy and connection. Historical factors—including economic dependence on men and cultural suppression of female sexuality—have shaped these patterns. Women who internalised shame around sexuality may feel conflict between sexual desire and self-esteem needs.

Many men (though certainly not all) report experiencing social pressure to use sexual success as a marker of status and masculine identity. Cultural conditioning often teaches men to pursue sex as validation of worth and competence.

**What's crucial:** these are learned patterns influenced by culture, not hardwired biological imperatives. Plenty of women pursue sex for physical pleasure and autonomy. Plenty of men seek sex primarily for emotional connection. The stereotypes don't capture the full range of human sexuality.

The real problem emerges when we assume others share our motivations. Someone seeking connection becomes frustrated with a partner seeking validation. Someone seeking autonomy feels smotered by a partner seeking security. We project our own needs onto others and then judge them for not meeting expectations they never agreed to.

## The Neediness Trap

### The Self-Defeating Cycle

What I consistently observe in my coaching practice: pursuing sex primarily to compensate for unmet psychological needs leads to unattractive, dysfunctional behaviour patterns.

When you chase sex from desperation—trying to fill a void that sex alone cannot fill—you create a self-defeating cycle:

• Seeking esteem through sexual conquest makes you approval-dependent and manipulative
• Seeking security through sexual relationships makes you clingy and controlling
• Seeking connection exclusively through sex makes you emotionally overwhelming

### The Paradox

The paradox is brutal: the very neediness that drives you toward sex repels the connection you're desperately seeking. Your hunger for validation reads as manipulation. Your need for security feels like control. The harder you grasp, the faster people pull away.

I once worked with a man—let's call him James—who was averaging three different sexual partners per week but felt emptier after each encounter. Successful career, good-looking, charming. Yet completely hollowed out inside.

When we explored what he was really seeking, he realised he was trying to prove his worth through sexual conquest. Each new partner was supposed to be evidence that he mattered, that he was desirable, that he was enough. But the validation never stuck. By the next morning, the doubt crept back in.

The sex wasn't the problem. His complete absence of genuine self-esteem was.

Once James started building that independently—through meaningful work he actually cared about, honest friendships where he could be vulnerable, therapy to address childhood wounds—his entire relationship to sex transformed. He went from desperate validation-seeking to actually enjoying intimate connection. Six months later, he was in his first healthy relationship in years.

## The Solution

The solution isn't to eliminate sex as a strategy—it's to develop multiple robust sources for meeting your psychological needs. When you have:

• Genuine friendships that provide connection
• Meaningful work that provides esteem and autonomy
• Healthy family relationships that provide security
• Personal development that builds self-worth

...then you can pursue sexual relationships from abundance rather than scarcity. You become attractive because you're already fulfilled, not desperately seeking fulfillment.

## Why Sex Feels Emotional

If sex is primarily a strategy rather than a survival need, why does it carry such intense emotional weight?

Because evolution has intricately woven together our sexual drive with our attachment systems and psychological needs. This isn't accidental—it's adaptive.

Humans have evolved sophisticated attachment systems. When we have sex, especially repeated sex with the same partner, neurochemical changes occur:

• Oxytocin increases (the "bonding hormone")
• Dopamine activates reward pathways
• In men, testosterone temporarily drops (reducing mate-seeking)
• Prefrontal cortex activity changes (affecting decision-making)

These processes facilitate pair-bonding—they get us "drunk on love" long enough to create stable partnerships for raising children who require years of intensive care.

This means sex is inherently an emotional and psychological experience for most humans, not merely a physical act. That's why trying to separate sex from emotion, fights against deep evolutionary wiring.

Therefore:

• Even emotionally detached players eventually experience unexpected attachment
• Casual sex often becomes complicated when feelings develop
• Pornography use can feel hollow (physical release without psychological fulfillment)
• Sexual satisfaction correlates so strongly with relationship satisfaction

## The Real Questions

What I want you to honestly explore:

**What psychological need am I primarily trying to meet through sex?**
• Security? Self-esteem? Connection? Autonomy? Some combination?

**Am I meeting that need through multiple healthy sources?**
• Or is sex my only strategy for feeling valuable/connected/secure?

**What would happen if I developed that need independently first?**
• How would my relationship to sex change if I already felt worthy, connected, and secure?

**Am I projecting my needs onto my partner and judging them for different motivations?**
• Can I understand their needs without requiring them to be identical to mine?

## The Path Forward

Understanding this doesn't diminish sexuality—it enriches it by freeing sex from impossible expectations. The goal isn't removing emotion; it's developing enough psychological security that sex becomes what it's meant to be: a powerful expression of connection between people who already feel whole.

When you meet your psychological needs through diverse, healthy sources, sexuality transforms:

**From → To**
• Desperate compensation → Authentic expression
• Manipulation and neediness → Genuine connection
• Devastation at rejection → Resilient self-worth
• Defensive communication → Open dialogue
• Trying to create fulfillment → Enhancing existing fulfillment

When you stop using sex to fill voids and start expressing from fullness, everything shifts. You stop using people. You stop feeling used. You build genuine intimacy. You develop real self-esteem. You create actual security in your life.

That's when sexuality becomes what it was always meant to be: not a question you ask of others, but an answer you express from within.

---

**Author:** Shawn Dwyer is an Associate Certified Meta-Coach based in NSW, Australia`
};

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

async function addSexQuestion() {
  console.log("\n📝 Adding Sex question to database...\n");

  try {
    // Check if question already exists
    const existing = await Question.findOne({
      questionText: SEX_QUESTION.questionText,
      category: "Survival",
      sectionType: "regular",
      section: 1,
    });

    if (existing) {
      console.log("⚠️  Sex question already exists. Updating with Quality/Volume sub-questions...");
      
      existing.qualitySubQuestion = SEX_QUESTION.qualitySubQuestion;
      existing.volumeSubQuestion = SEX_QUESTION.volumeSubQuestion;
      existing.needKey = SEX_QUESTION.needKey;
      existing.needLabel = SEX_QUESTION.needLabel;
      existing.sectionOrder = SEX_QUESTION.sectionOrder;
      existing.needOrder = SEX_QUESTION.sectionOrder;
      
      await existing.save();
      console.log("✅ Sex question updated successfully");
      return existing;
    } else {
      // Create new question
      const question = await Question.create({
        questionText: SEX_QUESTION.questionText,
        answerOptions: [
          "1 - Not at all true",
          "2 - Rarely true",
          "3 - Sometimes true",
          "4 - Often true",
          "5 - Usually true",
          "6 - Almost always true",
          "7 - Completely true"
        ],
        correctAnswer: null,
        pointValue: 0,
        category: SEX_QUESTION.category,
        questionType: "Multiple Choice - Horizontal",
        section: 1,
        sectionType: "regular",
        parentQuestionId: null,
        sectionOrder: SEX_QUESTION.sectionOrder,
        needKey: SEX_QUESTION.needKey,
        needLabel: SEX_QUESTION.needLabel,
        needOrder: SEX_QUESTION.sectionOrder,
        isActive: true,
        qualitySubQuestion: SEX_QUESTION.qualitySubQuestion,
        volumeSubQuestion: SEX_QUESTION.volumeSubQuestion,
      });

      console.log("✅ Sex question created successfully");
      return question;
    }
  } catch (err) {
    console.error("❌ Error adding sex question:", err);
    throw err;
  }
}

async function addSleepArticle(sleepQuestion) {
  console.log("\n📚 Adding Sleep article to library...\n");

  try {
    // Check if article already exists
    const existing = await QuestionLearning.findOne({
      questionId: sleepQuestion._id,
    });

    if (existing) {
      console.log("⚠️  Sleep article already exists. Updating...");
      existing.title = SLEEP_ARTICLE.title;
      existing.content = SLEEP_ARTICLE.content;
      existing.learningType = "health";
      existing.readTimeMinutes = 8; // Estimated read time
      existing.isActive = true;
      await existing.save();
      console.log("✅ Sleep article updated successfully");
      return existing;
    } else {
      const article = await QuestionLearning.create({
        questionId: sleepQuestion._id,
        title: SLEEP_ARTICLE.title,
        content: SLEEP_ARTICLE.content,
        learningType: "health",
        readTimeMinutes: 8,
        isActive: true,
      });

      console.log("✅ Sleep article created successfully");
      return article;
    }
  } catch (err) {
    console.error("❌ Error adding sleep article:", err);
    throw err;
  }
}

async function addSexArticle(sexQuestion) {
  console.log("\n📚 Adding Sex article to library...\n");

  try {
    // Check if article already exists
    const existing = await QuestionLearning.findOne({
      questionId: sexQuestion._id,
    });

    if (existing) {
      console.log("⚠️  Sex article already exists. Updating...");
      existing.title = SEX_ARTICLE.title;
      existing.content = SEX_ARTICLE.content;
      existing.learningType = "health";
      existing.readTimeMinutes = 10; // Estimated read time
      existing.isActive = true;
      await existing.save();
      console.log("✅ Sex article updated successfully");
      return existing;
    } else {
      const article = await QuestionLearning.create({
        questionId: sexQuestion._id,
        title: SEX_ARTICLE.title,
        content: SEX_ARTICLE.content,
        learningType: "health",
        readTimeMinutes: 10,
        isActive: true,
      });

      console.log("✅ Sex article created successfully");
      return article;
    }
  } catch (err) {
    console.error("❌ Error adding sex article:", err);
    throw err;
  }
}

async function run() {
  try {
    await connect();

    // Step 1: Find or create sleep question
    const sleepQuestion = await Question.findOne({
      needKey: "sleep",
      category: "Survival",
      sectionType: "regular",
      section: 1,
    });

    if (!sleepQuestion) {
      console.error("❌ Sleep question not found! Please run updateQualityVolumeSubQuestions.js first.");
      process.exit(1);
    }

    console.log("✅ Found sleep question:", sleepQuestion.questionText);

    // Step 2: Add sex question
    const sexQuestion = await addSexQuestion();

    // Step 3: Add sleep article
    await addSleepArticle(sleepQuestion);

    // Step 4: Add sex article
    await addSexArticle(sexQuestion);

    console.log("\n" + "=".repeat(60));
    console.log("🎉 ALL TASKS COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("✅ Sex question added/updated");
    console.log("✅ Sleep article added/updated");
    console.log("✅ Sex article added/updated");
    console.log("=".repeat(60));

  } catch (err) {
    console.error("❌ Script error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔒 MongoDB connection closed");
  }
}

run();

