"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
const stats = [
  { label: "Total Interviews", value: "01", icon: "📋" },
  { label: "Completed", value: "01", icon: "✓" },
  { label: "Pending Review", value: "01", icon: "◷" },
  { label: "Active Jobs", value: "00", icon: "💼" },
];

export default function RecruiterDashboard() {
  const router = useRouter();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        <button className="rounded-xl bg-purple-600 px-5 py-3 font-medium transition hover:bg-purple-500">
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

      {/* Interviews */}
      <section className="mt-10 rounded-2xl border border-purple-500/20 bg-[#151020] p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Recent Interviews</h2>
          <p className="mt-1 text-sm text-gray-400">
            Review candidate interview activity.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="border-b border-purple-500/20 text-sm text-gray-400">
                <th className="pb-4">Candidate</th>
                <th className="pb-4">Position</th>
                <th className="pb-4">Interview Type</th>
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
                interviews.map((interview) => (
                  <tr
                    key={interview.id}
                    className="border-b border-purple-500/10"
                  >
                    <td className="py-5 font-medium">
                      Candidate #{interview.id.slice(-5)}
                    </td>

                    <td className="py-5 text-gray-300">{interview.role}</td>

                    <td className="py-5 text-gray-300">
                      {interview.interview_type}
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
