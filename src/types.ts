export interface VisitInfo {
  visitorRole: string;
  teacherName: string;
  visitDate: string;
  visitDay: string;
  subject: string;
  period: string;
  grade: string;
  section: string;
  lessonTitle: string;
}

export interface RatingOption {
  value: number;
  text: string;
  hint?: string;
}

export interface Indicator {
  id: number;
  domain: string;
  standard: string;
  text: string;
  options: RatingOption[];
  goodEvidence: string;
  improvementEvidence: string;
  recommendation: string;
  support: string;
  hint?: string;
}

export interface EvaluationState {
  [key: number]: number;
}
