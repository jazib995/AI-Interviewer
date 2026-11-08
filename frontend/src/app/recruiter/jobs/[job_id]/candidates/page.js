"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";

function JobCandidatesContent() {
  const { job_id } = useParams();
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [generatingLink, setGeneratingLink] = useState(false);

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/jobs/${job_id}/interviews`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch candidates.");
        }

        const data = await response.json();
        setJob(data.job);
        setInterviews(data.interviews);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (job_id) fetchCandidates();
  }, [job_id]);
  async function generateInviteLink() {
    try {
      setGeneratingLink(true);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/jobs/${job_id}/invite`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to generate invitation link.");
      }

      const data = await response.json();

      setInviteLink(data.invite_link);
    } catch (err) {
      setError(err.message);
    } finally {
      setGeneratingLink(false);
    }
  }

  const sortedInterviews = [...interviews].sort(
    (a, b) =>
      (b.evaluation?.overall_score ?? -1) - (a.evaluation?.overall_score ?? -1),
  );
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const comparisonCandidates = sortedInterviews.filter((interview) =>
    selectedCandidates.includes(interview.id),
  );

  const evaluatedCount = interviews.filter((item) => item.evaluation).length;

  const averageScore =
    evaluatedCount > 0
      ? Math.round(
          interviews.reduce(
            (total, item) => total + (item.evaluation?.overall_score ?? 0),
            0,
          ) / evaluatedCount,
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#090612] text-white px-6 py-8 md:px-12">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-700/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10">
          <div>
            <button
              onClick={() => router.push("/recruiter")}
              className="text-sm text-purple-300 hover:text-white mb-5 flex items-center gap-2 transition"
            >
              ← Back to Dashboard
            </button>

            <p className="text-xs uppercase tracking-[0.3em] text-purple-400 mb-2">
              Recruitment Management
            </p>

            <h1 className="text-3xl md:text-4xl font-bold">
              Candidate <span className="text-purple-400">Ranking</span>
            </h1>

            <p className="text-gray-400 mt-2">
              Review and compare candidates using AI-powered evaluations.
            </p>
          </div>

          <div className="bg-purple-500/10 border border-purple-400/20 rounded-2xl px-5 py-4">
            <p className="text-xs text-gray-400">JOB STATUS</p>
            <p className="text-purple-300 font-semibold mt-1">
              ● Active Recruitment
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-32 text-purple-300">
            Loading candidate information...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-300">
            {error}
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && job && (
          <>
            {/* Job Information */}
            <section className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 md:p-8 mb-8 backdrop-blur-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-xs text-purple-400 uppercase tracking-widest mb-3">
                    Current Job Opening
                  </p>

                  <h2 className="text-2xl md:text-3xl font-bold">
                    {job.title}
                  </h2>

                  <p className="text-gray-400 mt-3">
                    {job.department} <span className="mx-2">•</span>
                    {job.location} <span className="mx-2">•</span>
                    {job.job_type}
                  </p>
                </div>

                <div className="bg-purple-500/10 border border-purple-400/20 rounded-2xl px-6 py-5 min-w-40">
                  <p className="text-sm text-gray-400">Total Applicants</p>
                  <p className="text-4xl font-bold text-purple-300 mt-1">
                    {interviews.length}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={generateInviteLink}
                  disabled={generatingLink}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-5 py-3 rounded-xl font-medium text-sm transition"
                >
                  {generatingLink
                    ? "Generating..."
                    : "+ Generate Interview Link"}
                </button>

                {inviteLink && (
                  <button
                    onClick={() => navigator.clipboard.writeText(inviteLink)}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-3 rounded-xl text-sm transition"
                  >
                    Copy Invitation Link
                  </button>
                )}
              </div>

              {inviteLink && (
                <div className="mt-4 bg-purple-500/10 border border-purple-400/20 rounded-xl p-4">
                  <p className="text-xs text-purple-300 mb-2">
                    Your Interview Invitation Link
                  </p>

                  <p className="text-sm text-gray-200 break-all">
                    {inviteLink}
                  </p>
                </div>
              )}

              <div className="border-t border-white/10 mt-6 pt-5">
                <p className="text-gray-400 text-sm leading-7">
                  {job.description}
                </p>
              </div>
            </section>

            {/* Statistics */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                <p className="text-gray-400 text-sm">Total Candidates</p>
                <h3 className="text-3xl font-bold mt-3">{interviews.length}</h3>
                <p className="text-xs text-gray-500 mt-2">
                  Interviews received
                </p>
              </div>

              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                <p className="text-gray-400 text-sm">Evaluated Candidates</p>
                <h3 className="text-3xl font-bold text-cyan-300 mt-3">
                  {evaluatedCount}
                </h3>
                <p className="text-xs text-gray-500 mt-2">
                  AI evaluation completed
                </p>
              </div>

              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                <p className="text-gray-400 text-sm">Average AI Score</p>
                <h3 className="text-3xl font-bold text-purple-300 mt-3">
                  {averageScore}
                  <span className="text-lg text-gray-500">/100</span>
                </h3>
                <p className="text-xs text-gray-500 mt-2">
                  Across evaluated candidates
                </p>
              </div>
            </section>

            {/* Candidate Table */}
            <section className="bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
              <div className="p-6 md:p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Candidate Leaderboard</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Candidates ranked by their overall AI score.
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-400/20 px-4 py-2 rounded-full w-fit">
                    Highest score first
                  </span>

                  <button
                    disabled={selectedCandidates.length < 2}
                    onClick={() => setShowComparison(true)}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition"
                  >
                    Compare Candidates ({selectedCandidates.length})
                  </button>
                </div>
              </div>

              {sortedInterviews.length === 0 ? (
                <div className="text-center py-20 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-3xl mx-auto mb-5">
                    👥
                  </div>

                  <h3 className="text-xl font-semibold">No candidates yet</h3>

                  <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
                    Candidates who complete interviews through this job's
                    invitation link will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[750px]">
                    <thead className="bg-white/[0.03] text-gray-400 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-5">Select</th>
                        <th className="px-6 py-5">Rank</th>
                        <th className="px-6 py-5">Candidate</th>
                        <th className="px-6 py-5">Interview Type</th>
                        <th className="px-6 py-5">AI Score</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.06]">
                      {sortedInterviews.map((interview, index) => {
                        const score = interview.evaluation?.overall_score;

                        return (
                          <tr
                            key={interview.id}
                            className="hover:bg-purple-500/[0.06] transition"
                          >
                            <td className="px-6 py-5">
                              <input
                                type="checkbox"
                                checked={selectedCandidates.includes(
                                  interview.id,
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCandidates((prev) => [
                                      ...prev,
                                      interview.id,
                                    ]);
                                  } else {
                                    setSelectedCandidates((prev) =>
                                      prev.filter((id) => id !== interview.id),
                                    );
                                  }
                                }}
                                className="w-4 h-4 accent-purple-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-5">
                              <span className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-300 flex items-center justify-center font-bold">
                                #{index + 1}
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center font-bold">
                                  C
                                </div>

                                <div>
                                  <p className="font-medium">
                                    {interview.candidate_name ||
                                      `Candidate #${interview.id.slice(-5)}`}
                                  </p>

                                  <p className="text-xs text-gray-400 mt-1">
                                    {interview.candidate_email ||
                                      "Email not available"}
                                  </p>

                                  <p className="text-xs text-gray-500 mt-1">
                                    {interview.role}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5 text-gray-300 text-sm">
                              {interview.interview_type}
                            </td>

                            <td className="px-6 py-5">
                              {score !== undefined ? (
                                <div>
                                  <p className="font-bold text-purple-300">
                                    {score}/100
                                  </p>
                                  <div className="w-24 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                                    <div
                                      className="h-full bg-purple-500 rounded-full"
                                      style={{
                                        width: `${Math.min(100, Math.max(0, score))}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500 text-sm">
                                  Not evaluated
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-5">
                              <span className="text-xs px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                Completed
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <button
                                onClick={() =>
                                  router.push(`/recruiter/${interview.id}`)
                                }
                                className="text-purple-300 hover:text-white text-sm font-medium transition"
                              >
                                View Report →
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            {/* Candidate Comparison Modal */}
            {showComparison && (
              <section className="mt-8 bg-white/[0.04] border border-purple-400/20 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Candidate Comparison</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Compare candidate performance side by side.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowComparison(false)}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Close ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {comparisonCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
                    >
                      <h3 className="font-bold text-lg">
                        {candidate.candidate_name || "Unknown Candidate"}
                      </h3>

                      <p className="text-sm text-gray-400 mt-1">
                        {candidate.candidate_email || "Email not available"}
                      </p>

                      <div className="mt-5 space-y-3">
                        <p className="text-purple-300 font-semibold">
                          Overall Score:{" "}
                          {candidate.evaluation?.overall_score ?? "N/A"}/100
                        </p>

                        <p className="text-sm text-gray-300">
                          Technical Knowledge:{" "}
                          {candidate.evaluation?.technical_knowledge_score ??
                            "N/A"}
                          /100
                        </p>

                        <p className="text-sm text-gray-300">
                          Communication:{" "}
                          {candidate.evaluation?.communication_score ?? "N/A"}
                          /100
                        </p>
                      </div>

                      <div className="mt-5">
                        <h4 className="text-green-400 font-semibold text-sm mb-2">
                          Strengths
                        </h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {(candidate.evaluation?.strengths || []).map(
                            (item, index) => (
                              <li key={index}>• {item}</li>
                            ),
                          )}
                        </ul>
                      </div>

                      <div className="mt-5">
                        <h4 className="text-red-400 font-semibold text-sm mb-2">
                          Weaknesses
                        </h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {(candidate.evaluation?.weaknesses || []).map(
                            (item, index) => (
                              <li key={index}>• {item}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function JobCandidatesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090612] text-purple-300 flex items-center justify-center">
          Loading candidates...
        </div>
      }
    >
      <JobCandidatesContent />
    </Suspense>
  );
}
