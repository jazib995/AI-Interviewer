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