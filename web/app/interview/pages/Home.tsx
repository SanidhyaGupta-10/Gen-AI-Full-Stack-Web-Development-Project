"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";

// ─── Glass Card ──────────────────────────────────────────────
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-lg shadow-white/5 ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────
function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      />
    </svg>
  );
}

// ─── Main UI ─────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();

  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);

    if (!jobDescription.trim()) return setError("Please paste a job description.");
    if (!selfDescription.trim()) return setError("Please describe yourself.");
    if (!resumeFile) return setError("Please upload your resume PDF.");

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resumeFile);

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const cleanBaseUrl = baseUrl?.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
      const { data } = await axios.post(
        `${cleanBaseUrl}/interview`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      // Navigate to the report page using the real MongoDB _id
      const reportId =
        data?.interviewReport?._id ?? data?.data?._id ?? data?._id;

      if (!reportId) throw new Error("Server did not return a report ID.");

      router.push(`/interview/${reportId}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 mt-20 pb-5 relative">

      {/* ── Background Grid ── */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(168,85,247,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Header ── */}
      <motion.div
        className="text-center mb-10 max-w-xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <span className="inline-block mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-300 text-xs font-semibold uppercase tracking-widest">
          AI Interview Engine
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
          Land Your{" "}
          <span className="bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Dream Job
          </span>
        </h1>
        <p className="text-white/40 text-sm">
          Upload your resume, describe the role, and get a personalized interview report.
        </p>
      </motion.div>

      {/* ── Inputs Grid ── */}
      <motion.div
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Job Description */}
        <GlassCard className="h-full p-5 flex flex-col">
          <h2 className="text-white font-semibold text-sm mb-2">Job Description</h2>
          <textarea
            id="jobDescription"
            rows={8}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job listing..."
            className="w-full bg-transparent text-white/70 placeholder-white/30 text-sm rounded-lg p-2 resize-none outline-none border border-white/10 focus:bg-white/10 focus:border-white/20 font-mono"
          />
        </GlassCard>

        {/* Right Column */}
        <div className="flex flex-col gap-5">
          {/* Resume Upload */}
          <GlassCard className="p-5">
            <h2 className="text-white font-semibold text-sm mb-2">Upload Resume</h2>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
              className="w-full py-4 px-3 border border-dashed border-white/10 rounded-xl bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60 transition-all text-sm"
            />
            {resumeFile && (
              <p className="mt-2 text-xs text-emerald-400/80 truncate">
                ✅ {resumeFile.name}
              </p>
            )}
          </GlassCard>

          {/* Self Description */}
          <GlassCard className="flex-1 p-5 flex flex-col">
            <h2 className="text-white font-semibold text-sm mb-2">About You</h2>
            <textarea
              id="selfDescription"
              rows={5}
              value={selfDescription}
              onChange={(e) => setSelfDescription(e.target.value)}
              placeholder="Your background & skills..."
              className="w-full bg-transparent text-white/70 placeholder-white/30 text-sm rounded-lg p-2 resize-none outline-none border border-white/10 focus:bg-white/10 focus:border-white/20 font-mono"
            />
          </GlassCard>
        </div>
      </motion.div>

      {/* ── Error ── */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-rose-400 text-sm text-center"
        >
          ⚠️ {error}
        </motion.p>
      )}

      {/* ── Generate Button ── */}
      <motion.button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 w-full max-w-sm h-12 rounded-xl text-sm font-semibold bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        whileTap={{ scale: 0.97 }}
      >
        {loading ? (
          <>
            <Spinner />
            Generating Report…
          </>
        ) : (
          "Generate Interview Report"
        )}
      </motion.button>

      {/* ── Loading overlay hint ── */}
      {loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-white/30 text-xs text-center"
        >
          AI is analyzing your profile — this takes ~15 seconds ⏳
        </motion.p>
      )}
    </main>
  );
}