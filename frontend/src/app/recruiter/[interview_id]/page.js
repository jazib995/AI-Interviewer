"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Suspense } from "react";


function InterviewDetailsContent() {
  const params = useParams();
  const interviewId = params.interview_id;

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInterview() {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/interviews/${interviewId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load interview details.");
        }

        const data = await response.json();
        setInterview(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInterview();
  }, [interviewId]);

  if (loading) {
    return <main className="min-h-screen bg-[#090611] p-10 text-purple-300">Loading interview...</main>;
  }

  if (error) {
    return <main className="min-h-screen bg-[#090611] p-10 text-red-400">{error}</main>;
  }

  if (!interview) return null;

  return (
    <main className="min-h-screen bg-[#090611] p-8 text-white">
      <h1 className="text-3xl font-bold">Interview Details</h1>

      <div className="mt-8 rounded-2xl border border-purple-500/20 bg-[#151020] p-6">
        <h2 className="text-xl font-semibold">{interview.role}</h2>
        <p className="mt-2 text-gray-400">
          {interview.interview_type} · {interview.difficulty}
        </p>
        <p className="mt-2 text-green-400">{interview.status}</p>
      </div>
      
      {/* AI Evaluation */}
      {interview.evaluation && (
        <section className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-medium text-purple-400">
              AI ANALYSIS
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              Candidate Evaluation
            </h2>
            <p className="mt-1 text-gray-400">
              AI-generated assessment of candidate performance.
            </p>
          </div>

          {/* Score Cards */}
          <div className="grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl border border-purple-500/20 bg-[#151020] p-6">
              <p className="text-sm text-gray-400">Overall Score</p>
              <p className="mt-3 text-4xl font-bold text-purple-400">
                {interview.evaluation.overall_score}/100
              </p>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-[#151020] p-6">
              <p className="text-sm text-gray-400">Technical Knowledge</p>
              <p className="mt-3 text-4xl font-bold text-cyan-400">
                {interview.evaluation.technical_knowledge_score}/100
              </p>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-[#151020] p-6">
              <p className="text-sm text-gray-400">Communication</p>
              <p className="mt-3 text-4xl font-bold text-green-400">
                {interview.evaluation.communication_score}/100
              </p>
            </div>

          </div>
          {/* Strengths and Weaknesses */}
          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <div className="rounded-2xl border border-green-500/20 bg-[#151020] p-6">
              <h3 className="text-lg font-semibold text-green-400">
                Strengths
              </h3>

              <ul className="mt-4 space-y-3">
                {interview.evaluation.strengths?.map((item, index) => (
                  <li key={index} className="text-gray-300">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-[#151020] p-6">
              <h3 className="text-lg font-semibold text-red-400">
                Areas for Improvement
              </h3>

              <ul className="mt-4 space-y-3">
                {interview.evaluation.weaknesses?.map((item, index) => (
                  <li key={index} className="text-gray-300">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* AI Summary */}
          <div className="mt-5 rounded-2xl border border-purple-500/20 bg-[#151020] p-6">
            <h3 className="text-lg font-semibold text-purple-300">
              AI Evaluation Summary
            </h3>

            <p className="mt-3 leading-7 text-gray-300">
              {interview.evaluation.summary}
            </p>
          </div>

        </section>
      )}
      <h2 className="mb-4 mt-10 text-xl font-semibold">
        Candidate Answers
      </h2>

      <div className="space-y-5">
        {interview.answers.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl border border-purple-500/20 bg-[#151020] p-6"
          >
            <p className="text-sm text-purple-400">
              Question {index + 1}
            </p>

            <h3 className="mt-2 font-semibold">
              {item.question}
            </h3>

            <p className="mt-4 text-gray-300">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
export default function InterviewDetails() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#090611] p-10 text-purple-300">
        Loading interview...
      </main>
    }>
      <InterviewDetailsContent />
    </Suspense>
  );
}