import OpenAI from "openai";
import {
  InterviewReportSchema,
  type InterviewReport,
} from "../zod/InterviewReport.schema";
import type { InterviewInput } from "../types/types";


const ai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription
}: InterviewInput): Promise<InterviewReport> {

  const prompt = `
You are a senior technical interviewer.

Analyze the candidate and generate a structured interview report based on their resume, self-description, and the job description.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Return only valid JSON in the following format:
{
  "technicalQuestions": [
    { "question": "string", "intention": "string", "answer": "string" }
  ],
  "behavioralQuestions": [
    { "question": "string", "intention": "string", "answer": "string" }
  ],
  "skillGaps": [
    { "skill": "string", "severity": "low" | "medium" | "high" }
  ],
  "preparationPlan": [
    { "day": number, "tasks": ["string"], "focus": "string" }
  ]
}
`;

  const completion = await ai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are a technical interviewer who returns structured JSON reports." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  const raw = completion.choices[0]?.message.content;

  if (!raw) {
    throw new Error("AI returned empty response");
  }

  console.log(raw)

  const parsed = JSON.parse(raw);

  return InterviewReportSchema.parse(parsed);
}