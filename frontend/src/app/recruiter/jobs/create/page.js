"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateJobPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    description: "",
    requirements: "",
    location: "",
    job_type: "Full-time",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create job.");
      }

      router.push("/recruiter");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#090611] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">

        <button
          onClick={() => router.back()}
          className="mb-8 text-sm text-purple-300 hover:text-white"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold">
          Create a New Job
        </h1>

        <p className="mt-2 text-gray-400">
          Add the details of your job opening.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border border-purple-500/20 bg-white/5 p-8"
        >
          <div>
            <label className="mb-2 block text-sm">Job Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Software Engineer"
              className="w-full rounded-xl border border-purple-500/20 bg-black/30 p-3 outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Department</label>
            <input
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              placeholder="e.g. Engineering"
              className="w-full rounded-xl border border-purple-500/20 bg-black/30 p-3 outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Job Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the responsibilities..."
              className="w-full rounded-xl border border-purple-500/20 bg-black/30 p-3 outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Requirements</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              required
              rows={4}
              placeholder="List required skills and qualifications..."
              className="w-full rounded-xl border border-purple-500/20 bg-black/30 p-3 outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g. Remote / Lahore"
              className="w-full rounded-xl border border-purple-500/20 bg-black/30 p-3 outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Job Type</label>
            <select
              name="job_type"
              value={formData.job_type}
              onChange={handleChange}
              className="w-full rounded-xl border border-purple-500/20 bg-[#110b1c] p-3 outline-none focus:border-purple-500"
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Internship</option>
              <option>Contract</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-purple-600 py-3 font-semibold transition hover:bg-purple-500 disabled:opacity-50"
          >
            {loading ? "Creating Job..." : "Create Job"}
          </button>
        </form>
      </div>
    </main>
  );
}