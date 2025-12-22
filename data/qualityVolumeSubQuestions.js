/**
 * Quality and Volume Sub-Questions Mapping
 * 
 * This file contains all 41 main questions with their customized
 * Quality and Volume sub-questions and rating options as per the
 * "Daily Life Quality Monitoring Instructions" document.
 * 
 * Each question has:
 * - mainQuestionText: The existing main question text
 * - qualitySubQuestion: Quality sub-question text and custom rating options
 * - volumeSubQuestion: Volume sub-question text and custom rating options
 */

export const QUALITY_VOLUME_SUB_QUESTIONS = [
  // ==================== SURVIVAL NEEDS (10 questions) ====================
  
  // 1. Sleep
  {
    mainQuestionText: "I get 7-8 hours of quality, restorative sleep most nights",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of your sleep last night?",
      ratingOptions: [
        "1 = Extremely poor (restless, frequently waking, unrefreshing)",
        "2 = Very poor (significant disruption, feeling exhausted)",
        "3 = Poor (some disruption, tired upon waking)",
        "4 = Below average (moderate quality, somewhat rested)",
        "5 = Average (decent sleep, adequately rested)",
        "6 = Good (solid sleep, feeling refreshed)",
        "7 = Excellent (deep, restorative sleep, energized upon waking)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many hours of sleep did you get last night?",
      ratingOptions: [
        "1 = Less than 4 hours",
        "2 = 4-5 hours",
        "3 = 5-6 hours",
        "4 = 6-7 hours",
        "5 = 7-8 hours",
        "6 = 8-9 hours",
        "7 = 9+ hours"
      ]
    }
  },

  // 2. Food/Nutrition
  {
    mainQuestionText: "I eat nutritious, whole foods that fuel my body well",
    qualitySubQuestion: {
      questionText: "How would you rate the nutritional quality of what you ate yesterday?",
      ratingOptions: [
        "1 = Extremely poor (all junk food, highly processed)",
        "2 = Very poor (mostly unhealthy choices)",
        "3 = Poor (more unhealthy than healthy)",
        "4 = Below average (some nutritious foods mixed with junk)",
        "5 = Average (balanced but could be better)",
        "6 = Good (mostly whole, nutritious foods)",
        "7 = Excellent (entirely whole, nutrient-dense foods)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How much did you eat yesterday relative to your body's needs?",
      ratingOptions: [
        "1 = Severely insufficient (skipped multiple meals)",
        "2 = Very insufficient (only one small meal)",
        "3 = Insufficient (ate less than needed)",
        "4 = Slightly insufficient (almost enough)",
        "5 = Appropriate amount (just right for your needs)",
        "6 = Slightly excessive (a bit more than needed)",
        "7 = Excessive (significantly overate)"
      ]
    }
  },

  // 3. Weight Management
  {
    mainQuestionText: "My body feels healthy, strong, and capable",
    qualitySubQuestion: {
      questionText: "How would you rate the healthiness of your current weight?",
      ratingOptions: [
        "1 = Severely unhealthy (medical risk level)",
        "2 = Very unhealthy (significant concern)",
        "3 = Unhealthy (needs attention)",
        "4 = Slightly below/above healthy range",
        "5 = Within healthy range but not optimal",
        "6 = Healthy and comfortable weight",
        "7 = Optimal healthy weight for my body"
      ]
    },
    volumeSubQuestion: {
      questionText: "How much is your weight impacting your daily functioning?",
      ratingOptions: [
        "1 = Severe daily impairment (constant struggle)",
        "2 = Major impairment (frequent difficulties)",
        "3 = Moderate impairment (regular challenges)",
        "4 = Some impairment (occasional difficulties)",
        "5 = Minimal impairment (rarely an issue)",
        "6 = Very minimal impact (almost never a concern)",
        "7 = No impairment (weight fully supports function)"
      ]
    }
  },

  // 4. Relaxation
  {
    mainQuestionText: "I have sufficient physical energy to do what matters to me",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of relaxation you experienced yesterday?",
      ratingOptions: [
        "1 = No relaxation (constant tension/stress)",
        "2 = Very poor relaxation (barely unwound)",
        "3 = Poor relaxation (still felt tense)",
        "4 = Moderate relaxation (some relief)",
        "5 = Good relaxation (genuinely unwound)",
        "6 = Deep relaxation (fully recharged)",
        "7 = Profound relaxation (completely rejuvenated)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How much time yesterday did you spend in genuine relaxation?",
      ratingOptions: [
        "1 = 0 minutes",
        "2 = 1-15 minutes",
        "3 = 15-30 minutes",
        "4 = 30-60 minutes",
        "5 = 1-2 hours",
        "6 = 2-3 hours",
        "7 = 3+ hours"
      ]
    }
  },

  // 5. Health
  {
    mainQuestionText: "I take care of my body and my overall health is good",
    qualitySubQuestion: {
      questionText: "How would you rate your overall health state yesterday?",
      ratingOptions: [
        "1 = Severely ill (unable to function)",
        "2 = Very poor health (major symptoms/pain)",
        "3 = Poor health (frequent discomfort)",
        "4 = Fair health (some issues present)",
        "5 = Good health (generally well)",
        "6 = Very good health (energetic and well)",
        "7 = Excellent health (thriving, vibrant)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many hours yesterday were you free from physical discomfort or symptoms?",
      ratingOptions: [
        "1 = 0-2 hours (constant discomfort)",
        "2 = 2-4 hours",
        "3 = 4-8 hours",
        "4 = 8-12 hours",
        "5 = 12-16 hours",
        "6 = 16-20 hours",
        "7 = All waking hours (no discomfort)"
      ]
    }
  },

  // 6. Vitality
  {
    mainQuestionText: "I exercise regularly (3+ times/week) and feel physically vital",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of your vitality/life force yesterday?",
      ratingOptions: [
        "1 = Completely depleted (no life force)",
        "2 = Severely depleted (barely functioning)",
        "3 = Low vitality (sluggish, drained)",
        "4 = Moderate vitality (getting by)",
        "5 = Good vitality (energized)",
        "6 = Strong vitality (vibrant, alive)",
        "7 = Extraordinary vitality (overflowing with life)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many hours yesterday did you feel truly alive and vital?",
      ratingOptions: [
        "1 = 0 hours",
        "2 = 1-2 hours",
        "3 = 2-4 hours",
        "4 = 4-6 hours",
        "5 = 6-8 hours",
        "6 = 8-12 hours",
        "7 = All waking hours"
      ]
    }
  },

  // 7. Exercise
  {
    mainQuestionText: "I exercise regularly (3+ times/week) and feel physically vital",
    qualitySubQuestion: {
      questionText: "How would you rate the quality/intensity of your physical activity yesterday?",
      ratingOptions: [
        "1 = None (completely sedentary)",
        "2 = Minimal (only necessary movement)",
        "3 = Light (easy walking, stretching)",
        "4 = Moderate (brisk walking, light exercise)",
        "5 = Good (sustained moderate activity)",
        "6 = Vigorous (challenging workout, elevated heart rate)",
        "7 = Excellent (intense, comprehensive workout)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How much time did you spend in physical activity yesterday?",
      ratingOptions: [
        "1 = 0 minutes",
        "2 = 1-10 minutes",
        "3 = 10-20 minutes",
        "4 = 20-30 minutes",
        "5 = 30-45 minutes",
        "6 = 45-60 minutes",
        "7 = 60+ minutes"
      ]
    }
  },

  // 8. Sex
  {
    mainQuestionText: "My sexual life is healthy and fulfilling",
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
  },

  // 9. Money
  {
    mainQuestionText: "I have sufficient money to meet my basic needs without constant stress",
    qualitySubQuestion: {
      questionText: "How would you rate the quality/stability of your financial situation?",
      ratingOptions: [
        "1 = Crisis (can't meet basic needs)",
        "2 = Severe hardship (constant struggle)",
        "3 = Financial stress (frequent worry)",
        "4 = Tight but managing (some stress)",
        "5 = Adequate (needs met with buffer)",
        "6 = Comfortable (solid foundation)",
        "7 = Abundant (complete security)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How much of your basic needs can your income currently cover?",
      ratingOptions: [
        "1 = Less than 30% (crisis level)",
        "2 = 30-50% (severe shortage)",
        "3 = 50-70% (significant shortage)",
        "4 = 70-85% (minor shortage)",
        "5 = 85-100% (just meeting needs)",
        "6 = 100-120% (meeting needs + some extra)",
        "7 = 120%+ (meeting all needs + savings/extras)"
      ]
    }
  },

  // 10. Physical/Personal Safety
  {
    mainQuestionText: "I feel physically safe in my home and daily environment",
    qualitySubQuestion: {
      questionText: "How would you rate your sense of physical security yesterday?",
      ratingOptions: [
        "1 = Extremely unsafe (immediate threats present)",
        "2 = Very unsafe (significant fear for safety)",
        "3 = Unsafe (frequent worry about safety)",
        "4 = Somewhat unsafe (occasional concerns)",
        "5 = Adequately safe (generally secure)",
        "6 = Safe (confident in my security)",
        "7 = Completely safe (total peace of mind)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many hours yesterday did you feel completely free from safety concerns?",
      ratingOptions: [
        "1 = 0-2 hours",
        "2 = 2-4 hours",
        "3 = 4-8 hours",
        "4 = 8-12 hours",
        "5 = 12-16 hours",
        "6 = 16-20 hours",
        "7 = All waking hours"
      ]
    }
  },

  // ==================== SAFETY NEEDS (5 questions) ====================

  // 11. Career/Job Safety
  {
    mainQuestionText: "I feel secure about my financial situation and future",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of security in your employment?",
      ratingOptions: [
        "1 = Extremely insecure (imminent job loss)",
        "2 = Very insecure (high risk of loss)",
        "3 = Insecure (frequent worry about job)",
        "4 = Somewhat insecure (occasional concerns)",
        "5 = Adequately secure (generally stable)",
        "6 = Secure (confident in position)",
        "7 = Completely secure (guaranteed stability)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How much time yesterday did you spend worrying about job security?",
      ratingOptions: [
        "1 = Almost all waking hours",
        "2 = Most of the day (4+ hours)",
        "3 = Several hours (2-4 hours)",
        "4 = About an hour",
        "5 = Brief moments (under 30 min)",
        "6 = Barely thought about it (under 10 min)",
        "7 = Not at all (0 minutes)"
      ]
    }
  },

  // 12. Stability in Life
  {
    mainQuestionText: "My life has sufficient stability (I'm not in constant chaos or crisis)",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of stability in your life yesterday?",
      ratingOptions: [
        "1 = Complete chaos (no stability anywhere)",
        "2 = Severe instability (constant upheaval)",
        "3 = Unstable (frequent disruptions)",
        "4 = Somewhat unstable (regular changes)",
        "5 = Adequately stable (manageable predictability)",
        "6 = Stable (reliable patterns and structure)",
        "7 = Completely stable (secure foundation)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many areas of your life felt stable yesterday?",
      ratingOptions: [
        "1 = No areas (0/10)",
        "2 = Very few areas (1-2/10)",
        "3 = Few areas (3-4/10)",
        "4 = Some areas (5/10)",
        "5 = Most areas (6-7/10)",
        "6 = Nearly all areas (8-9/10)",
        "7 = All areas (10/10)"
      ]
    }
  },

  // 13. Sense of Order/Structure
  {
    mainQuestionText: "I have structure, order, and routine in my life that supports me",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of order/structure in your life yesterday?",
      ratingOptions: [
        "1 = Complete chaos (no organization)",
        "2 = Severe disorganization (barely functional)",
        "3 = Disorganized (struggling with structure)",
        "4 = Somewhat organized (basic structure)",
        "5 = Adequately organized (functional systems)",
        "6 = Well-organized (clear structures working)",
        "7 = Optimally organized (seamless flow)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many of your daily activities followed a structured routine yesterday?",
      ratingOptions: [
        "1 = None (complete randomness)",
        "2 = Very few (1-2 activities)",
        "3 = Few (3-4 activities)",
        "4 = Some (about half)",
        "5 = Most (6-7 activities)",
        "6 = Nearly all (8-9 activities)",
        "7 = All activities (complete structure)"
      ]
    }
  },

  // 14. Sense of Control/Personal Power/Efficacy
  {
    mainQuestionText: "I feel in control of my life circumstances and able to influence outcomes",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of your sense of control yesterday?",
      ratingOptions: [
        "1 = Completely powerless (total helplessness)",
        "2 = Very powerless (overwhelmed, no control)",
        "3 = Low control (frequently helpless)",
        "4 = Moderate control (some influence)",
        "5 = Good control (generally capable)",
        "6 = Strong control (confident in my power)",
        "7 = Complete mastery (full self-efficacy)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many situations yesterday did you handle with a sense of control?",
      ratingOptions: [
        "1 = None (helpless in all situations)",
        "2 = Very few (1-2 situations)",
        "3 = Few (2-3 situations)",
        "4 = Some (about half)",
        "5 = Most (more than half)",
        "6 = Nearly all (1-2 lapses only)",
        "7 = All situations (complete efficacy)"
      ]
    }
  },

  // 15. My life is not in constant chaos or crisis
  {
    mainQuestionText: "My life has sufficient stability (I'm not in constant chaos or crisis)",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of peace/non-crisis in your life yesterday?",
      ratingOptions: [
        "1 = Constant crisis (multiple emergencies)",
        "2 = Severe crisis (major emergency present)",
        "3 = Frequent crisis (regular emergencies)",
        "4 = Occasional crisis (some emergencies)",
        "5 = Rare crisis (mostly peaceful)",
        "6 = Very peaceful (crisis is unusual)",
        "7 = Completely peaceful (no crisis at all)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many crisis situations did you face yesterday?",
      ratingOptions: [
        "1 = 5+ crises",
        "2 = 3-4 crises",
        "3 = 2 crises",
        "4 = 1 crisis",
        "5 = Minor issue but no crisis",
        "6 = Very minor disturbance only",
        "7 = No crises or disturbances"
      ]
    }
  },

  // ==================== SOCIAL NEEDS (5 questions) ====================

  // 16. Social Connection: Friends/Companions
  {
    mainQuestionText: "I have friends/companions I enjoy spending time with regularly",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of your friendships as experienced yesterday?",
      ratingOptions: [
        "1 = No friendship connection at all",
        "2 = Very poor (strained or unfulfilling)",
        "3 = Poor (disappointing interactions)",
        "4 = Fair (okay but not enriching)",
        "5 = Good (enjoyable, supportive)",
        "6 = Excellent (energizing, uplifting)",
        "7 = Exceptional (deeply fulfilling and joyful)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many friends did you meaningfully connect with yesterday?",
      ratingOptions: [
        "1 = None",
        "2 = Thought about friends but no contact",
        "3 = 1 friend (brief contact)",
        "4 = 1 friend (substantial contact)",
        "5 = 2 friends",
        "6 = 3-4 friends",
        "7 = 5+ friends"
      ]
    }
  },

  // 17. Love/Affection
  {
    mainQuestionText: "I give and receive love, affection, and care in my relationships",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of love/affection you experienced yesterday?",
      ratingOptions: [
        "1 = None (felt completely unloved)",
        "2 = Very little (minimal warmth)",
        "3 = Limited (some affection but not enough)",
        "4 = Moderate (adequate but not fulfilling)",
        "5 = Good (satisfying expressions of love)",
        "6 = Rich (abundant, heartfelt affection)",
        "7 = Overflowing (deeply nourishing love)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many loving/affectionate interactions did you have yesterday?",
      ratingOptions: [
        "1 = 0 interactions",
        "2 = 1 interaction",
        "3 = 2-3 interactions",
        "4 = 3-5 interactions",
        "5 = 5-7 interactions",
        "6 = 7-10 interactions",
        "7 = 10+ interactions"
      ]
    }
  },

  // 18. Bonding with Partner/Lover (Intimacy)
  {
    mainQuestionText: "I have at least one relationship of deep trust and intimacy",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of intimacy with your partner yesterday?",
      ratingOptions: [
        "1 = No intimacy (complete disconnection)",
        "2 = Very poor intimacy (severe distance)",
        "3 = Poor intimacy (significant distance)",
        "4 = Fair intimacy (some connection)",
        "5 = Good intimacy (meaningful connection)",
        "6 = Deep intimacy (strong bond)",
        "7 = Profound intimacy (complete union)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How much time yesterday did you spend in intimate connection with your partner?",
      ratingOptions: [
        "1 = 0 minutes (avoided each other)",
        "2 = 1-15 minutes",
        "3 = 15-30 minutes",
        "4 = 30-60 minutes",
        "5 = 1-2 hours",
        "6 = 2-4 hours",
        "7 = 4+ hours"
      ]
    }
  },

  // 19. Bonding with Significant People
  {
    mainQuestionText: "I have deep, meaningful connections with others who truly know me",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of your connections with significant people yesterday?",
      ratingOptions: [
        "1 = No meaningful connection",
        "2 = Very shallow (surface only)",
        "3 = Shallow (limited depth)",
        "4 = Moderate (some meaningful moments)",
        "5 = Good (several deep moments)",
        "6 = Deep (rich, meaningful connection)",
        "7 = Profound (soul-level connection)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many significant people did you connect with meaningfully yesterday?",
      ratingOptions: [
        "1 = None",
        "2 = Thought of them but no contact",
        "3 = 1 person (brief)",
        "4 = 1 person (substantial)",
        "5 = 2 people",
        "6 = 3-4 people",
        "7 = 5+ people"
      ]
    }
  },

  // 20. Group Acceptance/Connection
  {
    mainQuestionText: "I feel like I belong to a community or group that matters to me",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of your sense of belonging yesterday?",
      ratingOptions: [
        "1 = Completely excluded (total outsider)",
        "2 = Severely excluded (strong rejection)",
        "3 = Excluded (feeling left out)",
        "4 = Partially included (marginal belonging)",
        "5 = Included (sense of acceptance)",
        "6 = Strongly connected (deep belonging)",
        "7 = Completely belonging (integral member)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many groups/communities did you feel connected to yesterday?",
      ratingOptions: [
        "1 = None (isolated from all groups)",
        "2 = Thought about groups but no contact",
        "3 = 1 group (minimal participation)",
        "4 = 1 group (meaningful participation)",
        "5 = 2 groups",
        "6 = 3 groups",
        "7 = 4+ groups"
      ]
    }
  },

  // ==================== SELF NEEDS (5 questions) ====================

  // 21. Sense of Power to Achieve
  {
    mainQuestionText: "I respect myself, my choices, and my accomplishments",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of your sense of personal power yesterday?",
      ratingOptions: [
        "1 = Completely powerless (total incapacity)",
        "2 = Very powerless (severe self-doubt)",
        "3 = Low power (frequent doubt)",
        "4 = Moderate power (some capability)",
        "5 = Good power (generally capable)",
        "6 = Strong power (confident capability)",
        "7 = Complete power (absolute self-efficacy)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many goals/tasks did you accomplish yesterday?",
      ratingOptions: [
        "1 = None (accomplished nothing)",
        "2 = 1 small task",
        "3 = 2-3 small tasks",
        "4 = 3-5 tasks or 1 significant goal",
        "5 = 5-7 tasks or 2 significant goals",
        "6 = 7-10 tasks or 3 significant goals",
        "7 = 10+ tasks or 4+ significant goals"
      ]
    }
  },

  // 22. Sense of Human Dignity/Value as Person
  {
    mainQuestionText: "I have a strong sense of my own dignity and inherent worth as a person",
    qualitySubQuestion: {
      questionText: "How would you rate your sense of inherent worth yesterday?",
      ratingOptions: [
        "1 = Felt completely worthless",
        "2 = Severe self-doubt about value",
        "3 = Questioned my worth frequently",
        "4 = Uncertain about my value",
        "5 = Generally felt valuable",
        "6 = Strong sense of worth",
        "7 = Unshakeable sense of inherent value"
      ]
    },
    volumeSubQuestion: {
      questionText: "How consistently did you maintain your sense of dignity yesterday?",
      ratingOptions: [
        "1 = Never felt dignified",
        "2 = Rare moments only (10% of time)",
        "3 = Occasionally (25% of time)",
        "4 = Sometimes (50% of time)",
        "5 = Often (75% of time)",
        "6 = Most of the time (90%)",
        "7 = Consistently (100%)"
      ]
    }
  },

  // 23. Sense of Respect for Achievements
  {
    mainQuestionText: "I feel respected and valued by others (colleagues, family, friends)",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of respect/recognition you received yesterday?",
      ratingOptions: [
        "1 = Only disrespect/dismissal",
        "2 = Predominantly disrespectful",
        "3 = Minimal/grudging acknowledgment",
        "4 = Some acknowledgment",
        "5 = Good recognition",
        "6 = Genuine, meaningful respect",
        "7 = Exceptional respect/honor"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many times were your achievements acknowledged yesterday?",
      ratingOptions: [
        "1 = Never (ignored or dismissed)",
        "2 = Once (barely acknowledged)",
        "3 = 2 times",
        "4 = 3 times",
        "5 = 4-5 times",
        "6 = 6-8 times",
        "7 = 9+ times"
      ]
    }
  },

  // 24. Honor and Dignity from Colleagues
  {
    mainQuestionText: "I feel respected and valued by others (colleagues, family, friends)",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of respect from colleagues yesterday?",
      ratingOptions: [
        "1 = Active disrespect (hostility/contempt)",
        "2 = Significant disrespect",
        "3 = Mild disrespect (dismissive)",
        "4 = Neutral (neither respect nor disrespect)",
        "5 = Basic respect (polite regard)",
        "6 = Strong respect (valued colleague)",
        "7 = High honor (deeply respected)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many respectful interactions with colleagues did you have yesterday?",
      ratingOptions: [
        "1 = None (all disrespectful)",
        "2 = 1 neutral or respectful moment",
        "3 = 2-3 respectful moments",
        "4 = 3-5 respectful moments",
        "5 = 5-7 respectful moments",
        "6 = 7-10 respectful moments",
        "7 = 10+ respectful moments"
      ]
    }
  },

  // 25. Importance of Your Voice and Opinion
  {
    mainQuestionText: "My voice and opinions matter; I'm listened to and taken seriously",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of reception when you shared your opinions yesterday?",
      ratingOptions: [
        "1 = Completely ignored/dismissed",
        "2 = Mostly ignored",
        "3 = Barely acknowledged",
        "4 = Heard but not valued",
        "5 = Heard and considered",
        "6 = Valued and appreciated",
        "7 = Highly valued and influential"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many times did you express your opinion yesterday?",
      ratingOptions: [
        "1 = Never (silenced self completely)",
        "2 = Once (hesitantly)",
        "3 = 2 times",
        "4 = 3 times",
        "5 = 4-5 times",
        "6 = 6-8 times",
        "7 = 9+ times (fully expressed)"
      ]
    }
  },

  // ==================== META-NEEDS (15 questions) ====================

  // 26. Expressive Needs: To be and express your best self
  {
    mainQuestionText: "I express my authentic self rather than a false persona",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of your self-expression yesterday?",
      ratingOptions: [
        "1 = Completely suppressed (couldn't be myself)",
        "2 = Severely inhibited (rarely authentic)",
        "3 = Mostly inhibited (limited expression)",
        "4 = Somewhat expressed (mixed authenticity)",
        "5 = Good expression (regularly authentic)",
        "6 = Free expression (mostly uninhibited)",
        "7 = Complete expression (totally authentic)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many times yesterday did you express yourself authentically?",
      ratingOptions: [
        "1 = Never (wore mask all day)",
        "2 = Once",
        "3 = 2-3 times",
        "4 = 4-5 times",
        "5 = 6-8 times",
        "6 = 9-12 times",
        "7 = Consistently throughout day"
      ]
    }
  },

  // 27. Aesthetic Needs: To see, enjoy, and create beauty
  {
    mainQuestionText: "I notice, appreciate, and create beauty in my life",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of beauty you experienced yesterday?",
      ratingOptions: [
        "1 = No beauty (completely dull/ugly)",
        "2 = Minimal beauty (gray environment)",
        "3 = Limited beauty (occasional pleasant moments)",
        "4 = Moderate beauty (some aesthetic pleasure)",
        "5 = Good beauty (regular appreciation)",
        "6 = Rich beauty (frequently moved)",
        "7 = Transcendent beauty (awe-inspiring)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many times yesterday did you pause to appreciate beauty?",
      ratingOptions: [
        "1 = Never",
        "2 = Once",
        "3 = 2-3 times",
        "4 = 4-5 times",
        "5 = 6-8 times",
        "6 = 9-12 times",
        "7 = 13+ times or sustained appreciation"
      ]
    }
  },

  // 28. Truth Needs: To know what is true, real, and authentic
  {
    mainQuestionText: "I seek truth and understanding in areas that matter to me",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of truth/authenticity in your life yesterday?",
      ratingOptions: [
        "1 = Completely false (living a lie)",
        "2 = Mostly false (heavy pretense)",
        "3 = Somewhat false (frequent dishonesty)",
        "4 = Mixed (some truth, some pretense)",
        "5 = Mostly true (generally honest)",
        "6 = Very true (consistently authentic)",
        "7 = Completely true (total authenticity)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many times yesterday did you choose truth over convenience?",
      ratingOptions: [
        "1 = Never (all choices were dishonest)",
        "2 = Once",
        "3 = 2-3 times",
        "4 = 4-5 times",
        "5 = 6-8 times",
        "6 = 9-12 times",
        "7 = Always (every choice authentic)"
      ]
    }
  },

  // 29. Love Needs: To care and extend yourself to others
  {
    mainQuestionText: "I care deeply about and extend myself for others' wellbeing",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of love you gave yesterday?",
      ratingOptions: [
        "1 = No love given (cold/indifferent)",
        "2 = Very little love (minimal caring)",
        "3 = Limited love (conditional/selective)",
        "4 = Moderate love (occasional caring)",
        "5 = Good love (regular kindness)",
        "6 = Deep love (heartfelt caring)",
        "7 = Profound love (selfless, abundant)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many acts of love/caring did you perform yesterday?",
      ratingOptions: [
        "1 = None",
        "2 = 1 act",
        "3 = 2-3 acts",
        "4 = 4-5 acts",
        "5 = 6-8 acts",
        "6 = 9-12 acts",
        "7 = 13+ acts"
      ]
    }
  },

  // 30. Conative Needs: To choose your unique way of life
  {
    mainQuestionText: "I'm actively choosing my own path rather than just following others",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of freedom in your choices yesterday?",
      ratingOptions: [
        "1 = No freedom (completely controlled)",
        "2 = Very little freedom (heavily constrained)",
        "3 = Limited freedom (mostly constrained)",
        "4 = Moderate freedom (some choice)",
        "5 = Good freedom (generally choose freely)",
        "6 = Great freedom (mostly autonomous)",
        "7 = Complete freedom (totally self-directed)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many significant choices did you make autonomously yesterday?",
      ratingOptions: [
        "1 = None (all decisions made by others)",
        "2 = 1 choice",
        "3 = 2-3 choices",
        "4 = 4-5 choices",
        "5 = 6-8 choices",
        "6 = 9-12 choices",
        "7 = 13+ choices"
      ]
    }
  },

  // 31. Contribution Needs: To make a difference
  {
    mainQuestionText: "I'm making a meaningful contribution to something beyond myself",
    qualitySubQuestion: {
      questionText: "How would you rate the meaningfulness of your contributions yesterday?",
      ratingOptions: [
        "1 = No contribution (felt useless)",
        "2 = Minimal impact (barely noticeable)",
        "3 = Small contribution (modest impact)",
        "4 = Moderate contribution (some impact)",
        "5 = Good contribution (clear positive impact)",
        "6 = Significant contribution (meaningful difference)",
        "7 = Profound contribution (transformative impact)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many acts of contribution did you perform yesterday?",
      ratingOptions: [
        "1 = None",
        "2 = 1 small act",
        "3 = 2-3 small acts",
        "4 = 3-5 acts or 1 significant act",
        "5 = 5-7 acts or 2 significant acts",
        "6 = 7-10 acts or 3 significant acts",
        "7 = 10+ acts or 4+ significant acts"
      ]
    }
  },

  // 32. Cognitive Needs: To know, understand, learn
  {
    mainQuestionText: "I'm actively learning, growing, and expanding my understanding",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of learning you experienced yesterday?",
      ratingOptions: [
        "1 = None (completely stagnant)",
        "2 = Minimal (trivial learning)",
        "3 = Limited (surface learning)",
        "4 = Moderate (some meaningful learning)",
        "5 = Good (solid learning)",
        "6 = Rich (deep, transformative learning)",
        "7 = Profound (breakthrough insights)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How much time yesterday did you spend in deliberate learning?",
      ratingOptions: [
        "1 = 0 minutes",
        "2 = 1-15 minutes",
        "3 = 15-30 minutes",
        "4 = 30-60 minutes",
        "5 = 1-2 hours",
        "6 = 2-4 hours",
        "7 = 4+ hours"
      ]
    }
  },

  // 33. Justice Needs: To make things right, fair, equal
  {
    mainQuestionText: "I regularly serve or help others in ways that matter",
    qualitySubQuestion: {
      questionText: "How would you rate the fairness of your actions yesterday?",
      ratingOptions: [
        "1 = Completely unjust (harmful)",
        "2 = Very unfair (biased, harmful)",
        "3 = Often unfair (frequent bias)",
        "4 = Sometimes fair (mixed)",
        "5 = Generally fair (mostly equitable)",
        "6 = Consistently fair (high integrity)",
        "7 = Exemplary fairness (champion of justice)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many situations did you approach with fairness yesterday?",
      ratingOptions: [
        "1 = None (all handled unfairly)",
        "2 = 1-2 situations",
        "3 = 2-3 situations",
        "4 = About half",
        "5 = Most situations",
        "6 = Nearly all (1-2 lapses)",
        "7 = All situations"
      ]
    }
  },

  // 34. Wisdom Needs: Multiple and rich perspectives
  {
    mainQuestionText: "I have a clear sense of purpose that guides my decisions",
    qualitySubQuestion: {
      questionText: "How would you rate the depth of wisdom you accessed yesterday?",
      ratingOptions: [
        "1 = No wisdom (foolish choices)",
        "2 = Very little wisdom",
        "3 = Limited wisdom",
        "4 = Moderate wisdom",
        "5 = Good wisdom (wise decisions)",
        "6 = Deep wisdom (profound insight)",
        "7 = Exceptional wisdom (sage-like)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many different perspectives did you consider yesterday?",
      ratingOptions: [
        "1 = None (rigid, single view)",
        "2 = 1 alternative view",
        "3 = 2 perspectives",
        "4 = 3 perspectives",
        "5 = 4-5 perspectives",
        "6 = 6-8 perspectives",
        "7 = 9+ perspectives (highly flexible)"
      ]
    }
  },

  // 35. Meaningfulness Needs: An ultimate sense of significance
  {
    mainQuestionText: "My life feels deeply meaningful and purposeful",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of meaning you experienced yesterday?",
      ratingOptions: [
        "1 = Completely meaningless (nihilistic)",
        "2 = Very little meaning (empty)",
        "3 = Limited meaning (shallow)",
        "4 = Moderate meaning (some significance)",
        "5 = Good meaning (generally purposeful)",
        "6 = Rich meaning (deeply significant)",
        "7 = Profound meaning (transcendent purpose)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many meaningful moments did you experience yesterday?",
      ratingOptions: [
        "1 = None (all felt pointless)",
        "2 = 1 moment",
        "3 = 2-3 moments",
        "4 = 4-5 moments",
        "5 = 6-8 moments",
        "6 = 9-12 moments",
        "7 = Sustained meaningfulness all day"
      ]
    }
  },

  // 36. I seek truth and understanding in areas that matter
  {
    mainQuestionText: "I seek truth and understanding in areas that matter to me",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of your truth-seeking yesterday?",
      ratingOptions: [
        "1 = No truth-seeking (avoided reality)",
        "2 = Very little seeking (superficial)",
        "3 = Limited seeking (shallow inquiry)",
        "4 = Moderate seeking (some inquiry)",
        "5 = Good seeking (genuine inquiry)",
        "6 = Deep seeking (rigorous inquiry)",
        "7 = Relentless seeking (passionate inquiry)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How much time yesterday did you spend seeking truth/understanding?",
      ratingOptions: [
        "1 = 0 minutes",
        "2 = 1-15 minutes",
        "3 = 15-30 minutes",
        "4 = 30-60 minutes",
        "5 = 1-2 hours",
        "6 = 2-4 hours",
        "7 = 4+ hours"
      ]
    }
  },

  // 37. I'm curious about life and exploring new ideas
  {
    mainQuestionText: "I'm curious about life and enjoy exploring new ideas",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of your curiosity yesterday?",
      ratingOptions: [
        "1 = No curiosity (closed, disinterested)",
        "2 = Very little curiosity",
        "3 = Limited curiosity (occasional interest)",
        "4 = Moderate curiosity",
        "5 = Good curiosity (regularly engaged)",
        "6 = Strong curiosity (actively exploring)",
        "7 = Insatiable curiosity (constantly wondering)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many new ideas/topics did you explore yesterday?",
      ratingOptions: [
        "1 = None (no exploration)",
        "2 = 1 idea (superficially)",
        "3 = 1 idea (deeply) or 2 ideas (superficially)",
        "4 = 2-3 ideas",
        "5 = 4-5 ideas",
        "6 = 6-8 ideas",
        "7 = 9+ ideas"
      ]
    }
  },

  // 38. I notice, appreciate, and create beauty in my life
  {
    mainQuestionText: "I notice, appreciate, and create beauty in my life",
    qualitySubQuestion: {
      questionText: "How would you rate your engagement with beauty yesterday?",
      ratingOptions: [
        "1 = No engagement (beauty-blind)",
        "2 = Very little engagement",
        "3 = Limited engagement (passive only)",
        "4 = Moderate engagement",
        "5 = Good engagement (active appreciation)",
        "6 = Creative engagement (creating beauty)",
        "7 = Immersive engagement (living in beauty)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many times did you create or enhance beauty yesterday?",
      ratingOptions: [
        "1 = Never (created ugliness)",
        "2 = Thought about it but didn't act",
        "3 = 1 small act",
        "4 = 2-3 acts",
        "5 = 4-5 acts",
        "6 = 6-8 acts",
        "7 = 9+ acts"
      ]
    }
  },

  // 39. I express myself creatively in some form
  {
    mainQuestionText: "I express myself creatively in some form",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of your creative expression yesterday?",
      ratingOptions: [
        "1 = No creativity (completely blocked)",
        "2 = Very little creativity",
        "3 = Limited creativity (imitative)",
        "4 = Moderate creativity",
        "5 = Good creativity (original ideas)",
        "6 = Rich creativity (flowing expression)",
        "7 = Exceptional creativity (breakthrough work)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How much time did you spend in creative activity yesterday?",
      ratingOptions: [
        "1 = 0 minutes",
        "2 = 1-15 minutes",
        "3 = 15-30 minutes",
        "4 = 30-60 minutes",
        "5 = 1-2 hours",
        "6 = 2-4 hours",
        "7 = 4+ hours"
      ]
    }
  },

  // 40. I'm expressing my best self and highest qualities regularly
  {
    mainQuestionText: "I'm expressing my best self and highest qualities regularly",
    qualitySubQuestion: {
      questionText: "How would you rate how well you expressed your best self yesterday?",
      ratingOptions: [
        "1 = Worst self (complete betrayal of values)",
        "2 = Very poor self (far from potential)",
        "3 = Below average self (disappointing)",
        "4 = Average self (acceptable but not best)",
        "5 = Good self (living values well)",
        "6 = Best self (peak expression)",
        "7 = Transcendent self (beyond normal limits)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How many hours yesterday were you expressing your highest qualities?",
      ratingOptions: [
        "1 = 0 hours",
        "2 = 1-2 hours",
        "3 = 2-4 hours",
        "4 = 4-6 hours",
        "5 = 6-8 hours",
        "6 = 8-12 hours",
        "7 = All waking hours"
      ]
    }
  },

  // 41. I'm using and developing my unique talents and gifts
  {
    mainQuestionText: "I'm using and developing my unique talents and gifts",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of your talent development yesterday?",
      ratingOptions: [
        "1 = No talent use (completely wasted)",
        "2 = Very little use (minimal engagement)",
        "3 = Limited use (occasional engagement)",
        "4 = Moderate use (some development)",
        "5 = Good use (regular development)",
        "6 = Strong use (significant growth)",
        "7 = Exceptional use (breakthrough development)"
      ]
    },
    volumeSubQuestion: {
      questionText: "How much time yesterday did you spend developing your talents?",
      ratingOptions: [
        "1 = 0 minutes",
        "2 = 1-15 minutes",
        "3 = 15-30 minutes",
        "4 = 30-60 minutes",
        "5 = 1-2 hours",
        "6 = 2-4 hours",
        "7 = 4+ hours"
      ]
    }
  }
];

