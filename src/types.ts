export interface Message {
  role: "user" | "bot";
  content: string;
}

export interface Formula {
  n: string; // name / label
  e: string; // expression (evaluatable math formula)
}

export interface HistoryItem {
  e: string; // mathematical/printable expression
  r: string | number; // evaluated result
  t?: string; // timestamp
}

export type CalcMode = "standard" | "scientific" | "account";

export type ActivePanel = "main" | "trig" | "log" | "stats" | "formulas";
