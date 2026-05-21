# TOEIC Writing Mock Test - Architecture

## Overview

A Next.js 16 web application for practicing TOEIC Writing exams. Users take timed mock tests (8 questions, 3 parts), submit answers, and receive instant AI grading via Google Gemini with detailed feedback in Vietnamese.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| UI | React 19, Hero UI 3, Tailwind CSS v4 |
| Animation | Framer Motion 12 |
| Database | PostgreSQL (Supabase) + Prisma 7 ORM |
| AI | Google Gemini 2.5 Flash (`@google/genai`) |
| Linting | ESLint 9 + `eslint-config-next` |

## Directory Layout

```
app/                          # Next.js App Router
├── layout.tsx                # Root layout (dark theme, animated bg)
├── page.tsx                  # Homepage - lists available tests
├── api/
│   ├── grade-test/route.ts   # POST - grade submission via Gemini
│   └── tests/route.ts        # POST - create a new test
└── test/
    ├── create/page.tsx       # Create test form
    └── [id]/
        ├── page.tsx          # Test intro / instructions
        ├── exam/
        │   ├── page.tsx      # Server entry (fetches data)
        │   └── ExamClient.tsx # Exam UI, timer, submission
        └── result/
            └── [submissionId]/
                └── page.tsx  # Score + AI feedback display

lib/
└── prisma.ts                 # Singleton Prisma client

prisma/
├── schema.prisma             # DB schema (Test, Question, Submission)
└── seed.ts                   # Seeds 2 practice tests
```

## Data Model

```
Test (tests)
  ├── id: UUID
  ├── title: String
  ├── duration: Int (default 60 min)
  ├── questions: Question[]   (1:N, cascade)
  └── submissions: Submission[] (1:N, cascade)

Question (questions)
  ├── id: UUID
  ├── testId: UUID (FK)
  ├── questionNumber: Int
  ├── part: 1 | 2 | 3
  ├── promptText: String
  ├── imageUrl: String?      (Part 1 only)
  ├── keywords: String[]     (Part 1 only)

Submission (submissions)
  ├── id: UUID
  ├── testId: UUID (FK)
  ├── answers: Json          {"q1":"...", "q2":"..."}
  ├── aiFeedback: Json?      Structured AI grading response
  ├── totalScore: Int?       (0-200 TOEIC scale)
```

## Routing & Data Flow

```
/ (homepage)
  └─ Server component: queries all tests, renders grid
      └─ Click "Start" → /test/[id]

/test/[id] (intro)
  └─ Server component: fetches test + questions, shows instructions
      └─ Click "Start Test" → /test/[id]/exam

/test/[id]/exam (exam room)
  ├─ Server component (page.tsx): fetches test + questions
  └─ Client component (ExamClient.tsx):
       1. useState for answers (Record<string, string>)
       2. 60-min countdown via setInterval (auto-submits at 0)
       3. On submit → POST /api/grade-test { testId, answers }
       4. On success → redirect to /test/[id]/result/[submissionId]

POST /api/grade-test
  ├─ Fetch test + questions from DB
  ├─ Build Gemini prompt with questions + user answers
  ├─ For Part 1: fetch images → base64 inlineData (multimodal)
  ├─ Call Gemini 2.5 Flash (system prompt: ETS scoring rubric)
  ├─ Parse JSON feedback, save Submission to DB
  └─ Return { submissionId, totalScore }

/test/[id]/result/[submissionId]
  └─ Server component: fetches submission + test + questions
      └─ Animated score ring, part breakdown, per-question feedback
         (error analysis in Vietnamese, sample answer in English)

POST /api/tests
  └─ Validates payload, creates Test + nested Questions via Prisma
```

## Key Architecture Decisions

- **Server/Client split**: Data fetching in server components, interactivity in client components (`ExamClient.tsx`).
- **`force-dynamic`**: All pages use `export const dynamic = "force-dynamic"` to prevent caching (stale test/submission data).
- **Prisma singleton**: `lib/prisma.ts` stores client on `globalThis` to avoid hot-reload duplication.
- **Multimodal grading**: Part 1 images are fetched server-side, converted to base64, and sent to Gemini as `inlineData` for vision-based evaluation.
- **Retry with backoff**: Gemini API retries up to 3 times on HTTP 429 with 2s × attempt delay.
- **Double-submit guard**: `ExamClient` uses a `hasSubmittedRef` to prevent multiple submissions.
- **TOEIC scoring**: Raw scores (max ~28-30) mapped to a 0-200 TOEIC scale.

## TOEIC Exam Structure

| Part | Questions | Task | Max Score |
|------|-----------|------|-----------|
| 1 | 1-5 | Write sentence from picture using 2 keywords | 3 each (15) |
| 2 | 6-7 | Respond to an email | 4-5 each (8-10) |
| 3 | 8 | Opinion essay (300+ words) | 5 |
