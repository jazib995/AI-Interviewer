
"use client";

import { useState } from "react";
import { Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
const questions = [
  {
    title: "Tell me about yourself.",
    description:
      "Please share a brief overview of your background, skills and what motivated you to apply for this role.",
    tip: "Be concise and highlight your relevant experience.",
  },
  {
    title: "What are your greatest strengths?",
    description:
      "Describe the skills or qualities that make you a strong candidate for this position.",
    tip: "Support your strengths with real examples.",
  },
  {
    title: "Tell me about a challenging project you worked on.",
    description:
      "Explain the challenge, how you approached it, and what you learned from the experience.",
    tip: "Focus on your actions and the results.",
  },
  {
    title: "How do you handle tight deadlines?",
    description:
      "Describe how you prioritize tasks and maintain quality when working under pressure.",
    tip: "Give an example from your experience.",
  },
  {
    title: "Why should we hire you?",
    description:
      "Explain what makes you a suitable candidate and how you can contribute to this role.",
    tip: "Connect your skills to the job requirements.",
  },
];

 function InterviewWorkspaceContent() {
    const searchParams = useSearchParams();
const role = searchParams.get("role") || "Software Engineer";
const interviewType = searchParams.get("type") || "Technical";
const difficulty = searchParams.get("difficulty") || "Intermediate";
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  function toggleRecording() {
    setIsListening(!isListening);
  }

  function nextQuestion() {
    setIsListening(false);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsFinished(true);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#090611] text-white">

      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-32 h-96 w-96 rounded-full bg-purple-700/20 blur-[150px]" />
        <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-blue-600/15 blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-purple-500/20 bg-[#0d091a]/80 px-6 py-5 backdrop-blur-xl lg:px-10">

        <a href="/" className="text-2xl font-bold tracking-wide">
          INTERVIEW<span className="text-purple-400">.AI</span>
        </a>

        <div className="flex items-center gap-6">

          <div className="hidden rounded-full border border-purple-400/20 bg-purple-500/10 px-5 py-2 sm:block">
            <span className="text-sm text-gray-400">Time Left</span>
            <span className="ml-3 font-semibold">25:00</span>
          </div>

          <div>
            <p className="text-sm text-purple-300">
              Question {currentQuestion + 1} / {questions.length}
            </p>

            <div className="mt-2 flex gap-1">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-7 rounded-full ${
                    index <= currentQuestion
                      ? "bg-purple-500"
                      : "bg-purple-950"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-400/30 bg-purple-500/10 font-semibold">
            JD
          </div>
        </div>
      </header>

      {/* Main workspace */}
      <section className="relative z-10 mx-auto grid max-w-[1500px] items-center gap-8 px-6 py-10 lg:grid-cols-[0.9fr_1.5fr_0.7fr] lg:px-10">
        <div className="col-span-full flex flex-wrap gap-3">
  <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-200">
    Role: {role}
  </span>

  <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200">
    Type: {interviewType}
  </span>

  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
    Difficulty: {difficulty}
  </span>
</div>

        {/* AI Interviewer */}
        <div className="relative flex min-h-[440px] flex-col items-center justify-center">

          {/* AI online badge */}
          <div className="absolute left-0 top-0 flex items-center gap-3 rounded-2xl border border-purple-400/25 bg-purple-500/10 px-4 py-3 backdrop-blur-xl">
            <span className="h-3 w-3 rounded-full bg-green-400 shadow-[0_0_12px_#4ade80]" />
            <div>
              <p className="text-sm font-semibold">AI Interviewer</p>
              <p className="text-xs text-gray-400">Online</p>
            </div>
          </div>

          {/* Avatar glow */}
          <div className="absolute h-72 w-72 rounded-full bg-purple-600/25 blur-[90px]" />
          <div className="absolute h-64 w-64 rounded-full border border-purple-500/40 shadow-[0_0_60px_rgba(139,92,246,0.25)]" />

          {/* Avatar image */}
          <div className="relative mt-12 h-[390px] w-full max-w-[370px]">
            <Image
              src="/images/hero-AI.png"
              alt="AI Interviewer"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 370px"
              className="object-contain drop-shadow-[0_0_35px_rgba(139,92,246,0.3)]"
            />
          </div>

          {/* AI speech status */}
          <div className="absolute bottom-0 left-1/2 flex w-[90%] -translate-x-1/2 items-center justify-center gap-3 rounded-2xl border border-purple-400/30 bg-[#100b20]/90 px-5 py-4 shadow-xl backdrop-blur-xl">
            <span className="text-xl text-cyan-400">〰</span>
            <span className="text-sm font-medium">
              {isListening ? "I'm listening..." : "Ready when you are"}
            </span>
          </div>
        </div>

        {/* Question and microphone */}
        <div className="flex flex-col gap-6">

          {/* Question card */}
          <div className="rounded-3xl border border-purple-400/20 bg-white/[0.045] p-7 shadow-2xl shadow-purple-950/30 backdrop-blur-2xl sm:p-10">

            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-purple-400/20 bg-purple-500/15 px-5 py-3">
              <span className="text-lg">✧</span>
              <span className="text-sm font-semibold text-purple-200">
                Your Question
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              {question.title}
            </h1>

            <p className="mt-6 text-base leading-8 text-gray-300 sm:text-lg">
              {question.description}
            </p>

            <div className="mt-9 flex items-start gap-3 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-5">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-sm font-semibold text-purple-200">
                  Quick Tip
                </p>
                <p className="mt-1 text-sm text-gray-300">
                  {question.tip}
                </p>
              </div>
            </div>
          </div>

          {/* Microphone controls */}
          <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-7">

            <button
              onClick={toggleRecording}
              className={`flex h-28 w-28 items-center justify-center rounded-full border-4 text-4xl shadow-xl transition duration-300 hover:scale-105 ${
                isListening
                  ? "border-cyan-400 bg-cyan-500/20 shadow-cyan-500/30"
                  : "border-purple-500 bg-purple-500/15 shadow-purple-500/30"
              }`}
              aria-label={isListening ? "Stop recording" : "Start recording"}
            >
              🎙
            </button>

            <p className="mt-5 text-sm font-semibold">
              {isListening ? "Recording simulation active" : "Click to Start Recording"}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              {isListening
                ? "Click the microphone again to stop."
                : "Your answer will be recorded here."}
            </p>

            <button
              onClick={nextQuestion}
              className="mt-7 w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 py-4 font-semibold shadow-lg shadow-purple-600/20 transition hover:-translate-y-1 hover:shadow-purple-500/30"
            >
              {currentQuestion === questions.length - 1
                ? "Finish Interview"
                : "Next Question →"}
            </button>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="flex flex-col gap-6">

          {/* Progress card */}
          <div className="rounded-3xl border border-purple-400/20 bg-white/[0.04] p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold">Interview Progress</h2>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-purple-950">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="text-sm font-semibold">
                {Math.round(progress)}%
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-400">
              {currentQuestion + 1} of {questions.length} questions
            </p>
          </div>

          {/* AI status */}
          <div className="rounded-3xl border border-cyan-400/30 bg-cyan-500/[0.06] p-6 shadow-lg shadow-cyan-950/20">
            <div className="flex items-center gap-3">
              <span className="text-xl text-cyan-400">◉</span>
              <h2 className="font-semibold">AI Status</h2>
            </div>

            <p className="mt-7 text-2xl font-bold text-cyan-300">
              {isListening ? "Listening" : "Waiting"}
            </p>

            <p className="mt-3 text-sm text-gray-400">
              {isListening ? "Speak now..." : "Ready for your answer"}
            </p>
          </div>

          {/* Quick tips */}
          <div className="rounded-3xl border border-purple-400/20 bg-purple-500/[0.08] p-6">
            <h2 className="mb-5 text-lg font-semibold">
              ✦ Quick Tips
            </h2>

            <ul className="space-y-4 text-sm text-gray-300">
              <li>✓ Be yourself</li>
              <li>✓ Showcase your skills</li>
              <li>✓ Give real examples</li>
              <li>✓ Speak clearly</li>
            </ul>
          </div>
        </aside>
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-purple-500/20 bg-[#0d091a]/80 px-6 py-6 lg:px-10">
        <p className="text-sm text-gray-400">
          ✧ AI-Powered Recruitment
          <span className="mx-3 text-purple-500">•</span>
          Smarter Hiring Decisions
        </p>

        <a
          href="/interview/setup"
          className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-6 py-3 text-sm font-semibold transition hover:bg-purple-500/20"
        >
          ← Exit Interview
        </a>
      </footer>

      {/* Interview finished overlay */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-purple-400/30 bg-[#160e29] p-10 text-center shadow-2xl shadow-purple-950">
            <div className="text-5xl">✦</div>

            <h2 className="mt-6 text-2xl font-bold">
              Interview Completed!
            </h2>

            <p className="mt-4 text-sm leading-7 text-gray-400">
              Great work! You've completed this sample interview.
              Your AI-generated feedback will appear here once we
              connect the AI evaluation system.
            </p>

            <a
              href="/interview/setup"
              className="mt-8 block rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 py-4 font-semibold"
            >
              Back to Setup
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
export default function InterviewWorkspace() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090611]" />
      }
    >
      <InterviewWorkspaceContent />
    </Suspense>
  );
}
