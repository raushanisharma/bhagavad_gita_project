export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  /** Optional verse to link to after answering. */
  verseId?: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "How many chapters are there in the Bhagavad Gita?",
    options: ["12", "18", "24", "700"],
    answerIndex: 1,
    explanation: "The Gita has 18 chapters and about 700 verses.",
  },
  {
    id: "q2",
    question: "Where is the conversation between Krishna and Arjuna set?",
    options: ["Ayodhya", "Mathura", "The battlefield of Kurukshetra", "The forest of Dandaka"],
    answerIndex: 2,
    explanation: "The Gita is spoken on the battlefield of Kurukshetra, just before the war begins.",
  },
  {
    id: "q3",
    question: "According to verse 2.47, what do we have a right to?",
    options: ["The results of our work", "Our actions alone", "Rest from all work", "Other people's approval"],
    answerIndex: 1,
    explanation: "'Karmanye vadhikaraste': you have a right to your actions, never to their fruits.",
    verseId: "2.47",
  },
  {
    id: "q4",
    question: "In verse 2.48, how does Krishna define yoga?",
    options: ["Physical postures", "Evenness of mind (samatvam)", "Renouncing the world", "Fasting"],
    answerIndex: 1,
    explanation: "'Samatvam yoga uchyate': equanimity in success and failure is called yoga.",
    verseId: "2.48",
  },
  {
    id: "q5",
    question: "Verse 2.50 says yoga is...",
    options: ["Skill in action", "Freedom from all work", "Knowledge of scriptures", "Victory in battle"],
    answerIndex: 0,
    explanation: "'Yogah karmasu kaushalam': yoga is skill, or excellence, in action.",
    verseId: "2.50",
  },
  {
    id: "q6",
    question: "According to 2.62–63, what chain leads to anger and loss of reason?",
    options: [
      "Hunger → tiredness → anger",
      "Dwelling on objects → attachment → desire → anger",
      "Fear → doubt → anger",
      "Pride → success → anger",
    ],
    answerIndex: 1,
    explanation: "Thinking about objects breeds attachment, attachment breeds desire, and frustrated desire becomes anger.",
    verseId: "2.62",
  },
  {
    id: "q7",
    question: "Which verse says 'the mind alone is your friend, and the mind alone is your enemy'?",
    options: ["2.47", "4.7", "6.5", "18.66"],
    answerIndex: 2,
    explanation: "Verse 6.5: lift yourself by your own mind; do not let yourself sink.",
    verseId: "6.5",
  },
  {
    id: "q8",
    question: "In 6.35, how does Krishna say the restless mind can be controlled?",
    options: ["Through anger and force", "Through practice and detachment", "Through sleep", "It cannot be controlled"],
    answerIndex: 1,
    explanation: "'Abhyasena tu kaunteya vairagyena cha grihyate': by practice (abhyasa) and detachment (vairagya).",
    verseId: "6.35",
  },
  {
    id: "q9",
    question: "What image does 5.10 use for acting without attachment?",
    options: ["A bird in the sky", "A lotus leaf untouched by water", "A lamp in a windless place", "A tortoise withdrawing its limbs"],
    answerIndex: 1,
    explanation: "Like a lotus leaf in water stays dry, one who acts without attachment is untouched.",
    verseId: "5.10",
  },
  {
    id: "q10",
    question: "Which three 'gates to self-destruction' are named in 16.21?",
    options: ["Fear, doubt, laziness", "Lust, anger, greed", "Pride, envy, sloth", "Hunger, thirst, sleep"],
    answerIndex: 1,
    explanation: "Kama (lust), krodha (anger) and lobha (greed) are the three gates to ruin.",
    verseId: "16.21",
  },
  {
    id: "q11",
    question: "In 9.26, what does Krishna say he accepts when offered with love?",
    options: ["Only gold and jewels", "A leaf, a flower, a fruit or water", "Only grand sacrifices", "Nothing material"],
    answerIndex: 1,
    explanation: "'Patram pushpam phalam toyam': even the simplest offering given with devotion is accepted.",
    verseId: "9.26",
  },
  {
    id: "q12",
    question: "What does 3.35 say about following your own dharma (svadharma)?",
    options: [
      "Copy whoever is most successful",
      "Your own path, even imperfect, is better than another's done perfectly",
      "Dharma does not matter",
      "Always follow the majority",
    ],
    answerIndex: 1,
    explanation: "It is better to do your own duty imperfectly than someone else's perfectly.",
    verseId: "3.35",
  },
  {
    id: "q13",
    question: "Which chapter is known as Bhakti Yoga, the Yoga of Devotion?",
    options: ["Chapter 2", "Chapter 6", "Chapter 12", "Chapter 18"],
    answerIndex: 2,
    explanation: "Chapter 12 is Bhakti Yoga, and it describes the qualities of a devotee dear to Krishna.",
  },
  {
    id: "q14",
    question: "Who narrates the Gita to the blind king Dhritarashtra?",
    options: ["Arjuna", "Vyasa", "Sanjaya", "Bhishma"],
    answerIndex: 2,
    explanation: "Sanjaya, granted divine sight by Vyasa, narrates the conversation to Dhritarashtra.",
  },
  {
    id: "q15",
    question: "In 6.17, what does Krishna recommend for yoga to destroy sorrow?",
    options: ["Extreme fasting", "Moderation in food, rest, work and sleep", "Constant work", "Sleeping a lot"],
    answerIndex: 1,
    explanation: "Balance in eating, recreation, work, sleep and waking makes yoga the destroyer of sorrow.",
    verseId: "6.17",
  },
];
