"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Card, CardContent, Chip, TextArea, Spinner } from "@heroui/react";

interface Question {
  id: string;
  testId: string;
  questionNumber: number;
  part: number;
  promptText: string;
  imageUrl: string | null;
  keywords: string[];
}

interface Test {
  id: string;
  title: string;
  duration: number;
}

interface ExamClientProps {
  test: Test;
  questions: Question[];
}

export default function ExamClient({ test, questions }: ExamClientProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(test.duration * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const hasSubmittedRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (hasSubmittedRef.current || isSubmitting) return;
    hasSubmittedRef.current = true;
    setIsSubmitting(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      const formattedAnswers: Record<string, string> = {};
      questions.forEach((q) => {
        formattedAnswers[`q${q.questionNumber}`] =
          answers[`q${q.questionNumber}`] || "";
      });

      const res = await fetch("/api/grade-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: test.id,
          answers: formattedAnswers,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }
      
      router.push(`/test/${test.id}/result/${data.submissionId}`);
    } catch (err: any) {
      hasSubmittedRef.current = false;
      setIsSubmitting(false);
      alert(`Failed to grade test: ${err.message || 'Please try again.'}`);
    }
  }, [answers, questions, test.id, router, isSubmitting]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [handleSubmit]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionNumber: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [`q${questionNumber}`]: value }));
  };

  const getWordCount = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
  };

  const isUrgent = timeLeft <= 300; // 5 minutes
  const isCritical = timeLeft <= 60; // 1 minute
  const currentQ = questions[activeQuestion];

  const getPartLabel = (part: number) => {
    switch (part) {
      case 1:
        return "Write a Sentence Based on a Picture";
      case 2:
        return "Respond to a Written Request";
      case 3:
        return "Write an Opinion Essay";
      default:
        return "";
    }
  };

  const answeredCount = questions.filter(
    (q) => (answers[`q${q.questionNumber}`] || "").trim().length > 0
  ).length;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Bar */}
      <header className="flex-shrink-0 border-b border-white/10 bg-background/80 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
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
              <h1 className="text-sm font-semibold text-white">
                {test.title}
              </h1>
              <p className="text-xs text-default-500">
                {answeredCount}/{questions.length} answered
              </p>
            </div>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold border ${
              isCritical
                ? "bg-danger/20 text-danger border-danger/30 animate-pulse"
                : isUrgent
                ? "bg-warning/20 text-warning border-warning/30"
                : "bg-default-100 text-white border-white/10"
            }`}
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
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {formatTime(timeLeft)}
          </div>

          {/* Submit */}
          <Button
            variant="primary"
            onClick={handleSubmit}
            isDisabled={isSubmitting}
            className="font-medium flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" color="current" /> Grading...
              </>
            ) : (
              <>
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
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
                Submit Test
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Question Navigator */}
        <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-default-50/50 overflow-y-auto hidden lg:block">
          <div className="p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-default-500 mb-4">
              Questions
            </h2>
            <div className="space-y-1">
              {questions.map((q, idx) => {
                const isAnswered =
                  (answers[`q${q.questionNumber}`] || "").trim().length > 0;
                const isActive = idx === activeQuestion;

                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestion(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all border ${
                      isActive
                        ? "bg-primary/20 text-primary-300 border-primary/30"
                        : "text-default-500 hover:bg-default-100 hover:text-white border-transparent"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                        isAnswered
                          ? "bg-success/20 text-success"
                          : isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-default-100 text-default-500"
                      }`}
                    >
                      {isAnswered ? "✓" : q.questionNumber}
                    </span>
                    <div className="text-left">
                      <span className="block text-xs">
                        Question {q.questionNumber}
                      </span>
                      <span
                        className={`block text-[10px] ${
                          q.part === 1
                            ? "text-secondary-400/70"
                            : q.part === 2
                            ? "text-success-400/70"
                            : "text-warning-400/70"
                        }`}
                      >
                        Part {q.part}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {currentQ && (
              <div className="animate-fade-in-up" key={currentQ.id}>
                {/* Question Header */}
                <div className="flex items-center gap-3 mb-6">
                  <Chip
                    className={
                      currentQ.part === 1
                        ? "bg-secondary/20 text-secondary"
                        : currentQ.part === 2
                        ? "bg-success/20 text-success"
                        : "bg-warning/20 text-warning"
                    }
                  >
                    Part {currentQ.part}
                  </Chip>
                  <span className="text-sm text-default-500">
                    Question {currentQ.questionNumber} of {questions.length}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-white mb-4">
                  {getPartLabel(currentQ.part)}
                </h2>

                {/* Part 1: Image + Keywords */}
                {currentQ.part === 1 && (
                  <div className="space-y-4 mb-6">
                    {currentQ.imageUrl && (
                      <Card className="bg-default-50/50 border-white/10">
                        <CardContent className="p-0">
                          <div className="relative w-full aspect-video">
                            <Image
                              src={currentQ.imageUrl}
                              alt={`Question ${currentQ.questionNumber} image`}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, 800px"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {currentQ.keywords.length > 0 && (
                      <div className="flex items-center gap-3 mt-4">
                        <span className="text-sm text-default-500">
                          Keywords:
                        </span>
                        <div className="flex gap-2">
                          {currentQ.keywords.map((kw, i) => (
                            <Chip key={i} size="sm" className="bg-primary/20 text-primary border-primary/20 border-1">
                              {kw}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentQ.promptText && (
                      <p className="text-sm text-default-500 leading-relaxed mt-2">
                        {currentQ.promptText}
                      </p>
                    )}
                  </div>
                )}

                {/* Part 2: Email prompt */}
                {currentQ.part === 2 && (
                  <div className="mb-6">
                    <Card className="bg-default-50/50 border-white/10 mb-4">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                          <svg
                            className="w-4 h-4 text-success"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                            />
                          </svg>
                          <span className="text-sm font-medium text-success">
                            Email
                          </span>
                        </div>
                        <div className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                          {currentQ.promptText}
                        </div>
                      </CardContent>
                    </Card>
                    <p className="text-sm text-default-500">
                      <strong className="text-white">Directions:</strong>{" "}
                      Respond to the email above. Answer all questions and
                      requests in the email.
                    </p>
                  </div>
                )}

                {/* Part 3: Essay prompt */}
                {currentQ.part === 3 && (
                  <div className="mb-6">
                    <Card className="bg-default-50/50 border-white/10 mb-4">
                      <CardContent className="p-6">
                        <div className="text-white leading-relaxed whitespace-pre-wrap">
                          {currentQ.promptText}
                        </div>
                      </CardContent>
                    </Card>
                    <p className="text-sm text-default-500">
                      <strong className="text-white">Directions:</strong>{" "}
                      Write an essay of at least 300 words expressing your
                      opinion on the topic above. Support your opinion with
                      reasons and examples.
                    </p>
                  </div>
                )}

                {/* Answer Input */}
                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Your Answer</label>
                    {currentQ.part === 3 && (
                      <span
                        className={`text-xs font-normal ${
                          getWordCount(answers[`q${currentQ.questionNumber}`] || "") >= 300
                            ? "text-success"
                            : "text-default-500"
                        }`}
                      >
                        {getWordCount(answers[`q${currentQ.questionNumber}`] || "")} words
                        {getWordCount(answers[`q${currentQ.questionNumber}`] || "") < 300
                          ? " (minimum 300)"
                          : " ✓"}
                      </span>
                    )}
                    {currentQ.part === 2 && (
                      <span className="text-xs font-normal text-default-500">
                        {getWordCount(answers[`q${currentQ.questionNumber}`] || "")} words
                      </span>
                    )}
                  </div>
                  <TextArea
                    rows={currentQ.part === 1 ? 3 : currentQ.part === 2 ? 8 : 12}
                    placeholder={
                      currentQ.part === 1
                        ? "Write one sentence using both keywords..."
                        : currentQ.part === 2
                        ? "Write your email response here..."
                        : "Write your essay here..."
                    }
                    className="w-full text-base text-white font-sans bg-default-50 border border-white/10 hover:border-primary/50 focus:border-primary p-3 rounded-lg"
                    value={answers[`q${currentQ.questionNumber}`] || ""}
                    onChange={(e) => handleAnswerChange(currentQ.questionNumber, e.target.value)}
                  />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={() => setActiveQuestion((prev) => Math.max(0, prev - 1))}
                    isDisabled={activeQuestion === 0}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Previous
                  </Button>

                  {/* Mobile question dots */}
                  <div className="flex gap-1.5 lg:hidden">
                    {questions.map((q, idx) => (
                      <button
                        key={q.id}
                        onClick={() => setActiveQuestion(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === activeQuestion
                            ? "bg-primary w-4"
                            : (answers[`q${q.questionNumber}`] || "").trim().length > 0
                            ? "bg-success/60"
                            : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>

                  {activeQuestion < questions.length - 1 ? (
                    <Button
                      variant="primary"
                      onClick={() => setActiveQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
                      className="flex items-center gap-2"
                    >
                      Next
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      isDisabled={isSubmitting}
                      className="flex items-center gap-2 shadow"
                    >
                      {isSubmitting && <Spinner size="sm" color="current" />}
                      {isSubmitting ? "Submitting..." : "Submit Test"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Submitting Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100]">
          <Card className="bg-default-50 border-white/10 w-full max-w-sm">
            <CardContent className="p-10 text-center flex flex-col items-center">
              <Spinner size="lg" color="accent" className="mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">
                AI is Grading Your Test
              </h3>
              <p className="text-sm text-default-500">
                Please wait while Gemini analyzes your answers and provides detailed feedback...
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
