"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, Button, Input, TextArea } from "@heroui/react";
import NextLink from "next/link";

interface QuestionFormData {
  part: number;
  questionNumber: number;
  promptText: string;
  imageUrl: string;
  keywords: string;
}

export default function CreateTestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<QuestionFormData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        part: 1,
        questionNumber: prev.length + 1,
        promptText: "",
        imageUrl: "",
        keywords: "",
      },
    ]);
  };

  const handleQuestionChange = (index: number, field: keyof QuestionFormData, value: any) => {
    setQuestions((prev) => {
      const newQuestions = [...prev];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      return newQuestions;
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          duration,
          questions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create test");
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Tests
          </NextLink>
          <h1 className="text-sm font-semibold text-white">Create New Test</h1>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="bg-default-50/50 backdrop-blur-md border-white/10">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-xl font-bold text-white">Test Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Test Title</label>
                  <Input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. TOEIC Writing Mock Test 1"
                    className="w-full text-white bg-default-100 border border-white/10 hover:border-primary focus-within:!border-primary px-3 py-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Duration (minutes)</label>
                  <Input
                    required
                    type="number"
                    min={1}
                    value={duration.toString()}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                    className="w-full text-white bg-default-100 border border-white/10 hover:border-primary focus-within:!border-primary px-3 py-2 rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Questions</h2>
              <Button type="button" variant="secondary" onClick={handleAddQuestion} className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Question
              </Button>
            </div>

            {questions.map((q, idx) => (
              <Card key={idx} className="bg-default-50/50 backdrop-blur-md border-white/10 relative overflow-visible">
                <Button
                  type="button"
                  variant="danger"
                  className="absolute -top-3 -right-3 z-10 rounded-full w-8 h-8 min-w-0 p-0 flex items-center justify-center shadow-lg shadow-danger/30 hover:scale-105 transition-transform"
                  onClick={() => handleRemoveQuestion(idx)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
                
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-default-500 mb-1">Part (1-3)</label>
                      <Input
                        required
                        type="number"
                        min={1}
                        max={3}
                        value={q.part.toString()}
                        onChange={(e) => handleQuestionChange(idx, "part", parseInt(e.target.value) || 1)}
                        className="text-white bg-default-100 border border-white/10 px-3 py-2 rounded-lg w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-default-500 mb-1">Question Number</label>
                      <Input
                        required
                        type="number"
                        min={1}
                        value={q.questionNumber.toString()}
                        onChange={(e) => handleQuestionChange(idx, "questionNumber", parseInt(e.target.value) || 1)}
                        className="text-white bg-default-100 border border-white/10 px-3 py-2 rounded-lg w-full"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-default-500 mb-1">Keywords (Comma separated)</label>
                      <Input
                        value={q.keywords}
                        onChange={(e) => handleQuestionChange(idx, "keywords", e.target.value)}
                        placeholder="e.g. airport, luggage"
                        className="text-white bg-default-100 border border-white/10 px-3 py-2 rounded-lg w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-default-500 mb-1">Image URL (Optional)</label>
                    <Input
                      type="url"
                      value={q.imageUrl}
                      onChange={(e) => handleQuestionChange(idx, "imageUrl", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="text-white bg-default-100 border border-white/10 px-3 py-2 rounded-lg w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-default-500 mb-1">Prompt Text</label>
                    <TextArea
                      required
                      rows={3}
                      value={q.promptText}
                      onChange={(e) => handleQuestionChange(idx, "promptText", e.target.value)}
                      placeholder="Write the question prompt here..."
                      className="w-full text-sm text-white font-sans bg-default-100 border border-white/10 hover:border-primary/50 focus:border-primary p-3 rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
                <p className="text-default-500">No questions added yet. Click "Add Question" to start.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              variant="primary"
              isDisabled={isSubmitting || questions.length === 0 || !title}
              className="px-8 py-4 text-base font-semibold shadow-lg shadow-primary/30 hover:scale-105 transition-all"
            >
              {isSubmitting ? "Saving Test..." : "Save Test"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
