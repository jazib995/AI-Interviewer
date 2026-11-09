"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

function ApplicationContent() {
  const params = useParams();
  const jobId = params.job_id;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await fetch(`http://127.0.0.1:8000/jobs/${jobId}`);

        if (!response.ok) {
          throw new Error("Unable to find this job.");
        }

        const data = await response.json();
        setJob(data.job);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (jobId) fetchJob();
  }, [jobId]);

  function handleResumeChange(event) {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF or Word document.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Resume must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setResume(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!resume) {
      alert("Please upload your resume.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setSuccessMessage("");

    try {
      const formData = new FormData();

      formData.append("job_id", jobId);
      formData.append("full_name", fullName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("cover_letter", coverLetter);
      formData.append("resume", resume);

      const response = await fetch("http://127.0.0.1:8000/applications", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Application submission failed.");
      }

      setSuccessMessage("Your application has been submitted successfully!");

      setFullName("");
      setEmail("");
      setPhone("");
      setCoverLetter("");
      setResume(null);

      event.target.reset();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090611] flex items-center justify-center text-gray-400">
        Loading application form...
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="min-h-screen bg-[#090611] flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold">Job Not Found</h1>
        <Link href="/jobs" className="mt-5 text-purple-400">
          Browse Available Jobs
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090611] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            <span className="text-purple-400">AI</span> Interviewer
          </Link>

          <Link href="/jobs" className="text-sm text-gray-300 hover:text-white">
            Browse Jobs
          </Link>
        </div>
      </nav>

      {/* Page */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <Link
          href={`/jobs/${jobId}`}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          ← Back to Job Details
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Application Form */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl md:p-10">
            <div className="mb-9">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
                Candidate Application
              </p>

              <h1 className="mt-3 text-3xl font-bold md:text-4xl">
                Apply for this position
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                Complete your information below to submit your application. Make
                sure your contact details are correct.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Personal Information */}
              <div>
                <h2 className="mb-5 text-lg font-semibold">
                  Personal Information
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">
                      Full Name *
                    </label>

                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm text-gray-300">
                        Email Address *
                      </label>

                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-300">
                        Phone Number *
                      </label>

                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+92 300 1234567"
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              {/* Resume Upload */}
              <div>
                <h2 className="mb-2 text-lg font-semibold">Resume / CV</h2>

                <p className="mb-5 text-sm text-gray-400">
                  Upload your latest resume in PDF or Word format. Maximum size:
                  5 MB.
                </p>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-400/30 bg-purple-500/[0.04] px-6 py-10 text-center transition hover:border-purple-400/70 hover:bg-purple-500/[0.08]">
                  <span className="mb-3 text-4xl">📄</span>

                  <span className="font-medium text-purple-200">
                    {resume ? "Resume Selected" : "Click to upload your CV"}
                  </span>

                  <span className="mt-2 text-xs text-gray-500">
                    PDF, DOC or DOCX
                  </span>

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                </label>

                {resume && (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-green-400/20 bg-green-400/5 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-green-300">
                        {resume.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {(resume.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setResume(null)}
                      className="ml-3 text-sm text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="h-px bg-white/10" />

              {/* Cover Letter */}
              <div>
                <h2 className="mb-2 text-lg font-semibold">
                  Cover Letter
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    Optional
                  </span>
                </h2>

                <textarea
                  rows={5}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're interested in this position..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
                />
              </div>

              {/* Submit */}
              {successMessage && (
                <div className="rounded-xl border border-green-400/20 bg-green-400/10 p-4 text-sm text-green-300">
                  ✓ {successMessage}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-4 font-semibold shadow-lg shadow-purple-900/20 transition hover:from-purple-500 hover:to-violet-500 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Application →"}
              </button>

              <p className="text-center text-xs text-gray-500">
                Your information will be shared with the recruiter for this
                position.
              </p>
            </form>
          </div>

          {/* Job Sidebar */}
          <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-7 lg:sticky lg:top-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
              Applying For
            </p>

            <h2 className="mt-4 text-2xl font-bold">{job.title}</h2>

            <p className="mt-2 text-purple-300">{job.department}</p>

            <div className="my-6 space-y-4 border-y border-white/10 py-6 text-sm text-gray-400">
              <p>📍 {job.location || "Location not specified"}</p>
              <p>💼 {job.job_type || "Not specified"}</p>
              <p>🟢 Currently accepting applications</p>
            </div>

            <h3 className="font-semibold">About the Position</h3>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-400">
              {job.description || "No description available."}
            </p>

            <div className="mt-7 rounded-2xl border border-purple-400/20 bg-purple-500/[0.07] p-4">
              <p className="text-sm font-semibold text-purple-200">
                AI-Powered Interview
              </p>

              <p className="mt-2 text-xs leading-6 text-gray-400">
                Shortlisted candidates may receive an invitation to complete an
                AI-powered interview.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function ApplicationPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#090611] text-gray-400">
          Loading application form...
        </main>
      }
    >
      <ApplicationContent />
    </Suspense>
  );
}
