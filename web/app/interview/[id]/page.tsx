"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useParams } from "next/navigation";

// ─── Types ──────────────────────────────────────────────────
interface TechnicalQuestion {
    question: string;
    intention: string;
    answer: string;
}

interface BehavioralQuestion {
    question: string;
    intention: string;
    answer: string;
}

interface SkillGap {
    skill: string;
    severity: "low" | "medium" | "high";
}

interface PreparationPlan {
    day: number;
    tasks: string[];
    focus: string;
}

interface InterviewReport {
    _id: string;
    title: string;
    matchScore?: number;
    jobDescription: string;
    technicalQuestions: TechnicalQuestion[];
    behavioralQuestions: BehavioralQuestion[];
    skillGaps: SkillGap[];
    preparationPlan: PreparationPlan[];
    createdAt: string;
}

// ─── Section IDs ─────────────────────────────────────────────
type SectionId = "technical" | "behavioral" | "roadmap";

// ─── Glass Card ───────────────────────────────────────────────
function GlassCard({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-lg shadow-black/30 ${className}`}
        >
            {children}
        </div>
    );
}

// ─── Severity Badge ───────────────────────────────────────────
function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" }) {
    const map = {
        low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        high: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    };
    return (
        <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest border ${map[severity]}`}
        >
            {severity}
        </span>
    );
}

// ─── Skeleton Loader ──────────────────────────────────────────
function SkeletonBlock({ className = "" }: { className?: string }) {
    return (
        <div
            className={`animate-pulse rounded-xl bg-white/5 border border-white/5 ${className}`}
        />
    );
}

// ─── Score Ring ───────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
    const radius = 40;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (score / 100) * circ;

    const color =
        score >= 75 ? "#a78bfa" : score >= 50 ? "#fbbf24" : "#f87171";

    return (
        <div className="flex flex-col items-center gap-1">
            <svg width="100" height="100" className="-rotate-90">
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="fill-none stroke-white/5"
                    strokeWidth="8"
                />
                <motion.circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                />
            </svg>
            <span
                className="text-2xl font-black text-white -mt-[68px] mb-[48px]"
                style={{ color }}
            >
                {score}%
            </span>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────
export default function InterviewReportPage() {
    const params = useParams();
    const id = params?.id as string;

    const [report, setReport] = useState<InterviewReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<SectionId>("technical");
    const [activeQuestion, setActiveQuestion] = useState<number>(0);

    // ── Fetch ─────────────────────────────────────────────────
    useEffect(() => {
        if (!id) return;
        const fetch = async () => {
            try {
                const { data } = await axios.get(
                    `http://localhost:5000/api/interview/report/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        withCredentials: true,
                    }
                );
                setReport(data.interviewReport ?? data.data ?? data);
            } catch (err: unknown) {
                setError("Failed to load your interview report. Please try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    // ── Derived ───────────────────────────────────────────────
    const sections: { id: SectionId; label: string; emoji: string }[] = [
        { id: "technical", label: "Technical Questions", emoji: "⚙️" },
        { id: "behavioral", label: "Behavioural Questions", emoji: "🧠" },
        { id: "roadmap", label: "Roadmap", emoji: "🗺️" },
    ];

    const activeQuestions =
        activeSection === "technical"
            ? report?.technicalQuestions ?? []
            : activeSection === "behavioral"
                ? report?.behavioralQuestions ?? []
                : [];

    const activeItem =
        activeSection !== "roadmap"
            ? (activeQuestions as (TechnicalQuestion | BehavioralQuestion)[])[
            activeQuestion
            ]
            : null;

    const roadmapItem =
        activeSection === "roadmap"
            ? (report?.preparationPlan ?? [])[activeQuestion]
            : null;

    // ── Loading skeleton ──────────────────────────────────────
    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-7xl grid grid-cols-[220px_1fr_240px] gap-4 h-[80vh]">
                    <SkeletonBlock className="h-full" />
                    <SkeletonBlock className="h-full" />
                    <SkeletonBlock className="h-full" />
                </div>
            </main>
        );
    }

    // ── Error ─────────────────────────────────────────────────
    if (error || !report) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <GlassCard className="p-10 text-center max-w-md">
                    <div className="text-5xl mb-4">😕</div>
                    <h2 className="text-white text-xl font-bold mb-2">
                        Report Not Found
                    </h2>
                    <p className="text-white/40 text-sm">{error}</p>
                </GlassCard>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col px-4 pt-24 pb-8 relative">
            {/* ── Grid Layout ─────────────────────────────────────── */}
            <motion.div
                className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[230px_1fr_260px] gap-4 h-auto lg:h-[78vh]"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* ══════════════════════════════════════════════════
            LEFT COLUMN — Navigation
        ══════════════════════════════════════════════════ */}
                <GlassCard className="flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b border-white/10">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-purple-300/70 mb-1">
                            Report
                        </p>
                        <h2 className="text-white font-bold text-base leading-tight line-clamp-2">
                            {report.title}
                        </h2>
                        <p className="text-white/30 text-[11px] mt-1">
                            {new Date(report.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </p>
                    </div>

                    {/* Sections */}
                    <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto scrollbar-thin">
                        {sections.map((s) => {
                            const isActive = activeSection === s.id;
                            const count =
                                s.id === "technical"
                                    ? report.technicalQuestions?.length ?? 0
                                    : s.id === "behavioral"
                                        ? report.behavioralQuestions?.length ?? 0
                                        : report.preparationPlan?.length ?? 0;

                            return (
                                <button
                                    key={s.id}
                                    onClick={() => {
                                        setActiveSection(s.id);
                                        setActiveQuestion(0);
                                    }}
                                    className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm font-medium transition-all duration-300 group
                    ${isActive
                                            ? "bg-purple-600/20 border border-purple-500/30 text-white"
                                            : "text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent"
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-glow"
                                            className="absolute inset-0 rounded-xl bg-purple-500/10"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 text-base">{s.emoji}</span>
                                    <span className="relative z-10 leading-tight flex-1">
                                        {s.label}
                                    </span>
                                    <span
                                        className={`relative z-10 text-[10px] px-1.5 py-0.5 rounded-full border font-bold
                      ${isActive
                                                ? "border-purple-500/40 text-purple-300"
                                                : "border-white/10 text-white/30"
                                            }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}

                        {/* Sub-items for active section */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col gap-1 mt-1 overflow-hidden"
                            >
                                {activeSection !== "roadmap"
                                    ? activeQuestions.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveQuestion(idx)}
                                            className={`ml-4 text-left text-xs px-3 py-2 rounded-lg truncate transition-all duration-200
                          ${activeQuestion === idx
                                                    ? "bg-white/10 text-white"
                                                    : "text-white/30 hover:text-white/60 hover:bg-white/5"
                                                }`}
                                        >
                                            <span className="text-purple-400/60 mr-1.5 font-mono">
                                                {String(idx + 1).padStart(2, "0")}
                                            </span>
                                            {(activeQuestions[idx] as TechnicalQuestion).question.slice(0, 40)}…
                                        </button>
                                    ))
                                    : report.preparationPlan.map((plan, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveQuestion(idx)}
                                            className={`ml-4 text-left text-xs px-3 py-2 rounded-lg truncate transition-all duration-200
                          ${activeQuestion === idx
                                                    ? "bg-white/10 text-white"
                                                    : "text-white/30 hover:text-white/60 hover:bg-white/5"
                                                }`}
                                        >
                                            <span className="text-purple-400/60 mr-1.5 font-mono">
                                                Day {plan.day}
                                            </span>
                                            {plan.focus.slice(0, 32)}…
                                        </button>
                                    ))}
                            </motion.div>
                        </AnimatePresence>
                    </nav>
                </GlassCard>

                {/* ══════════════════════════════════════════════════
            MIDDLE COLUMN — Main Content
        ══════════════════════════════════════════════════ */}
                <GlassCard className="flex flex-col overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
                        <span className="text-xl">
                            {sections.find((s) => s.id === activeSection)?.emoji}
                        </span>
                        <h1 className="text-white font-bold text-lg">
                            {sections.find((s) => s.id === activeSection)?.label}
                        </h1>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <AnimatePresence mode="wait">
                            {/* ── Question / Answer view ── */}
                            {activeSection !== "roadmap" && activeItem && (
                                <motion.div
                                    key={`${activeSection}-${activeQuestion}`}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16 }}
                                    transition={{ duration: 0.35 }}
                                    className="flex flex-col gap-5"
                                >
                                    {/* Question */}
                                    <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-5">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-purple-400/60 mb-2">
                                            Question {activeQuestion + 1}
                                        </p>
                                        <p className="text-white text-base font-semibold leading-relaxed">
                                            {(activeItem as TechnicalQuestion).question}
                                        </p>
                                    </div>

                                    {/* Intention */}
                                    <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-5">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400/60 mb-2">
                                            🎯 Why Interviewers Ask This
                                        </p>
                                        <p className="text-white/70 text-sm leading-relaxed">
                                            {(activeItem as TechnicalQuestion).intention}
                                        </p>
                                    </div>

                                    {/* Answer */}
                                    <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400/60 mb-2">
                                            ✅ Ideal Answer
                                        </p>
                                        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                                            {(activeItem as TechnicalQuestion).answer}
                                        </p>
                                    </div>

                                    {/* Prev / Next */}
                                    <div className="flex gap-3 justify-between mt-2">
                                        <button
                                            disabled={activeQuestion === 0}
                                            onClick={() => setActiveQuestion((p) => p - 1)}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-20 transition-all"
                                        >
                                            ← Previous
                                        </button>
                                        <button
                                            disabled={activeQuestion === activeQuestions.length - 1}
                                            onClick={() => setActiveQuestion((p) => p + 1)}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-purple-600/30 border border-purple-500/30 text-purple-200 hover:bg-purple-600/50 disabled:opacity-20 transition-all"
                                        >
                                            Next →
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Roadmap view ── */}
                            {activeSection === "roadmap" && roadmapItem && (
                                <motion.div
                                    key={`roadmap-${activeQuestion}`}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16 }}
                                    transition={{ duration: 0.35 }}
                                    className="flex flex-col gap-5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-2xl font-black text-purple-300">
                                            {roadmapItem.day}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-purple-400/60">
                                                Day {roadmapItem.day}
                                            </p>
                                            <h3 className="text-white font-bold text-base">
                                                {roadmapItem.focus}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col gap-3">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1">
                                            🗒️ Tasks for Today
                                        </p>
                                        {roadmapItem.tasks.map((task, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 group"
                                            >
                                                <div className="w-5 h-5 rounded-full border border-purple-500/40 flex items-center justify-center text-purple-400 text-[10px] font-bold mt-0.5 shrink-0">
                                                    {i + 1}
                                                </div>
                                                <p className="text-white/70 text-sm leading-relaxed group-hover:text-white transition-colors">
                                                    {task}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3 justify-between mt-2">
                                        <button
                                            disabled={activeQuestion === 0}
                                            onClick={() => setActiveQuestion((p) => p - 1)}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-20 transition-all"
                                        >
                                            ← Prev Day
                                        </button>
                                        <button
                                            disabled={
                                                activeQuestion === (report.preparationPlan?.length ?? 0) - 1
                                            }
                                            onClick={() => setActiveQuestion((p) => p + 1)}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-purple-600/30 border border-purple-500/30 text-purple-200 hover:bg-purple-600/50 disabled:opacity-20 transition-all"
                                        >
                                            Next Day →
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </GlassCard>

                {/* ══════════════════════════════════════════════════
            RIGHT COLUMN — Stats Panel
        ══════════════════════════════════════════════════ */}
                <GlassCard className="flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-white/10">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                            Match Score
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 p-5 overflow-y-auto flex-1">
                        {/* Score ring */}
                        <div className="flex flex-col items-center">
                            {report.matchScore !== undefined ? (
                                <ScoreRing score={report.matchScore} />
                            ) : (
                                <p className="text-white/30 text-xs">No score available</p>
                            )}
                            <p className="text-white/40 text-xs text-center mt-1">
                                Resume-to-Job Match
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/10 w-full" />

                        {/* Technical Gaps */}
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">
                                Technical Gaps
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {(report.skillGaps?.length ?? 0) === 0 ? (
                                    <p className="text-white/20 text-xs">No gaps detected 🎉</p>
                                ) : (
                                    report.skillGaps.map((gap, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 group hover:border-white/20 transition-all"
                                        >
                                            <span className="text-white/70 text-xs font-medium">
                                                {gap.skill}
                                            </span>
                                            <SeverityBadge severity={gap.severity} />
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/10 w-full" />

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                {
                                    label: "Technical",
                                    val: report.technicalQuestions?.length ?? 0,
                                    icon: "⚙️",
                                },
                                {
                                    label: "Behavioral",
                                    val: report.behavioralQuestions?.length ?? 0,
                                    icon: "🧠",
                                },
                                {
                                    label: "Days",
                                    val: report.preparationPlan?.length ?? 0,
                                    icon: "📅",
                                },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl py-3 gap-0.5"
                                >
                                    <span className="text-base">{s.icon}</span>
                                    <span className="text-white font-black text-lg leading-none">
                                        {s.val}
                                    </span>
                                    <span className="text-white/30 text-[9px] uppercase tracking-wider">
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </motion.div>
        </main>
    );
}