import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, duration, questions } = body;

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const newTest = await prisma.test.create({
      data: {
        title,
        duration: duration ? parseInt(duration) : 60,
        questions: {
          create: questions.map((q: any) => ({
            questionNumber: parseInt(q.questionNumber),
            part: parseInt(q.part),
            promptText: q.promptText,
            imageUrl: q.imageUrl || null,
            keywords: q.keywords ? q.keywords.split(",").map((k: string) => k.trim()).filter(Boolean) : [],
          })),
        },
      },
    });

    return NextResponse.json(newTest);
  } catch (error) {
    console.error("Failed to create test:", error);
    return NextResponse.json(
      { error: "Failed to create test" },
      { status: 500 }
    );
  }
}
