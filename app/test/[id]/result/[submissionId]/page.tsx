import NextLink from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

interface FeedbackItem {
  question_number: number;
  score: number;
  max_score: number;
  error_analysis: string;
  upgrade_suggestion: string;
}

interface AIFeedback {
  total_toeic_score: number;
  parts_breakdown: {
    part1_score: string;
    part2_score: string;
    part3_score: string;
  };
  detailed_feedback: FeedbackItem[];
}

export default async function ResultPage(
  props: PageProps<"/test/[id]/result/[submissionId]">
) {
  const { id, submissionId } = await props.params;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      test: {
        include: {
          questions: {
            orderBy: { questionNumber: "asc" },
          },
        },
      },
    },
  });

  if (!submission || submission.testId !== id) notFound();

  const feedback = submission.aiFeedback as unknown as AIFeedback;
  const answers = submission.answers as Record<string, string>;
  const totalScore = feedback?.total_toeic_score ?? submission.totalScore ?? 0;
  const maxScore = 200;
  const scorePercent = Math.round((totalScore / maxScore) * 100);

  // SVG circle values
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  const getScoreColor = (percent: number) => {
    if (percent >= 80) return "success";
    if (percent >= 60) return "primary";
    if (percent >= 40) return "warning";
    return "danger";
  };

  const getScoreColorValue = (percent: number) => {
    if (percent >= 80) return "#17c964"; // success
    if (percent >= 60) return "#006FEE"; // primary
    if (percent >= 40) return "#f5a524"; // warning
    return "#f31260"; // danger
  };

  const getScoreLabel = (percent: number) => {
    if (percent >= 80) return "Excellent";
    if (percent >= 60) return "Good";
    if (percent >= 40) return "Fair";
    return "Needs Improvement";
  };

  const scoreColorStr = getScoreColor(scorePercent);
  const scoreColorHex = getScoreColorValue(scorePercent);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="border-b border-white/10 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
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
          <NextLink
            href={`/test/${id}`}
            className="inline-flex items-center justify-center text-sm font-semibold px-4 py-2 rounded-xl bg-secondary/20 text-secondary hover:bg-secondary/30 transition-all"
          >
            Retake Test
          </NextLink>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {/* Score Overview */}
        <div className="bg-default-50/50 backdrop-blur-md border border-white/10 rounded-2xl mb-10 animate-fade-in-up">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Score Ring */}
              <div className="relative flex-shrink-0 flex items-center justify-center">
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 180 180"
                  className="score-ring"
                >
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="none"
                    stroke={scoreColorHex}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                      transition: "stroke-dashoffset 1.5s ease-in-out",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-4xl font-bold"
                    style={{ color: scoreColorHex }}
                  >
                    {totalScore}
                  </span>
                  <span className="text-sm text-default-500">
                    / {maxScore}
                  </span>
                </div>
              </div>

              {/* Score Details */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-white mb-2">
                  {submission.test.title}
                </h1>
                <p
                  className="text-lg font-semibold mb-6"
                  style={{ color: scoreColorHex }}
                >
                  {getScoreLabel(scorePercent)}
                </p>

                {feedback?.parts_breakdown && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-default-50/50 border border-white/10 rounded-xl">
                      <div className="p-4 text-center flex flex-col items-center justify-center">
                        <p className="text-xs text-secondary font-semibold mb-1">Part 1</p>
                        <p className="text-2xl font-bold text-white mb-1">{feedback.parts_breakdown.part1_score}</p>
                        <p className="text-[10px] text-default-500">Sentences</p>
                      </div>
                    </div>
                    <div className="bg-default-50/50 border border-white/10 rounded-xl">
                      <div className="p-4 text-center flex flex-col items-center justify-center">
                        <p className="text-xs text-success font-semibold mb-1">Part 2</p>
                        <p className="text-2xl font-bold text-white mb-1">{feedback.parts_breakdown.part2_score}</p>
                        <p className="text-[10px] text-default-500">Emails</p>
                      </div>
                    </div>
                    <div className="bg-default-50/50 border border-white/10 rounded-xl">
                      <div className="p-4 text-center flex flex-col items-center justify-center">
                        <p className="text-xs text-warning font-semibold mb-1">Part 3</p>
                        <p className="text-2xl font-bold text-white mb-1">{feedback.parts_breakdown.part3_score}</p>
                        <p className="text-[10px] text-default-500">Essay</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Feedback */}
        <h2 className="text-xl font-semibold text-white mb-6">
          Detailed Feedback
        </h2>

        <div className="space-y-6 stagger-children">
          {(feedback?.detailed_feedback || []).map((item) => {
            const question = submission.test.questions.find(
              (q) => q.questionNumber === item.question_number
            );
            const userAnswer =
              answers[`q${item.question_number}`] || "(No answer)";
            const scoreColor =
              item.score === item.max_score
                ? "#17c964" // success
                : item.score >= item.max_score * 0.6
                  ? "#006FEE" // primary
                  : item.score > 0
                    ? "#f5a524" // warning
                    : "#f31260"; // danger

            const partColorClass = question?.part === 1 ? "bg-secondary/20 text-secondary" : question?.part === 2 ? "bg-success/20 text-success" : "bg-warning/20 text-warning";

            return (
              <div key={item.question_number} className="bg-default-50/50 backdrop-blur-md border border-white/10 rounded-2xl">
                <div className="p-6">
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${partColorClass}`}>
                        Part {question?.part}
                      </span>
                      <span className="text-sm font-medium text-white">
                        Question {item.question_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: scoreColor }}
                      >
                        {item.score}
                      </span>
                      <span className="text-sm text-default-500">
                        / {item.max_score}
                      </span>
                    </div>
                  </div>

                  {/* Score Bar */}
                  <div className="h-1.5 rounded-full bg-default-100 mb-6 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${(item.score / item.max_score) * 100}%`,
                        backgroundColor: scoreColor,
                      }}
                    />
                  </div>

                  {/* User Answer */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-default-500 mb-2">
                      Your Answer
                    </h4>
                    <div className="bg-background rounded-xl p-4 text-sm text-white leading-relaxed whitespace-pre-wrap border border-white/5">
                      {userAnswer}
                    </div>
                  </div>

                  {/* Error Analysis */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-danger mb-2 flex items-center gap-1.5">
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
                          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                      </svg>
                      Analysis & Corrections
                    </h4>
                    <div className="bg-danger/10 rounded-xl p-4 text-sm text-white leading-relaxed border border-danger/20 whitespace-pre-wrap">
                      {item.error_analysis}
                    </div>
                  </div>

                  {/* Upgrade Suggestion */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-success mb-2 flex items-center gap-1.5">
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
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                        />
                      </svg>
                      High-Score Sample Answer
                    </h4>
                    <div className="bg-success/10 rounded-xl p-4 text-sm text-white leading-relaxed border border-success/20 whitespace-pre-wrap">
                      {item.upgrade_suggestion}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4 mt-12 pb-12">
          <NextLink
            href="/"
            className="inline-flex items-center justify-center text-sm font-semibold px-8 py-4 rounded-2xl border-2 border-white/20 bg-transparent text-white hover:bg-white/10 transition-all"
          >
            Back to Tests
          </NextLink>
          <NextLink
            href={`/test/${id}`}
            className="inline-flex items-center gap-2 justify-center text-sm font-semibold px-8 py-4 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
              />
            </svg>
            Retake Test
          </NextLink>
        </div>
      </main>
    </div>
  );
}
