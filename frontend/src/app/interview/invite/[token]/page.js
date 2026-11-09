"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";

function InvitationContent() {
  const { token } = useParams();
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidate, setCandidate] = useState(null);
  const [applicationId, setApplicationId] = useState(null);

  useEffect(() => {
    async function validateInvitation() {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/interview/invite/${token}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "This invitation is invalid or expired.",
          );
        }

        setJob(data.job);
        

        setCandidate({
          name: data.candidate_name,
          email: data.candidate_email,
        });

        setApplicationId(data.application_id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (token) validateInvitation();
  }, [token]);

  function startInterview() {
    if (!candidateName.trim() || !candidateEmail.trim()) {
      alert("Please enter your name and email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!job) return;

    setStarting(true);

    router.push(
      `/interview/workspace?role=${encodeURIComponent(job.title)}&type=Technical&difficulty=Intermediate&job_id=${encodeURIComponent(job.id)}&candidate_name=${encodeURIComponent(candidateName.trim())}&candidate_email=${encodeURIComponent(candidateEmail.trim())}&token=${encodeURIComponent(token)}&application_id=${encodeURIComponent(applicationId || "")}`,
    );
  }

  return (
    <main className="min-h-screen bg-[#090612] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-700/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 px-6 md:px-12 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-500/20">
              AI
            </div>

            <div>
              <h1 className="font-bold text-lg tracking-wide">
                Interview<span className="text-purple-400">AI</span>
              </h1>

              <p className="text-[10px] text-gray-500 tracking-[0.2em] uppercase">
                Intelligent Recruitment
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            AI Interview Platform
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20">
        {loading ? (
          <div className="text-center py-32">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-5" />
            <p className="text-gray-400">
              Verifying your interview invitation...
            </p>
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto text-center bg-white/[0.04] border border-white/10 rounded-3xl p-10 backdrop-blur-xl">
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-4xl mx-auto mb-6">
              ⚠
            </div>

            <h2 className="text-2xl font-bold mb-3">Invitation Unavailable</h2>

            <p className="text-gray-400 leading-7">{error}</p>

            <p className="text-gray-500 text-sm mt-5">
              Please contact the recruiter who shared this invitation.
            </p>
          </div>
        ) : job ? (
          <>
            {/* Hero */}
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 text-xs font-medium mb-7">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                VERIFIED INTERVIEW INVITATION
              </div>

              <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                Your next opportunity
                <span className="block bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                  starts here.
                </span>
              </h2>

              <p className="text-gray-400 mt-6 text-base md:text-lg leading-8">
                You've been invited to participate in an AI-powered interview.
                Take your time, showcase your skills, and let your abilities
                speak for themselves.
              </p>
            </div>

            {/* Job Card + AI Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
              {/* Job Information */}
              <section className="lg:col-span-2 bg-white/[0.04] border border-white/10 rounded-3xl p-7 md:p-9 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-2xl">
                    💼
                  </div>

                  <div>
                    <p className="text-xs text-purple-400 uppercase tracking-widest">
                      Position Details
                    </p>

                    <p className="text-gray-500 text-xs mt-1">
                      Interview opportunity
                    </p>
                  </div>
                </div>

                <h3 className="text-3xl font-bold mb-6">{job.title}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-9">
                  <div className="bg-white/[0.04] rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-gray-500 mb-2">Department</p>
                    <p className="text-sm font-medium">{job.department}</p>
                  </div>

                  <div className="bg-white/[0.04] rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-gray-500 mb-2">Location</p>
                    <p className="text-sm font-medium">{job.location}</p>
                  </div>

                  <div className="bg-white/[0.04] rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-gray-500 mb-2">Employment</p>
                    <p className="text-sm font-medium">{job.job_type}</p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-7">
                  <h4 className="font-semibold text-lg mb-3">About the Role</h4>

                  <p className="text-gray-400 text-sm leading-7 whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>

                <div className="border-t border-white/10 mt-7 pt-7">
                  <h4 className="font-semibold text-lg mb-3">Requirements</h4>

                  <p className="text-gray-400 text-sm leading-7 whitespace-pre-wrap">
                    {job.requirements}
                  </p>
                </div>
              </section>

              {/* AI Interview Card */}
              <aside className="bg-gradient-to-b from-purple-600/15 to-white/[0.03] border border-purple-400/20 rounded-3xl p-7 backdrop-blur-xl flex flex-col">
                <div className="text-center">
                  <div className="relative w-36 h-36 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl" />

                    <img
                      src="/images/hero-AI.png"
                      alt="AI Interviewer"
                      className="relative w-full h-full object-contain"
                    />
                  </div>

                  <p className="text-xs text-purple-300 tracking-widest uppercase">
                    Meet Your Interviewer
                  </p>

                  <h3 className="text-2xl font-bold mt-2">AI Assistant</h3>

                  <p className="text-sm text-gray-400 mt-3 leading-6">
                    Your AI interviewer will guide you through a structured
                    interview and evaluate your responses.
                  </p>
                </div>

                <div className="border-t border-white/10 my-7" />

                <h4 className="font-semibold mb-5">Interview Overview</h4>

                <div className="space-y-5 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      🎙️
                    </span>

                    <div>
                      <p className="text-sm font-medium">Voice Interview</p>
                      <p className="text-xs text-gray-500">
                        Speak your answers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      ❓
                    </span>

                    <div>
                      <p className="text-sm font-medium">5 Questions</p>
                      <p className="text-xs text-gray-500">
                        AI-generated questions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      📊
                    </span>

                    <div>
                      <p className="text-sm font-medium">AI Evaluation</p>
                      <p className="text-xs text-gray-500">
                        Performance assessment
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-white/[0.04] border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-gray-400 leading-6">
                    <span className="text-purple-300 font-semibold">Tip:</span>{" "}
                    Use a quiet environment, check your microphone, and answer
                    naturally.
                  </p>
                </div>
              </aside>
            </div>

            {/* Instructions */}
            <section className="mt-9 bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8">
              <h3 className="font-semibold text-lg mb-5">Before You Begin</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex gap-3">
                  <span className="text-xl">🎧</span>
                  <div>
                    <p className="text-sm font-medium">Check Your Audio</p>
                    <p className="text-xs text-gray-500 mt-1 leading-5">
                      Make sure your microphone is connected and working.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-xl">🌐</span>
                  <div>
                    <p className="text-sm font-medium">Stable Connection</p>
                    <p className="text-xs text-gray-500 mt-1 leading-5">
                      Use a reliable internet connection during the interview.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <p className="text-sm font-medium">Be Yourself</p>
                    <p className="text-xs text-gray-500 mt-1 leading-5">
                      Answer honestly and explain your thought process.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Candidate Information + Start Interview */}
            <div className="max-w-xl mx-auto mt-12 bg-white/[0.04] border border-white/10 rounded-3xl p-7 md:p-9">
              <div className="text-center mb-7">
                <h3 className="text-2xl font-bold">Ready to Begin?</h3>
                <p className="text-gray-400 text-sm mt-2">
                  Enter your details before starting the interview.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-purple-500 transition"
                  />
                </div>

                <button
                  onClick={startInterview}
                  disabled={starting}
                  className="w-full px-8 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 font-bold text-lg shadow-xl shadow-purple-900/30 transition-all hover:scale-[1.01]"
                >
                  {starting ? "Preparing Interview..." : "Start My Interview →"}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-5">
                Your information will be shared with the recruiter for this
                application.
              </p>
            </div>
          </>
        ) : null}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-7 px-6 text-center">
        <p className="text-xs text-gray-500">
          Powered by InterviewAI · Intelligent Recruitment Platform
        </p>
      </footer>
    </main>
  );
}

export default function InvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090612] text-purple-300 flex items-center justify-center">
          Loading invitation...
        </div>
      }
    >
      <InvitationContent />
    </Suspense>
  );
}
