"use client";

import { useEffect, useState } from "react";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState("all");
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

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

  async function generateApplicationInvite(applicationId) {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/applications/${applicationId}/invite`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate invitation.");
      }

      await navigator.clipboard.writeText(data.invite_link);

      alert(`Invitation generated and copied!\n\n${data.invite_link}`);
    } catch (err) {
      alert(err.message);
    }
  }

  async function viewInterviewResults(applicationId) {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/applications/${applicationId}/interview`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Interview results not found.");
      }

      setSelectedInterview(data);
      setShowInterviewModal(true);
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

                    {application.status === "shortlisted" && (
                      <button
                        onClick={() =>
                          generateApplicationInvite(application.id)
                        }
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400 transition-all text-sm font-medium"
                      >
                        ✉ Invite to Interview
                      </button>
                    )}

                    <button
                      onClick={() => viewInterviewResults(application.id)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 transition-all text-sm font-medium"
                    >
                      View Interview Results
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      {showInterviewModal && selectedInterview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-cyan-400/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Interview Results
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  AI-powered candidate evaluation
                </p>
              </div>

              <button
                onClick={() => setShowInterviewModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">
                {selectedInterview.candidate_name}
              </h3>
              <p className="text-gray-400">
                {selectedInterview.role} · {selectedInterview.interview_type}{" "}
                Interview
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Difficulty: {selectedInterview.difficulty}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                {
                  label: "Overall Score",
                  score: selectedInterview.evaluation.overall_score,
                },
                {
                  label: "Technical Knowledge",
                  score: selectedInterview.evaluation.technical_knowledge_score,
                },
                {
                  label: "Communication",
                  score: selectedInterview.evaluation.communication_score,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-[#1f2937] rounded-xl p-5 border border-gray-700"
                >
                  <p className="text-gray-400 text-sm">{item.label}</p>

                  <p className="text-3xl font-bold text-cyan-400 mt-2">
                    {item.score}/100
                  </p>

                  <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                    <div
                      className="bg-cyan-400 h-2 rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, Number(item.score) || 0))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#1f2937] rounded-xl p-5 mb-6">
              <h3 className="text-white font-semibold text-lg mb-3">
                AI Evaluation Summary
              </h3>

              <p className="text-gray-300 leading-7">
                {selectedInterview.evaluation.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#1f2937] rounded-xl p-5">
                <h3 className="text-green-400 font-semibold mb-3">Strengths</h3>

                {selectedInterview.evaluation.strengths?.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    {selectedInterview.evaluation.strengths.map(
                      (item, index) => (
                        <li key={index}>{item}</li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No strengths identified.
                  </p>
                )}
              </div>

              <div className="bg-[#1f2937] rounded-xl p-5">
                <h3 className="text-red-400 font-semibold mb-3">Weaknesses</h3>

                {selectedInterview.evaluation.weaknesses?.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    {selectedInterview.evaluation.weaknesses.map(
                      (item, index) => (
                        <li key={index}>{item}</li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No weaknesses identified.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold text-lg mb-4">
                Questions & Candidate Answers
              </h3>

              <div className="space-y-4">
                {selectedInterview.answers?.map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#1f2937] rounded-xl p-5 border border-gray-700"
                  >
                    <p className="text-cyan-400 text-sm font-semibold mb-2">
                      Question {index + 1}
                    </p>

                    <p className="text-white mb-4">{item.question}</p>

                    <p className="text-gray-400 text-sm mb-1">
                      Candidate's Answer
                    </p>

                    <p className="text-gray-300">
                      {item.answer || "No answer provided."}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setShowInterviewModal(false)}
                className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition"
              >
                Close Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
