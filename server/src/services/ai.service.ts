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
  console.log("[AI] Starting Resume PDF generation...");

  const prompt = `
    You are an expert resume writer specialized in creating ATS-friendly, professional resumes.
    Generate a high-quality, professional resume for a candidate based on the following:
    
    ORIGINAL RESUME DATA:
    ${resume}
    
    CANDIDATE SELF-DESCRIPTION:
    ${selfDescription}
    
    TARGET JOB DESCRIPTION:
    ${jobDescription}

    INSTRUCTIONS:
    1.  Tailor the resume specifically for the target job description.
    2.  Use a professional, clean, and modern layout.
    3.  Highlight relevant impact, achievements, and technical skills.
    4.  The output MUST be a JSON object with a single field "html".
    5.  The "html" field must contain a complete, self-contained HTML5 document.
    6.  Use inline <style> tags for ALL CSS. No external CSS or fonts allowed.
    7.  Use professional colors (e.g., #2c3e50 for headers, #7f8c8d for subtexts).
    8.  Structure: Header (Contact Info), Summary/Objective, Skills, Experience, Projects, Education.
    9.  Make it look like a premium, human-written resume.
    10. Ensure it's ATS-friendly (use standard heading structures).
    11. Avoid AI-sounding clichés; use powerful action verbs.

    HTML/CSS REQUIREMENTS:
    - Use 'Inter', 'Arial', or 'sans-serif' as the font family.
    - Maintain generous white space (margin/padding) for readability.
    - Maximize clarity and visual hierarchy.
    - The HTML will be rendered via Puppeteer on A4 paper.

    FORMAT:
    {
      "html": "<!DOCTYPE html><html><head><style>...</style></head><body>...</body></html>"
    }
  `;

  try {
    const completion = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer. You return ONLY valid JSON with a single 'html' key containing a complete, stylized HTML resume."
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message.content;
    if (!raw) {
      console.error("[AI] Groq returned empty content for resume PDF");
      throw new Error("Groq returned an empty response for resume PDF");
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("[AI] Failed to parse JSON from Groq:", raw);
      throw new Error("Invalid JSON format from AI model");
    }

    const { html } = ResumePdfSchema.parse(parsed);
    console.log("[AI] HTML generated successfully. Length:", html.length);

    // ── Render HTML → PDF buffer via Puppeteer-core ──────────────────────────
    console.log("[Puppeteer] Launching browser at:", CHROME_PATH);
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    try {
      const page = await browser.newPage();
      console.log("[Puppeteer] Setting content...");
      await page.setContent(html, { 
        waitUntil: "networkidle0",
        timeout: 30000 
      });

      console.log("[Puppeteer] Generating PDF...");
      const pdfBuffer = await page.pdf({
        format: "A4",
        margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" },
        printBackground: true,
        displayHeaderFooter: false,
      });

      console.log("[AI] PDF generated successfully. Buffer size:", pdfBuffer.length);
      return Buffer.from(pdfBuffer);
    } catch (renderError: any) {
      console.error("[Puppeteer] Error during rendering:", renderError);
      throw new Error(`Failed to render PDF: ${renderError.message}`);
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    console.error("[AI] Error in generateResumePdf:", error);
    throw error;
  }
}