import { z } from "zod";

export const InterviewReportSchema = z.object({

  matchScore: z
    .number()
    .describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),

  title: z
    .string()
    .describe("The title of the job for which the interview report is generated"),

  technicalQuestions: z.array(
    z.object({
      question: z.string().describe("The technical question that can be asked in the interview"),
      intention: z.string().describe("The intention of the interviewer behind asking this question"),
      answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc."),
    })
  ).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),

  behavioralQuestions: z.array(
    z.object({
      question: z.string().describe("The behavioral question that can be asked in the interview"),
      intention: z.string().describe("The intention of the interviewer behind asking this question"),
      answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc."),
    })
  ).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),

  skillGaps: z.array(
    z.object({
      skill: z.string().describe("The skill which the candidate is lacking"),
      severity: z
        .enum(["low", "medium", "high"])
        .describe("Severity of this skill gap — how important this skill is for the job"),
    })
  ).describe("List of skill gaps in the candidate's profile along with their severity"),

  preparationPlan: z.array(
    z.object({
      day: z.number().describe("The day number in the preparation plan, starting from 1"),
      focus: z.string().describe("The main focus area of this day, e.g. data structures, system design, mock interviews"),
      tasks: z.array(z.string()).describe("List of tasks to be done on this day"),
    })
  ).describe("A day-wise preparation plan for the candidate to follow to prepare for the interview effectively"),

});

export type InterviewReport = z.infer<typeof InterviewReportSchema>;