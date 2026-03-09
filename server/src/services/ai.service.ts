import OpenAI from "openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import puppeteer from "puppeteer-core";
import { InterviewReportSchema, type InterviewReport } from "../zod/InterviewReport.schema";
import type { InterviewInput } from "../types/types";


// ─── Groq client via OpenAI-compatible SDK ────────────────────────────────────
const ai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ─── Puppeteer — point at the user's local Chrome ────────────────────────────
const CHROME_PATH =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";


// ─── Generate Interview Report ────────────────────────────────────────────────
/**
 * Calls Groq with a structured JSON schema derived from the Zod schema
 * so the model always returns a perfectly typed report.
 */
export async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}: InterviewInput): Promise<InterviewReport> {

  const prompt = `Generate a detailed technical interview report for a candidate with the following details.
  
Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

EXTREMELY IMPORTANT INSTRUCTIONS:
You are a senior technical interviewer. Analyze the candidate's profile against the job description.
You MUST output ONLY valid JSON. Your JSON MUST contain EXACTLY the following structure, with no extra properties:

{
  "matchScore": <number between 0 and 100 representing the match percentage>,
  "title": "<title of the job>",
  "technicalQuestions": [
    {
      "question": "<the question>",
      "intention": "<why ask this question>",
      "answer": "<how to answer it>"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "<the question>",
      "intention": "<why ask this question>",
      "answer": "<how to answer it>"
    }
  ],
  "skillGaps": [
    {
      "skill": "<missing skill name>",
      "severity": "<low|medium|high>"
    }
  ],
  "preparationPlan": [
    {
      "day": <number starting from 1>,
      "focus": "<daily focus topic>",
      "tasks": ["<task 1>", "<task 2>"]
    }
  ]
}`;

  const completion = await ai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are a senior technical interviewer. You MUST return ONLY valid JSON matching the exact schema requested without any markdown formatting.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message.content;
  if (!raw) throw new Error("Groq returned an empty response");

  console.log("[AI] raw response:", raw);

  const parsed = JSON.parse(raw);
  return InterviewReportSchema.parse(parsed);
}


// ─── Generate Resume PDF ──────────────────────────────────────────────────────
const ResumePdfSchema = z.object({
  html: z
    .string()
    .describe(
      "Full, self-contained HTML string for the resume. Must include inline CSS. No external links."
    ),
});

/**
 * Asks Groq to generate a polished ATS-friendly resume as HTML,
 * then converts it to a PDF buffer via Puppeteer.
 */
export async function generateResumePdf({
  resume,
  selfDescription,
  jobDescription,
}: InterviewInput): Promise<Buffer> {

  const prompt = `Generate a resume for a candidate with the following details:

Resume:
${resume}

Self Description:
${selfDescription}

Target Job Description:
${jobDescription}

Requirements:
- Return a JSON object with a single field "html" containing the full HTML of the resume.
- Include all CSS inline inside a <style> tag in the <head>.
- The design should be clean, professional, and ATS-friendly.
- Limit to 1–2 pages when converted to A4 PDF.
- Use tasteful accent colours for headings only. Body text should be black on white.
- Do NOT sound AI-generated — write naturally as a human resume writer.
- Focus on quality over quantity.`;

  const completion = await ai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are a professional resume writer. Return only valid JSON with the key 'html' containing the resume HTML.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message.content;
  if (!raw) throw new Error("Groq returned an empty response for resume PDF");

  const { html } = ResumePdfSchema.parse(JSON.parse(raw));

  // ── Render HTML → PDF buffer via Puppeteer-core ──────────────────────────
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
      printBackground: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}