
"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("Not connected yet");
  const [loading, setLoading] = useState(false);

  async function connectBackend() {
    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/");

      const data = await response.json();

      setMessage(data.message);
    } catch (error) {
      setMessage("Backend connection failed!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">
        AI Voice Interviewer
      </h1>

      <p className="text-lg">
        Backend Response: {message}
      </p>

      <button
        onClick={connectBackend}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        {loading ? "Connecting..." : "Connect to Python Backend"}
      </button>
    </main>
  );
}
