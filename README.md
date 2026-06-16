# Qurio Frontend

Qurio helps you turn any topic, notes, or study prompt into a focused interactive exam. Instead of scrolling through a long answer key, you answer one question at a time, get instant feedback, and learn from a short explanation after each choice.

## What You Can Do

**Instant Custom Quizzes**  
Paste a topic or study material, choose a difficulty, and generate a 10-question multiple-choice exam.

**Interactive, Step-by-Step Learning**  
Qurio shows one question at a time so each answer feels focused and manageable.

**Instant Feedback**  
After you choose an answer, Qurio immediately highlights whether it was correct and explains why.

**Track Your Knowledge**  
Every generated exam is saved to your account so you can search, filter, and retake it later.

## How to Use Qurio

1. Sign up with your email and password.
2. Open **Generate Exam**.
3. Paste your notes, textbook summary, lesson topic, or study prompt.
4. Pick Easy, Medium, or Hard.
5. Take the quiz one question at a time.
6. Review the instant feedback after each answer.
7. Revisit saved exams whenever you want more practice.

## 🛠️ For Developers: Under the Hood

## Frontend Credits

Design inspiration: [Figma Community file 1092102311721076046](https://www.figma.com/community/file/1092102311721076046).

### Tech Stack

- SvelteKit with TypeScript
- `@sveltejs/adapter-vercel`
- Tailwind CSS with forms and typography plugins
- Firebase Client SDK for email/password authentication
- Express backend API proxy for all exam and AI requests

### Architecture Rules

- The frontend never calls OpenRouter directly.
- The frontend sends a Firebase ID token to the backend with `Authorization: Bearer <token>`.
- The backend verifies the token with Firebase Admin and uses the verified `uid`.
- User data is persisted in Firestore by the backend.

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
PUBLIC_API_BASE_URL=http://localhost:8081
PUBLIC_FIREBASE_API_KEY=...
PUBLIC_FIREBASE_AUTH_DOMAIN=...
PUBLIC_FIREBASE_PROJECT_ID=...
PUBLIC_FIREBASE_APP_ID=...
```

### Local Setup

```bash
npm install
npm run dev
```

The app expects the backend API to be available at `PUBLIC_API_BASE_URL`.

### Deployment

Deploy this repository to Vercel. Configure the same public Firebase variables and the backend API URL in the Vercel project settings.

This repository also includes `vercel.json` so Vercel treats the project as a SvelteKit app.
