"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { SectionId, TechnicalQuestion, BehavioralQuestion } from "@/types/interview";
import { useInterviewReport } from "@/hooks/useInterviewReport";
import { Download } from "lucide-react";

import GlassCard from "@/components/interview-report/GlassCard";
import SkeletonBlock from "@/components/interview-report/SkeletonBlock";
import LeftSidebar from "@/components/interview-report/LeftSidebar";
import QuestionViewer from "@/components/interview-report/QuestionViewer";
import RoadmapViewer from "@/components/interview-report/RoadmapViewer";
import StatsPanel from "@/components/interview-report/StatsPanel";

export default function InterviewReportPage() {
    const params = useParams();
    const id = params?.id as string;

    const { report, loading, error } = useInterviewReport(id);

    const [activeSection, setActiveSection] = useState<SectionId>("technical");
    const [activeQuestion, setActiveQuestion] = useState<number>(0);

    const sections: { id: SectionId; label: string; emoji: string }[] = [
        { id: "technical", label: "Technical Questions", emoji: "⚙️" },
        { id: "behavioral", label: "Behavioural Questions", emoji: "🧠" },
        { id: "roadmap", label: "Roadmap", emoji: "🗺️" },
    ];

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPdf = async () => {
        try {
            setIsDownloading(true);
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
            const cleanBaseUrl = baseUrl?.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
            
            const response = await fetch(`${cleanBaseUrl}/interview/resume/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || 'Failed to generate PDF');
                } catch (e) {
                    throw new Error('Failed to generate PDF (Server Error)');
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `resume-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error("Error downloading PDF:", error);
            // Try to extract backend error message
            let errorMessage = "Failed to download PDF. Please try again.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            alert(errorMessage);
        } finally {
            setIsDownloading(false);
        }
    };

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

    const activeQuestions =
        activeSection === "technical"
            ? report.technicalQuestions ?? []
            : activeSection === "behavioral"
                ? report.behavioralQuestions ?? []
                : [];

    const activeItem =
        activeSection !== "roadmap"
            ? (activeQuestions as (TechnicalQuestion | BehavioralQuestion)[])[activeQuestion]
            : null;

    const roadmapItem =
        activeSection === "roadmap"
            ? (report.preparationPlan ?? [])[activeQuestion]
            : null;

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
                <LeftSidebar
                    report={report}
                    sections={sections}
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    activeQuestion={activeQuestion}
                    setActiveQuestion={setActiveQuestion}
                />

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
                                <QuestionViewer
                                    key={`${activeSection}-${activeQuestion}`}
                                    activeQuestion={activeQuestion}
                                    setActiveQuestion={setActiveQuestion}
                                    activeItem={activeItem}
                                    totalQuestions={activeQuestions.length}
                                />
                            )}

                            {/* ── Roadmap view ── */}
                            {activeSection === "roadmap" && roadmapItem && (
                                <RoadmapViewer
                                    key={`roadmap-${activeQuestion}`}
                                    activeQuestion={activeQuestion}
                                    setActiveQuestion={setActiveQuestion}
                                    roadmapItem={roadmapItem}
                                    totalDays={report.preparationPlan?.length ?? 0}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </GlassCard>

                {/* ══════════════════════════════════════════════════
            RIGHT COLUMN — Stats Panel
        ══════════════════════════════════════════════════ */}
                <StatsPanel report={report} />
            </motion.div>

            {/* ── Download PDF Button (Floats when ready) ── */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 20 }}
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className={`fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3 rounded-full shadow-lg shadow-blue-500/25 border border-white/10 backdrop-blur-md transition-all sm:bottom-10 sm:right-10 print:hidden font-medium ${isDownloading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                {isDownloading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <Download size={20} />
                )}
                <span>{isDownloading ? "Generating..." : "Download Resume"}</span>
            </motion.button>
        </main>
    );
}

