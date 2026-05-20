# Project Specification: TOEIC Writing Mock Test Application (Multimodal Enabled)

## 1. Tech Stack
- **Framework:** Next.js (App Router, TypeScript)
- **Database & Auth:** Supabase (Prisma)
# Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.wjuazrccfrmnglrjgtrr:Nicholasdong@9054@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.wjuazrccfrmnglrjgtrr:Nicholasdong@9054@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

- **Styling:** Tailwind CSS + Hero UI (optional, for clean interface)
- **AI Integration:** Gemini API (Google Gen AI SDK - supporting Multimodal text and image input) GEMINI_API_KEY=AIzaSyBrz7DzK_1OlZMj7Nxvzu4DDOrphTTgeV8

---

## 2. Database Schema (Supabase)

### Table: `tests`
- `id`: uuid (Primary Key)
- `title`: text (e.g., "TOEIC Writing Test 1")
- `duration`: integer (default: 60, in minutes)
- `created_at`: timestamp

### Table: `questions`
- `id`: uuid (Primary Key)
- `test_id`: uuid (Foreign Key -> `tests.id`)
- `question_number`: integer (1 to 8)
- `part`: integer (1, 2, or 3)
- `prompt_text`: text (The email context or essay prompt)
- `image_url`: text (Nullable, public storage URL for Part 1 photos)
- `keywords`: text[] (Nullable, for Part 1 e.g., ["friend", "together"])

### Table: `submissions`
- `id`: uuid (Primary Key)
- `test_id`: uuid (Foreign Key -> `tests.id`)
- `answers`: jsonb (Format: `{ "q1": "user_answer", "q2": ... }`)
- `ai_feedback`: jsonb (Stores the structured AI response)
- `total_score`: integer
- `created_at`: timestamp

---

## 3. Core Application Flow & Pages

### Page 1: Home Page (`/`)
- Display a list of available writing tests retrieved from `tests` table.
- Each test card shows: Title, Duration (60 mins), and a "Take Test" button.

### Page 2: Test Introduction Page (`/test/[id]`)
- Shows test details, instructions for TOEIC Writing (Part 1: 5 questions, Part 2: 2 questions, Part 3: 1 question).
- A prominent "Start Test" button which redirects to the exam room and triggers the countdown timer.

### Page 3: Exam Room Page (`/test/[id]/exam`)
- **Timer Component:** A strict 60-minute countdown. Automatically submits the test when it hits 00:00.
- **Layout:** Split-screen or vertical scroll layout displaying 8 questions sequentially:
  - **Questions 1-5 (Part 1):** Display image from `image_url`, keywords, and a text input field.
  - **Questions 6-7 (Part 2):** Display inbound email text, directions, and a textarea field.
  - **Question 8 (Part 3):** Display essay prompt, directions, and a large textarea field with a word counter.
- **Action:** A "Submit Test" button at the bottom that gathers all inputs and sends them to the API route.

### Page 4: Result & Feedback Page (`/test/[id]/result/[submission_id]`)
- Displays the overall estimated TOEIC score (Scale: 0 - 200).
- Detailed breakdown section for each of the 8 questions:
  - User's answer.
  - Score for that specific question.
  - Detailed grammar/vocabulary error corrections.
  - "Upgrade" version (High-score sample answer).

---

## 4. AI Engine Configuration (Gemini API Route)

Create a Next.js Route Handler (`/api/grade-test`) to process the submission. 

### System Prompt for Gemini:
```text
You are an expert TOEIC Writing Examiner. Your task is to grade a full 8-question TOEIC Writing test. 
Analyze the provided questions, associated images (for Part 1), and the user's corresponding answers strictly based on ETS scoring criteria:

- Part 1 (Q1-Q5): Look at the provided image for each question. Evaluate the user's sentence based on: Grammar accuracy, factual relevance to the objects/actions in the picture, and correct usage of BOTH provided keywords (keywords must keep their original form/parts of speech unless it is a valid verb conjugation). Score 0-3 per question.
- Part 2 (Q6-Q7): Task achievement (answering all instructions and cues), sentence quality, and professional business tone. Score 0-5 per question.
- Part 3 (Q8): Essay structure (4 paragraphs), thesis clarity, supporting details/examples, lexical diversity, and grammatical accuracy. Score 0-5.

You MUST respond strictly in JSON format matching the following structure:
{
  "total_toeic_score": 120, // Estimated converted score from 0-200
  "parts_breakdown": {
    "part1_score": "X/15",
    "part2_score": "X/10",
    "part3_score": "X/5"
  },
  "detailed_feedback": [
    {
      "question_number": 1,
      "score": 3,
      "max_score": 3,
      "error_analysis": "Clear explanation of mistakes or structural issues in Vietnamese.",
      "upgrade_suggestion": "The high-scoring sample sentence/paragraph here."
    },
    ... // Repeat for all 8 questions
  ]
}