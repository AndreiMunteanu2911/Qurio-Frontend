export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'mcq' | 'true-false' | 'fill-blank';
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
  xp: XpData & { awarded: number };
  streak: StreakData;
  newAchievements: { id: string; name: string; description: string; unlockedAt: string }[];
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

export const CATEGORIES: Category[] = [
  'biology', 'chemistry', 'physics', 'mathematics', 'computer-science',
  'engineering', 'medicine', 'psychology', 'sociology', 'economics',
  'business', 'history', 'geography', 'literature', 'philosophy',
  'law', 'art', 'music', 'languages', 'education', 'general'
];
