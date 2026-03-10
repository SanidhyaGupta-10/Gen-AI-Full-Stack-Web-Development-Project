import { useState, useEffect } from "react";
import axios from "axios";
import { InterviewReport } from "@/types/interview";

export function useInterviewReport(id: string) {
    const [report, setReport] = useState<InterviewReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetch = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
                const cleanBaseUrl = baseUrl?.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
                const { data } = await axios.get(
                    `${cleanBaseUrl}/interview/report/${id}`,
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

    return { report, loading, error };
}

export function useGetAllInterviewReports() {
    const [reports, setReports] = useState<InterviewReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
                const cleanBaseUrl = baseUrl?.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
                const { data } = await axios.get(
                    `${cleanBaseUrl}/interview`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        withCredentials: true,
                    }
                );
                setReports(data.reports ?? data.data ?? data);
            } catch (err: unknown) {
                setError("Failed to load interview reports.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    return { reports, loading, error };
}

export function useGenerateInterviewReport() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateReport = async (formData: FormData) => {
        setLoading(true);
        setError(null);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
            const cleanBaseUrl = baseUrl?.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
            const { data } = await axios.post(
                `${cleanBaseUrl}/interview`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );
            return data.report ?? data.data ?? data;
        } catch (err: unknown) {
            setError("Failed to generate report.");
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { generateReport, loading, error };
}
