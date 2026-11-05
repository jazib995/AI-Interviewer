
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InterviewSetup() {
    const router = useRouter();
  const [role, setRole] = useState("Software Engineer");
  const [type, setType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    router.push(
    `/interview/workspace?role=${encodeURIComponent(role)}&type=${encodeURIComponent(type)}&difficulty=${encodeURIComponent(difficulty)}`
  );
  }

  const fieldStyle =
    "w-full rounded-xl border border-white/10 bg-[#171027] px-4 py-3 text-white outline-none transition focus:border-purple-400";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090611] px-6 py-10 text-white">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-150px] top-20 h-96 w-96 rounded-full bg-purple-700/15 blur-[140px]" />
        <div className="absolute right-[-150px] bottom-10 h-96 w-96 rounded-full bg-violet-600/15 blur-[140px]" />
      </div>

      {/* Navigation */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between">
        <a href="/" className="text-xl font-bold tracking-wide">
          INTERVIEW<span className="text-purple-400">.AI</span>
        </a>

        <a href="/" className="text-sm text-gray-400 transition hover:text-white">
          ← Back to Home
        </a>
      </header>

      {/* Setup content */}
      <section className="relative z-10 mx-auto mt-16 max-w-3xl">

        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex rounded-full border border-purple-400/25 bg-purple-500/10 px-4 py-2 text-xs text-purple-300">
            STEP 01 — INTERVIEW CONFIGURATION
          </div>

          <h1 className="text-4xl font-bold sm:text-5xl">
            Prepare for your
            <span className="block mt-2 bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
              next interview.
            </span>
          </h1>

          <p className="mt-5 text-gray-400">
            Customize your interview experience before you begin.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-purple-950/20 backdrop-blur-xl sm:p-10"
        >

          {/* Job role */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-semibold">
              Job Role
            </label>

            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setSubmitted(false);
              }}
              className={fieldStyle}
            >
              <option>Software Engineer</option>
              <option>Frontend Developer</option>
              <option>Backend Developer</option>
              <option>Full Stack Developer</option>
              <option>Data Analyst</option>
              <option>Machine Learning Engineer</option>
              <option>Product Manager</option>
            </select>
          </div>

          {/* Interview type */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-semibold">
              Interview Type
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              {["Technical", "HR", "Mixed"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setType(item);
                    setSubmitted(false);
                  }}
                  className={`rounded-xl border p-4 text-sm font-medium transition ${
                    type === item
                      ? "border-purple-400 bg-purple-500/15 text-purple-200"
                      : "border-white/10 bg-white/[0.02] text-gray-400 hover:border-purple-400/40"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-semibold">
              Difficulty Level
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              {["Beginner", "Intermediate", "Advanced"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setDifficulty(item);
                    setSubmitted(false);
                  }}
                  className={`rounded-xl border p-4 text-sm font-medium transition ${
                    difficulty === item
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                      : "border-white/10 bg-white/[0.02] text-gray-400 hover:border-cyan-400/40"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Continue button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 py-4 font-semibold shadow-lg shadow-purple-600/20 transition hover:-translate-y-1 hover:shadow-purple-500/30"
          >
            Continue to Interview →
          </button>

          {/* Temporary setup confirmation */}
          {submitted && (
            <div className="mt-5 rounded-xl border border-purple-400/20 bg-purple-500/10 p-4">
              <p className="font-semibold text-purple-200">
                Interview configuration saved!
              </p>
              <p className="mt-2 text-sm text-gray-300">
                {role} · {type} · {difficulty}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Next, we'll connect these settings to your AI interviewer.
              </p>
            </div>
          )}

        </form>
      </section>
    </main>
  );
}
