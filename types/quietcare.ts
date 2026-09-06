export type FlowScreen =
  | "welcome"
  | "prescription-upload"
  | "prescription-loading"
  | "prescription-review"
  | "medicine-upload"
  | "medicine-loading"
  | "medicine-review"
  | "personalise"
  | "routine-loading"
  | "routine-ready"
  | "labels-choice"
  | "labels"
  | "pack"
  | "connect"
  | "waiting"
  | "connected"
  | "home";

export type Medicine = {
  id: string;
  name: string;
  schedule: string;
  timing: string;
  days: number;
  quantity: number;
  uncertain?: boolean;
};

export type QuietcareProgress = {
  screen: FlowScreen;
  timingConfirmed: boolean;
  language: string;
  breakfast: string;
  dinner: string;
};
