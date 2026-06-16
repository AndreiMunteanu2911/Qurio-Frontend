export type Difficulty = 'easy' | 'medium' | 'hard';

export type Question = {
	question: string;
	options: [string, string, string, string];
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

export type ApiErrorPayload = {
	error?: {
		code?: string;
		message?: string;
	};
};
