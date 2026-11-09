
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("http://127.0.0.1:8000/jobs");

        if (!response.ok) {
          throw new Error("Unable to load jobs.");
        }

        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  return (
    <main className="min-h-screen bg-[#090611] text-white">
      <nav className="border-b border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            <span className="text-purple-400">AI</span> Interviewer
          </Link>

          <Link
            href="/"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Home
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
            Find Your Opportunity
          </p>

          <h1 className="text-4xl font-bold md:text-6xl">
            Explore Open Positions
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-gray-400">
            Discover opportunities, apply for jobs, and take the next
            step in your career with AI-powered interviews.
          </p>
        </div>

        {loading && (
          <p className="py-16 text-center text-gray-400">
            Loading available jobs...
          </p>
        )}

        {error && (
          <p className="py-16 text-center text-red-400">
            {error}
          </p>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <h2 className="text-2xl font-semibold">
              No Open Positions Yet
            </h2>
            <p className="mt-3 text-gray-400">
              New opportunities will appear here when companies publish jobs.
            </p>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:border-purple-500/40 hover:bg-white/[0.06]"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {job.title}
                    </h2>

                    <p className="mt-2 text-sm text-purple-300">
                      {job.department}
                    </p>
                  </div>

                  <span className="rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-xs text-green-300">
                    Active
                  </span>
                </div>

                <div className="mb-5 space-y-2 text-sm text-gray-400">
                  <p>📍 {job.location || "Location not specified"}</p>
                  <p>💼 {job.job_type || "Not specified"}</p>
                </div>

                <p className="mb-7 line-clamp-3 text-sm leading-6 text-gray-400">
                  {job.description}
                </p>

                <Link
                  href={`/jobs/${job.id}`}
                  className="block rounded-xl border border-purple-400/30 bg-purple-500/10 px-5 py-3 text-center text-sm font-semibold text-purple-200 transition hover:bg-purple-500/20"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
