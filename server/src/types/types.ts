
import type { Request } from "express";

export type InterviewInput = {
  resume: string;
  selfDescription: string;
  jobDescription: string;
};

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    [key: string]: any;
  };
}
