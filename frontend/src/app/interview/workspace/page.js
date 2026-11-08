"use client";

import { useState, useRef, useEffect } from "react";
import { Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

function InterviewWorkspaceContent() {
  const searchParams = useSearchParams();

  const role = searchParams.get("role") || "Software Engineer";
  const interviewType = searchParams.get("type") || "Technical";
  const difficulty = searchParams.get("difficulty") || "Intermediate";
  const jobId = searchParams.get("job_id");
  const candidateName = searchParams.get("candidate_name");
  const candidateEmail = searchParams.get("candidate_email");
  const invitationToken = searchParams.get("token");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [backendResponse, setBackendResponse] = useState(null);
  const [backendError, setBackendError] = useState("");
  const [questionsFromBackend, setQuestionsFromBackend] = useState([]);

  const [isListening, setIsListening] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [answer, setAnswer] = useState("");
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [speechError, setSpeechError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");

  const recognitionRef = useRef(null);

  const question = questionsFromBackend[currentQuestion];

  const progress =
    questionsFromBackend.length > 0
      ? (currentQuestion / questionsFromBackend.length) * 100
      : 0;

  // Get AI-generated questions from backend
  useEffect(() => {
    async function startInterview() {
      try {
        const response = await fetch("http://127.0.0.1:8000/interview/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
            interview_type: interviewType,
            difficulty,
            job_id: jobId,
            invitation_token: invitationToken,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate interview questions.");
        }

        const data = await response.json();

        setBackendResponse(data);
        setQuestionsFromBackend(data.questions);
      } catch (error) {
        setBackendError(error.message);
      }
    }

    startInterview();
  }, [role, interviewType, difficulty, invitationToken]);

  // Stop microphone when leaving the page
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // Voice recording
  function toggleRecording() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + " ";
        }
      }

      if (transcript) {
        setAnswer((previous) => previous + transcript);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") {
        setSpeechError("No speech detected. Please try again.");
      } else {
        setSpeechError("Microphone error: " + event.error);
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setSpeechError("");

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setSpeechError("Could not start microphone. Please try again.");
    }
  }

  // Move to the next question
  function nextQuestion() {
    setAnswer("");
    setSpeechError("");
    setSubmissionMessage("");

    if (currentQuestion < questionsFromBackend.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    } else {
      setIsFinished(true);
    }
  }

  // Submit current answer
  async function submitAnswer() {
    if (!answer.trim()) {
      setSubmissionMessage("Please provide an answer first.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionMessage("");

      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }

      const response = await fetch("http://127.0.0.1:8000/interview/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          question: question.title,
          answer,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer.");
      }

      await response.json();

      const updatedAnswers = [
        ...submittedAnswers,
        {
          role,
          question: question.title,
          answer,
        },
      ];

      setSubmittedAnswers(updatedAnswers);

      // Save complete interview after final answer
      if (currentQuestion === questionsFromBackend.length - 1) {
        const completeResponse = await fetch(
          "http://127.0.0.1:8000/interview/submit-complete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              role,
              interview_type: interviewType,
              difficulty,
              answers: updatedAnswers,
              job_id: jobId,
              candidate_name: candidateName,
              candidate_email: candidateEmail,
              invitation_token: invitationToken,
            }),
          },
        );

        if (!completeResponse.ok) {
          throw new Error("Failed to submit complete interview.");
        }

        const completeData = await completeResponse.json();
        console.log("Complete interview:", completeData);

        setSubmissionMessage("Interview submitted successfully!");
      } else {
        setSubmissionMessage("Answer submitted successfully!");
      }

      nextQuestion();
    } catch (error) {
      setSubmissionMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Loading state
  if (backendError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090611] p-6 text-white">
        <div className="max-w-lg rounded-3xl border border-red-400/20 bg-red-500/5 p-8 text-center">
          <div className="text-4xl">!</div>
          <h1 className="mt-4 text-2xl font-bold text-red-300">
            Interview Error
          </h1>
          <p className="mt-3 text-gray-400">{backendError}</p>
          <a
            href="/interview/setup"
            className="mt-6 inline-block rounded-xl bg-purple-600 px-6 py-3 font-semibold"
          >
            Back to Setup
          </a>
        </div>
      </main>
    );
  }

  if (!backendResponse || questionsFromBackend.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090611] text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-900 border-t-purple-400" />
          <p className="mt-5 text-lg font-medium text-purple-200">
            Preparing your AI interview...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Your questions are being generated
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090611] text-white">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-purple-700/20 blur-[150px]" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-blue-600/15 blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-violet-700/10 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.07] bg-[#0d091a]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-5 px-5 py-5 lg:px-10">
          <a href="/" className="text-2xl font-black tracking-wide">
            INTERVIEW<span className="text-purple-400">.AI</span>
          </a>

          <div className="flex items-center gap-5">
            <div className="hidden rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 sm:block">
              <p className="text-[10px] uppercase tracking-widest text-gray-500">
                Interview Mode
              </p>
              <p className="mt-1 text-sm font-semibold">{interviewType}</p>
            </div>

            <div className="rounded-xl border border-purple-400/20 bg-purple-500/10 px-4 py-2">
              <p className="text-[10px] uppercase tracking-widest text-purple-300">
                Question
              </p>
              <p className="mt-1 text-sm font-semibold">
                {currentQuestion + 1} / {questionsFromBackend.length}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-400/30 bg-purple-500/15 font-bold text-purple-200">
              AI
            </div>
          </div>
        </div>
      </header>

      {/* Overall progress */}
      <div className="relative z-10 h-1 w-full bg-white/[0.04]">
        <div
          className="h-full bg-gradient-to-r from-violet-600 via-purple-400 to-cyan-400 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main workspace */}
      <section className="relative z-10 mx-auto grid max-w-[1600px] gap-6 px-5 py-8 lg:grid-cols-[0.85fr_1.7fr_0.8fr] lg:gap-8 lg:px-10 lg:py-12">
        {/* Left: AI Interviewer */}
        <aside className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Your interviewer
            </p>
            <span className="flex items-center gap-2 text-xs text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]" />
              Online
            </span>
          </div>

          <div className="relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-purple-400/15 bg-gradient-to-b from-purple-500/[0.09] to-white/[0.015] p-5">
            <div className="absolute h-64 w-64 rounded-full bg-purple-600/20 blur-[80px]" />
            <div className="absolute h-56 w-56 rounded-full border border-purple-400/20" />
            <div className="absolute h-44 w-44 rounded-full border border-purple-400/10" />

            <div className="relative h-[300px] w-full max-w-[280px]">
              <Image
                src="/images/hero-AI.png"
                alt="AI Interviewer"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 280px"
                className="object-contain drop-shadow-[0_0_35px_rgba(139,92,246,0.3)]"
              />
            </div>

            <div className="relative mt-2 text-center">
              <h2 className="text-lg font-bold">AI Interviewer</h2>
              <p className="mt-1 text-xs text-gray-400">
                Powered by intelligent question generation
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-400/20 bg-purple-500/[0.06] p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-lg">
                ✦
              </span>
              <div>
                <p className="text-sm font-semibold">Interview session</p>
                <p className="text-xs text-gray-500">Your selected settings</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Role</span>
                <span className="text-right text-purple-200">{role}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Type</span>
                <span className="text-right text-cyan-200">
                  {interviewType}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Level</span>
                <span className="text-right text-gray-200">{difficulty}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Question and answer */}
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                Live interview
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                Let's get started.
              </h1>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="text-xs font-medium text-cyan-200">
                AI Generated
              </span>
            </div>
          </div>

          {/* Question card */}
          <div className="rounded-3xl border border-purple-400/20 bg-gradient-to-br from-[#171027]/95 to-[#100b1d]/95 p-6 shadow-2xl shadow-purple-950/30 backdrop-blur-2xl sm:p-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/15 text-xl text-purple-300">
                  ✧
                </div>
                <div>
                  <p className="text-sm font-semibold">Interview question</p>
                  <p className="text-xs text-gray-500">
                    Question {currentQuestion + 1}
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-gray-400">
                {difficulty}
              </span>
            </div>

            <div className="my-7 h-px bg-gradient-to-r from-purple-400/30 via-white/10 to-transparent" />

            <h2 className="text-2xl font-bold leading-relaxed sm:text-3xl">
              {question.title}
            </h2>

            <p className="mt-5 text-sm leading-7 text-gray-400 sm:text-base">
              {question.description}
            </p>

            {/* AI tip */}
            <div className="mt-8 flex gap-4 rounded-2xl border border-amber-300/15 bg-amber-400/[0.05] p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-xl">
                💡
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-200">
                  Interview tip
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {question.tip}
                </p>
              </div>
            </div>
          </div>

          {/* Answer area */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Your answer</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Speak naturally or type your response below.
                </p>
              </div>

              {isListening && (
                <span className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                  Recording
                </span>
              )}
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer will appear here when you speak. You can also type directly..."
              className="mt-5 min-h-[170px] w-full resize-y rounded-2xl border border-white/10 bg-[#0b0815] p-5 text-sm leading-7 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/10"
            />

            {speechError && (
              <p className="mt-3 text-sm text-red-400">{speechError}</p>
            )}

            {submissionMessage && (
              <p className="mt-3 text-sm text-purple-300">
                {submissionMessage}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleRecording}
                  aria-label={
                    isListening ? "Stop recording" : "Start recording"
                  }
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl transition ${
                    isListening
                      ? "border-red-400/40 bg-red-500/15 text-red-300 shadow-lg shadow-red-900/20"
                      : "border-purple-400/30 bg-purple-500/15 text-purple-200 hover:bg-purple-500/25"
                  }`}
                >
                  {isListening ? "■" : "🎙"}
                </button>

                <div>
                  <p className="text-sm font-semibold">
                    {isListening ? "Stop recording" : "Voice answer"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {isListening ? "Speak your answer" : "Use your microphone"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={submitAnswer}
                disabled={isSubmitting}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-8 py-4 text-sm font-bold shadow-lg shadow-purple-600/20 transition hover:-translate-y-0.5 hover:shadow-purple-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "Submitting..."
                  : currentQuestion === questionsFromBackend.length - 1
                    ? "Submit & Finish Interview →"
                    : "Submit & Next Question →"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Progress and status */}
        <aside className="flex flex-col gap-5">
          <div className="rounded-3xl border border-purple-400/20 bg-white/[0.035] p-6 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Your progress
            </p>

            <div className="mt-5 flex items-end justify-between">
              <span className="text-4xl font-black">
                {Math.round(progress)}%
              </span>
              <span className="pb-1 text-xs text-gray-500">
                {currentQuestion + 1} of {questionsFromBackend.length}
              </span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-purple-950">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-400 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-6 space-y-3">
              {questionsFromBackend.map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      index < currentQuestion
                        ? "bg-green-500/15 text-green-300"
                        : index === currentQuestion
                          ? "bg-purple-500/25 text-purple-200 ring-1 ring-purple-400/40"
                          : "bg-white/[0.05] text-gray-600"
                    }`}
                  >
                    {index < currentQuestion ? "✓" : index + 1}
                  </div>
                  <span
                    className={`text-sm ${
                      index === currentQuestion
                        ? "font-semibold text-purple-200"
                        : index < currentQuestion
                          ? "text-green-300"
                          : "text-gray-500"
                    }`}
                  >
                    Question {index + 1}
                  </span>
                  {index === currentQuestion && (
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-purple-300">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/[0.045] p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-xl text-cyan-300">
                ◉
              </span>
              <div>
                <h3 className="font-semibold">System status</h3>
                <p className="text-xs text-gray-500">Voice input</p>
              </div>
            </div>

            <p className="mt-6 text-xl font-bold text-cyan-200">
              {isListening ? "Listening..." : "Ready"}
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {isListening
                ? "Your microphone is active. Speak clearly."
                : "Your interviewer is ready for your response."}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <h3 className="font-semibold">Interview reminders</h3>
            <ul className="mt-5 space-y-4 text-sm text-gray-400">
              <li className="flex gap-3">
                <span className="text-purple-300">✦</span>
                Give clear and structured answers.
              </li>
              <li className="flex gap-3">
                <span className="text-purple-300">✦</span>
                Use real examples from your experience.
              </li>
              <li className="flex gap-3">
                <span className="text-purple-300">✦</span>
                Explain your thought process.
              </li>
              <li className="flex gap-3">
                <span className="text-purple-300">✦</span>
                Take a moment before answering.
              </li>
            </ul>
          </div>
        </aside>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.07] bg-[#0d091a]/70 px-5 py-5">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            INTERVIEW.AI · Intelligent recruitment experience
          </p>

          <a
            href="/interview/setup"
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:border-purple-400/40 hover:bg-purple-500/10"
          >
            ← Exit Interview
          </a>
        </div>
      </footer>
      {/* Interview completion screen */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#080511]/95 px-4 py-8 backdrop-blur-xl">
          <div className="relative my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-purple-400/20 bg-gradient-to-br from-[#1b1032] via-[#130d24] to-[#0c0917] shadow-2xl shadow-purple-950/50">
            {/* Decorative background */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-600/20 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]" />

            <div className="relative p-6 sm:p-10">
              {/* Success icon */}
              <div className="text-center">
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/10" />

                  <div className="relative flex h-20 w-20 animate-bounce items-center justify-center rounded-3xl border border-purple-400/30 bg-gradient-to-br from-purple-500/30 to-violet-700/20 text-4xl shadow-lg shadow-purple-500/20">
                    🎉
                  </div>
                </div>

                <p className="mt-7 text-xs font-bold uppercase tracking-[0.3em] text-purple-300">
                  Interview Successfully Submitted
                </p>

                <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Congratulations!
                </h2>

                <p className="mt-4 text-base leading-7 text-gray-400">
                  Well done{candidateName ? `, ${candidateName}` : ""}! You've
                  successfully completed your AI-powered interview. Take a
                  moment to appreciate your effort.
                </p>
              </div>

              {/* Interview summary */}
              <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-purple-400/20 bg-purple-500/[0.08] p-5 text-center">
                  <p className="text-xs font-medium text-gray-400">
                    Questions Answered
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {submittedAnswers.length}/{questionsFromBackend.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-400/20 bg-purple-500/[0.08] p-5 text-center">
                  <p className="text-xs font-medium text-gray-400">
                    Interview Type
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {interviewType}
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-400/20 bg-purple-500/[0.08] p-5 text-center">
                  <p className="text-xs font-medium text-gray-400">
                    Difficulty
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {difficulty}
                  </p>
                </div>
              </div>

              {/* Job details */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Interview Details
                </p>

                <h3 className="mt-3 text-lg font-bold text-white">{role}</h3>

                <p className="mt-1 text-sm text-gray-400">
                  Your interview responses have been successfully submitted.
                </p>
              </div>

              {/* Thank you message */}
              <div className="mt-6 rounded-2xl border border-purple-400/20 bg-gradient-to-r from-purple-500/10 to-violet-500/[0.04] p-6">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">💜</div>

                  <div>
                    <h3 className="font-bold text-white">What's Next?</h3>

                    <p className="mt-2 text-sm leading-7 text-gray-400">
                      Thank you for taking the time to complete this interview.
                      The recruitment team will review your responses and
                      evaluate your interview. If your profile is shortlisted,
                      the team will contact you regarding the next steps.
                    </p>
                  </div>
                </div>
              </div>

              {/* Question and answer review */}
              <div className="mt-9">
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-white">
                    Your Interview Responses
                  </h3>

                  <p className="mt-2 text-sm text-gray-400">
                    Here's a recap of the questions you answered.
                  </p>
                </div>

                <div className="max-h-72 space-y-4 overflow-y-auto pr-2">
                  {submittedAnswers.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-purple-400/30"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                          Question {index + 1}
                        </span>

                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                          Answer Submitted
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-semibold leading-6 text-white">
                        {item.question}
                      </p>

                      <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-4">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                          Your Answer
                        </p>

                        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-300">
                          {item.answer || "No answer provided."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-9 border-t border-white/10 pt-7 text-center">
                <p className="text-sm text-gray-500">
                  Your next opportunity could be just around the corner.
                </p>

                <a
                  href="/"
                  className="mt-6 block rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 py-4 text-center font-bold text-white shadow-lg shadow-purple-900/30 transition duration-300 hover:scale-[1.02] hover:shadow-purple-500/20"
                >
                  Back to Home →
                </a>

                <p className="mt-5 text-xs text-gray-600">
                  Powered by AI Interviewer
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function InterviewWorkspace() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090611]" />}>
      <InterviewWorkspaceContent />
    </Suspense>
  );
}
