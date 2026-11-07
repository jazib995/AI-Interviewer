"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function RecruiterDashboard() {
  const router = useRouter();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [jobs, setJobs] = useState([]);
  const stats = [
    {
      label: "Total Interviews",
      value: interviews.length,
      icon: "📋",
    },
    {
      label: "Completed",
      value: interviews.filter((i) => i.status === "completed").length,
      icon: "✓",
    },
    {
      label: "Evaluated",
      value: interviews.filter((i) => i.evaluation).length,
      icon: "◷",
    },
    {
      label: "Active Jobs",
      value: jobs.filter((job) => job.status === "active").length,
      icon: "💼",
    },
  ];

  const sortedInterviews = [...interviews].sort((a, b) => {
    if (sortBy === "score") {
      const scoreA = a.evaluation?.overall_score ?? -1;
      const scoreB = b.evaluation?.overall_score ?? -1;

      return scoreB - scoreA;
    }

    if (sortBy === "recent") {
      return b.id.localeCompare(a.id);
    }

    return 0;
  });

  useEffect(() => {
    async function fetchInterviews() {
      try {
        const response = await fetch("http://127.0.0.1:8000/interviews");

        if (!response.ok) {
          throw new Error("Failed to fetch interviews.");
        }

        const data = await response.json();

        setInterviews(data.interviews);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInterviews();
  }, []);
  useEffect(() => {
  async function fetchJobs() {
    try {
      const response = await fetch("http://127.0.0.1:8000/jobs");

      if (!response.ok) {
        throw new Error("Failed to fetch jobs.");
      }

      const data = await response.json();
      setJobs(data.jobs);
    } catch (err) {
      console.error("Jobs error:", err);
    }
  }

  fetchJobs();
}, []);
  return (
    <main className="min-h-screen bg-[#090611] p-6 text-white md:p-10">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-purple-400">RECRUITER WORKSPACE</p>
          <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-400">
            Manage interviews and discover top talent.
          </p>
        </div>

        <button
          onClick={() => router.push("/recruiter/jobs/create")}
          className="..."
        >
          + Create Job
        </button>
      </header>

      {/* Statistics */}
      <section className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-purple-500/20 bg-[#151020] p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">{stat.label}</p>
              <span className="text-xl">{stat.icon}</span>
            </div>

            <h2 className="mt-5 text-3xl font-bold">{stat.value}</h2>
          </div>
        ))}
      </section>
      <section className="mb-10">
  <div className="mb-6">
    <h2 className="text-xl font-semibold mt-5">Active Job Openings</h2>
    <p className="mt-1 text-sm text-gray-400">
      Manage your currently available positions.
    </p>
  </div>

  {jobs.length === 0 ? (
    <div className="rounded-2xl border border-purple-500/20 bg-white/5 p-8 text-center">
      <p className="text-gray-400">No jobs created yet.</p>
    </div>
  ) : (
    <div className="grid gap-5 md:grid-cols-2">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="rounded-2xl border border-purple-500/20 bg-white/5 p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold">{job.title}</h3>

            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
              {job.status}
            </span>
          </div>

          <p className="mt-2 text-sm text-purple-300">
            {job.department}
          </p>

          <p className="mt-4 text-sm text-gray-400">
            {job.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-xs text-gray-400">
            <span>📍 {job.location}</span>
            <span>💼 {job.job_type}</span>
          </div>
        </div>
      ))}
    </div>
  )}
</section>

      {/* Interviews */}
      <section className="mt-10 rounded-2xl border border-purple-500/20 bg-[#151020] p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Candidate Rankings</h2>
            <p className="mt-1 text-sm text-gray-400">
              Compare candidates based on their AI evaluation scores.
            </p>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-purple-500/30 bg-[#090611] px-4 py-3 text-sm text-white outline-none"
          >
            <option value="score">Highest Score First</option>
            <option value="recent">Most Recent First</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="border-b border-purple-500/20 text-sm text-gray-400">
                <th className="pb-4">Rank</th>
                <th className="pb-4">Candidate</th>
                <th className="pb-4">Position</th>
                <th className="pb-4">Interview Type</th>
                <th className="pb-4">AI Score</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-purple-300">
                    Loading interviews...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              ) : interviews.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">
                    No interviews found.
                  </td>
                </tr>
              ) : (
                sortedInterviews.map((interview, index) => (
                  <tr
                    key={interview.id}
                    className="border-b border-purple-500/10"
                  >
                    <td className="py-4 font-semibold text-purple-300">
                      #{index + 1}
                    </td>
                    <td className="py-5 font-medium">
                      Candidate #{interview.id.slice(-5)}
                    </td>

                    <td className="py-5 text-gray-300">{interview.role}</td>

                    <td className="py-5 text-gray-300">
                      {interview.interview_type}
                    </td>
                    <td className="py-4">
                      {interview.evaluation?.overall_score != null ? (
                        <span className="rounded-full bg-purple-500/15 px-3 py-1 text-sm font-semibold text-purple-300">
                          {interview.evaluation.overall_score}/100
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Not evaluated
                        </span>
                      )}
                    </td>

                    <td className="py-5">
                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                        {interview.status}
                      </span>
                    </td>

                    <td className="py-5">
                      <button
                        onClick={() =>
                          router.push(`/recruiter/${interview.id}`)
                        }
                        className="text-purple-400 hover:text-purple-300"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
