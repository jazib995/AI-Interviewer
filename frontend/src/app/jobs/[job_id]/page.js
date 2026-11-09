
"use client";

import { useEffect, useState,Suspense} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

function JobDetailsContent() {
  const params = useParams();
  const router = useRouter();

  const jobId = params.job_id;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/jobs/${jobId}`
        );

        if (!response.ok) {
          throw new Error("Job not found.");
        }

        const data = await response.json();
        setJob(data.job || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090611] flex items-center justify-center text-gray-400">
        Loading job details...
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="min-h-screen bg-[#090611] flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold">Job Not Found</h1>
        <Link href="/jobs" className="mt-5 text-purple-400">
          Back to Jobs
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090611] text-white">
      <nav className="border-b border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-5xl justify-between">
          <Link href="/" className="text-xl font-bold">
            <span className="text-purple-400">AI</span> Interviewer
          </Link>

          <Link href="/jobs" className="text-sm text-gray-300 hover:text-white">
            Browse Jobs
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <Link
          href="/jobs"
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          ← Back to Jobs
        </Link>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-12">
          <span className="rounded-full bg-green-500/10 px-4 py-2 text-xs text-green-300">
            Active Position
          </span>

          <h1 className="mt-6 text-4xl font-bold">
            {job.title}
          </h1>

          <p className="mt-3 text-purple-300">
            {job.department}
          </p>

          <div className="mt-8 grid gap-4 border-y border-white/10 py-6 sm:grid-cols-2">
            <p className="text-gray-300">
              📍 {job.location || "Not specified"}
            </p>

            <p className="text-gray-300">
              💼 {job.job_type || "Not specified"}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold">About This Position</h2>
            <p className="mt-4 whitespace-pre-line leading-8 text-gray-400">
              {job.description || "No description provided."}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold">Requirements</h2>
            <p className="mt-4 whitespace-pre-line leading-8 text-gray-400">
              {job.requirements || "No specific requirements provided."}
            </p>
          </div>

          <button
            onClick={() => router.push(`/apply/${job.id}`)}
            className="mt-10 w-full rounded-xl bg-purple-600 py-4 font-semibold transition hover:bg-purple-500 md:w-auto md:px-12"
          >
            Apply Now →
          </button>
        </div>
      </section>
    </main>
  );
}
export default function JobDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#090611] flex items-center justify-center text-gray-400">
          Loading job details...
        </main>
      }
    >
      <JobDetailsContent />
    </Suspense>
  );
}