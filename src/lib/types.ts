export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'mcq' | 'true-false' | 'fill-blank';
export type ExplanationMode = 'immediate' | 'end';
export type ExamSettings = {
  questionCount: number;
  questionTypeMix: {
    mcq: number;
    trueFalse: number;
    fillBlank: number;
  };
  timeLimitMinutes: number;
  explanationMode: ExplanationMode;
};
export type Category =
  | 'biology' | 'chemistry' | 'physics' | 'mathematics' | 'computer-science'
  | 'engineering' | 'medicine' | 'psychology' | 'sociology' | 'economics'
  | 'business' | 'history' | 'geography' | 'literature' | 'philosophy'
  | 'law' | 'art' | 'music' | 'languages' | 'education' | 'general';

export type Question = {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

export type Exam = {
  id: string;
  userId: string;
  prompt: string;
  difficulty: Difficulty;
  category: Category;
  title: string;
  questions: Question[];
  settings: ExamSettings;
  createdAt: string;
};

export type Mistake = {
  id: string;
  examId: string;
  examTitle: string;
  difficulty: Difficulty;
  question: Question;
  createdAt: string;
};

export type ExamResult = {
  id: string;
  examId: string;
  examTitle: string;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  answers: { questionId: string; selected: number; correct: boolean }[];
  createdAt: string;
};

export type XpData = {
  totalXp: number;
  level: number;
};

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
};

export type CompleteExamResponse = {
  result: ExamResult;
  xp: XpData & { awarded: number; levelsGained: number };
  streak: StreakData;
  newAchievements: { id: string; name: string; description: string; unlockedAt: string }[];
  currencyAwarded: number;
};

export type ShareLink = {
  url: string;
};

export type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

export type ExamProgress = {
  examId: string;
  currentIndex: number;
  answers: { questionId: string; selected: number; correct: boolean }[];
  score: number;
  updatedAt?: string;
};

export type ExamProgressResponse = {
  hasProgress: boolean;
} & Partial<ExamProgress>;

export type ShopItemType = 'power-up' | 'accent' | 'title' | 'card-skin' | 'avatar-border' | 'exam-theme';

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: ShopItemType;
  consumable: boolean;
};

export type CurrencyData = {
  balance: number;
};

export type InventoryData = {
  items: { itemId: string; quantity: number; acquiredAt: string }[];
  activeCosmetics: Record<string, string>;
};

export type DailyData = {
  loginStreak: number;
  loginClaimedToday: boolean;
  canClaimLogin: boolean;
  loginBonus?: number;
  dailyQuest: {
    id: string;
    name: string;
    description: string;
    target: number;
    reward: number;
    progress: number;
    completed: boolean;
    claimed: boolean;
  } | null;
};

export const CATEGORIES: Category[] = [
  'biology', 'chemistry', 'physics', 'mathematics', 'computer-science',
  'engineering', 'medicine', 'psychology', 'sociology', 'economics',
  'business', 'history', 'geography', 'literature', 'philosophy',
  'law', 'art', 'music', 'languages', 'education', 'general'
];
