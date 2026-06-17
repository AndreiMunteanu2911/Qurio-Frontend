export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'mcq' | 'true-false' | 'fill-blank';

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

export type ShareLink = {
	url: string;
};

export type ApiErrorPayload = {
	error?: {
		code?: string;
		message?: string;
	};
};
