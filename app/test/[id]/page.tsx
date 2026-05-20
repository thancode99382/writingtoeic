import NextLink from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, Chip } from "@heroui/react";

export const dynamic = "force-dynamic";

export default async function TestIntroPage(props: PageProps<"/test/[id]">) {
  const { id } = await props.params;

  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { questionNumber: "asc" },
      },
    },
  });

  if (!test) notFound();

  const part1Count = test.questions.filter((q) => q.part === 1).length;
  const part2Count = test.questions.filter((q) => q.part === 2).length;
  const part3Count = test.questions.filter((q) => q.part === 3).length;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="border-b border-white/10 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <NextLink
            href="/"
            className="inline-flex items-center gap-2 text-sm text-default-500 hover:text-white transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Tests
          </NextLink>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{test.title}</h1>
              <div className="flex items-center gap-2">
                <Chip className="bg-default-100 text-default-600">{test.questions.length} questions</Chip>
                <Chip className="bg-primary/20 text-primary">{test.duration} minutes</Chip>
              </div>
            </div>
          </div>
        </div>

        {/* Test Structure */}
        <div className="grid gap-4 mb-10 stagger-children">
          {/* Part 1 */}
          <Card className="bg-default-50/50 backdrop-blur-md border-1 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-secondary font-bold text-lg">P1</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white text-lg">
                      Part 1: Write a Sentence Based on a Picture
                    </h3>
                    <Chip size="sm" className="bg-secondary/20 text-secondary">
                      {part1Count} questions
                    </Chip>
                  </div>
                  <p className="text-sm text-default-500 leading-relaxed">
                    You will be shown a photograph and two keywords. Write ONE
                    sentence that describes the picture using BOTH keywords. Score:
                    0-3 per question.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Part 2 */}
          <Card className="bg-default-50/50 backdrop-blur-md border-1 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-success font-bold text-lg">P2</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white text-lg">
                      Part 2: Respond to a Written Request
                    </h3>
                    <Chip size="sm" className="bg-success/20 text-success">
                      {part2Count} questions
                    </Chip>
                  </div>
                  <p className="text-sm text-default-500 leading-relaxed">
                    You will read an email and respond to it following the
                    provided directions. Write a response of at least 2
                    paragraphs. Score: 0-5 per question.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Part 3 */}
          <Card className="bg-default-50/50 backdrop-blur-md border-1 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-warning font-bold text-lg">P3</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white text-lg">
                      Part 3: Write an Opinion Essay
                    </h3>
                    <Chip size="sm" className="bg-warning/20 text-warning">
                      {part3Count} question
                    </Chip>
                  </div>
                  <p className="text-sm text-default-500 leading-relaxed">
                    You will write an opinion essay of at least 300 words on a
                    given topic. Include an introduction, body paragraphs, and a
                    conclusion. Score: 0-5.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-default-50/50 backdrop-blur-md border-1 border-white/10 mb-10">
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-6 flex items-center gap-2 text-lg">
              <svg
                className="w-6 h-6 text-warning"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              Important Instructions
            </h3>
            <ul className="space-y-4 text-default-500">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">1</span>
                </span>
                <span>The timer starts as soon as you click "Start Test". You have <strong className="text-white">{test.duration} minutes</strong> to complete all questions.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">2</span>
                </span>
                <span>The test will be <strong className="text-white">automatically submitted</strong> when the timer reaches 00:00.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">3</span>
                </span>
                <span>After submission, AI will grade your test and provide detailed feedback with sample answers.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">4</span>
                </span>
                <span>For Part 1, you must use <strong className="text-white">both keywords</strong> in your sentence while keeping their original form.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="flex justify-center mt-12 pb-12">
          <NextLink
            href={`/test/${test.id}/exam`}
            id="start-test-btn"
            className="inline-flex items-center gap-2 justify-center font-semibold px-12 py-5 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105 transition-all text-xl"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
              />
            </svg>
            Start Test
          </NextLink>
        </div>
      </main>
    </div>
  );
}
