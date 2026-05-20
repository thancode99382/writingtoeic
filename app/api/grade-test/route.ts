import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testId, answers } = body;

    if (!testId || !answers) {
      return Response.json(
        { error: "Missing testId or answers" },
        { status: 400 }
      );
    }

    // Get test with questions
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          orderBy: { questionNumber: "asc" },
        },
      },
    });

    if (!test) {
      return Response.json({ error: "Test not found" }, { status: 404 });
    }

    // Build the prompt with all questions and answers
    const questionsContext = test.questions
      .map((q) => {
        let context = `\n--- Question ${q.questionNumber} (Part ${q.part}) ---\n`;

        if (q.part === 1) {
          context += `Type: Write a sentence based on a picture\n`;
          if (q.imageUrl) {
            context += `Image URL: ${q.imageUrl}\n`;
          }
          if (q.keywords.length > 0) {
            context += `Keywords: ${q.keywords.join(", ")}\n`;
          }
          if (q.promptText) {
            context += `Additional context: ${q.promptText}\n`;
          }
        } else if (q.part === 2) {
          context += `Type: Respond to a written request\n`;
          context += `Email/Prompt:\n${q.promptText}\n`;
        } else {
          context += `Type: Write an opinion essay\n`;
          context += `Topic:\n${q.promptText}\n`;
        }

        context += `\nUser's Answer: ${answers[`q${q.questionNumber}`] || "(No answer provided)"}\n`;
        return context;
      })
      .join("\n");

    const systemPrompt = `You are an expert TOEIC Writing Examiner. Your task is to grade a full 8-question TOEIC Writing test. 
Analyze the provided questions, associated images (for Part 1), and the user's corresponding answers strictly based on ETS scoring criteria:

- Part 1 (Q1-Q5): Look at the provided image for each question. Evaluate the user's sentence based on: Grammar accuracy, factual relevance to the objects/actions in the picture, and correct usage of BOTH provided keywords (keywords must keep their original form/parts of speech unless it is a valid verb conjugation). Score 0-3 per question.
- Part 2 (Q6-Q7): Task achievement (answering all instructions and cues), sentence quality, and professional business tone. Score 0-5 per question.
- Part 3 (Q8): Essay structure (4 paragraphs), thesis clarity, supporting details/examples, lexical diversity, and grammatical accuracy. Score 0-5.

You MUST respond strictly in JSON format matching the following structure:
{
  "total_toeic_score": 120,
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
    }
  ]
}

IMPORTANT: 
- The detailed_feedback array must contain exactly one entry for each question (all 8 questions).
- error_analysis should be in Vietnamese for Vietnamese learners.
- upgrade_suggestion should be in English (the improved answer).
- total_toeic_score should be an estimated converted score from 0-200.
- Respond with ONLY valid JSON, no markdown formatting.`;

    const userPrompt = `Please grade the following TOEIC Writing test:\n${questionsContext}`;

    // Build content parts for multimodal support
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: userPrompt },
    ];

    // Fetch images for Part 1 questions and include as inline data
    for (const q of test.questions) {
      if (q.part === 1 && q.imageUrl) {
        try {
          const imgRes = await fetch(q.imageUrl);
          if (imgRes.ok) {
            const buffer = await imgRes.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");
            const contentType = imgRes.headers.get("content-type") || "image/jpeg";
            parts.push({
              inlineData: {
                mimeType: contentType,
                data: base64,
              },
            });
          }
        } catch {
          // Skip image if fetch fails
        }
      }
    }

    let response;
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts,
            },
          ],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
          },
        });
        break;
      } catch (err: any) {
        if (err?.status === 429 && retries < maxRetries - 1) {
          retries++;
          // Wait for 2 seconds * retry count
          await new Promise((resolve) => setTimeout(resolve, 2000 * retries));
        } else {
          throw err;
        }
      }
    }

    const responseText = response?.text || "";

    // Parse JSON from response (handle possible markdown wrapping)
    let aiFeedback;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiFeedback = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      console.error("Failed to parse AI response:", responseText);
      return Response.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Save submission
    const submission = await prisma.submission.create({
      data: {
        testId,
        answers,
        aiFeedback,
        totalScore: aiFeedback.total_toeic_score || 0,
      },
    });

    return Response.json({
      submissionId: submission.id,
      totalScore: submission.totalScore,
    });
  } catch (error: any) {
    console.error("Grade test error:", error);
    const errorMessage = error?.status === 429
      ? "API Rate limit exceeded. Please wait a moment and try again."
      : error?.message || "Internal server error";

    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
