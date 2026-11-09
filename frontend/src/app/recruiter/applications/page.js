"use client";

import { useEffect, useState } from "react";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState("all");

  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch("http://127.0.0.1:8000/applications");

        if (!response.ok) {
          throw new Error("Failed to fetch applications.");
        }

        const data = await response.json();
        setApplications(data.applications || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  const jobs = [
    ...new Map(
      applications.map((app) => [
        app.job_id,
        { id: app.job_id, title: app.job_title },
      ]),
    ).values(),
  ];

  const filteredApplications =
    selectedJob === "all"
      ? applications
      : applications.filter((app) => app.job_id === selectedJob);

  async function updateApplicationStatus(applicationId, newStatus) {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update application status.");
      }

      setApplications((previous) =>
        previous.map((application) =>
          application.id === applicationId
            ? { ...application, status: newStatus }
            : application,
        ),
      );
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#080611] text-white p-6 md:p-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-700/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-purple-400 text-sm font-medium mb-3">
            <span className="w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_#a855f7]" />
            RECRUITER WORKSPACE
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Job <span className="text-purple-400">Applications</span>
          </h1>

          <p className="text-gray-400 mt-3 max-w-2xl">
            Review candidate applications, explore their profiles and track
            incoming talent across your job openings.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#171027] to-[#0d0a18] border border-purple-500/20 rounded-2xl p-5 shadow-[0_0_25px_rgba(147,51,234,0.06)]">
            <p className="text-gray-400 text-sm">Total Applications</p>
            <h2 className="text-3xl font-bold mt-2 text-white">
              {applications.length}
            </h2>
            <p className="text-purple-400 text-xs mt-2">
              Across all job openings
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#171027] to-[#0d0a18] border border-purple-500/20 rounded-2xl p-5 shadow-[0_0_25px_rgba(147,51,234,0.06)]">
            <p className="text-gray-400 text-sm">Pending Review</p>
            <h2 className="text-3xl font-bold mt-2 text-white">
              {applications.filter((app) => app.status === "pending").length}
            </h2>
            <p className="text-violet-400 text-xs mt-2">
              Waiting for recruiter review
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold">Candidate Applications</h2>
            <p className="text-gray-500 text-sm mt-1">
              {filteredApplications.length} results found
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Filter by job</span>

            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="bg-[#171027] border border-purple-500/30 text-white rounded-xl px-4 py-3 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
            >
              <option value="all">All Jobs</option>

              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Applications */}
        <div className="space-y-4">
          {loading && (
            <div className="bg-[#110d1d] border border-purple-500/20 rounded-2xl p-10 text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading applications...</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && filteredApplications.length === 0 && (
            <div className="bg-gradient-to-br from-[#151020] to-[#0d0a16] border border-purple-500/20 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-5 text-purple-400 text-2xl">
                ◈
              </div>

              <h3 className="text-xl font-semibold">No Applications Found</h3>

              <p className="text-gray-400 mt-2">
                {selectedJob === "all"
                  ? "Applications submitted for your job openings will appear here."
                  : "No candidates have applied for this job yet."}
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            filteredApplications.map((application) => (
              <div
                key={application.id}
                className="group bg-gradient-to-r from-[#151020] via-[#110d1c] to-[#0d0a16] border border-purple-500/15 hover:border-purple-400/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(147,51,234,0.09)]"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-purple-600/30 to-violet-900/30 border border-purple-500/30 flex items-center justify-center text-purple-300 text-lg font-bold">
                      {application.candidate_name?.charAt(0)?.toUpperCase() ||
                        "?"}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {application.candidate_name}
                      </h3>

                      <p className="text-gray-400 text-sm mt-1">
                        {application.candidate_email}
                      </p>

                      <p className="text-gray-400 text-sm mt-1">
                        {application.phone}
                      </p>
                    </div>
                  </div>

                  <select
                    value={application.status}
                    onChange={(e) =>
                      updateApplicationStatus(application.id, e.target.value)
                    }
                    className={`self-start text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-lg border outline-none cursor-pointer transition-all ${
                      application.status === "shortlisted"
                        ? "bg-green-500/10 text-green-400 border-green-500/30"
                        : application.status === "rejected"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : "bg-purple-500/10 text-purple-300 border-purple-500/30"
                    }`}
                  >
                    <option value="pending" className="bg-[#110d1d] text-white">
                      Pending
                    </option>

                    <option
                      value="shortlisted"
                      className="bg-[#110d1d] text-white"
                    >
                      Shortlisted
                    </option>

                    <option
                      value="rejected"
                      className="bg-[#110d1d] text-white"
                    >
                      Rejected
                    </option>
                  </select>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                      Applied For
                    </p>
                    <p className="text-sm font-medium text-purple-300">
                      {application.job_title}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                      Application Date
                    </p>
                    <p className="text-sm text-gray-300">
                      {application.created_at
                        ? new Date(application.created_at).toLocaleDateString()
                        : "Date unavailable"}
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={`http://127.0.0.1:8000/applications/${application.id}/resume`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400 transition-all text-sm font-medium"
                    >
                      <span>↗</span>
                      View CV
                    </a>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
