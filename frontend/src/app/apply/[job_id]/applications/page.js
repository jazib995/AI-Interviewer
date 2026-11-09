"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ApplicationsPage() {
  const params = useParams();
  const jobId = params.job_id;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
  async function fetchApplications() {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/jobs/${jobId}/applications`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications.");
      }

      const data = await response.json();

      setApplications(data.applications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (jobId) {
    fetchApplications();
  }
}, [jobId]);

  return (
    <div className="min-h-screen bg-[#080b14] text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">Job Applications</h1>

        <p className="text-gray-400 mt-2">
          Review and manage applications received for this job.
        </p>
      </div>
    </div>
  );
}
