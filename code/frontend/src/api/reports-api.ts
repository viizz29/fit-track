import api from "./client";

export type CompletionRatePerExercise = {
  exerciseName: string;
  totalScheduled: number;
  totalCompleted: number;
  rate: number;
};

export type CompletionRateReport = {
  overallRate: number;
  currentStreak: number;
  exerciseBreakdown: CompletionRatePerExercise[];
};

export type ExerciseFrequencyReport = {
  exerciseName: string;
  count: number;
};

export type ScheduleAdherenceReport = {
  scheduleTitle: string;
  exerciseName?: string;
  totalOccurrences: number;
  completedOnTime: number;
  adherenceRate: number;
};

export const getCompletionRateReportApi = async (
  startDate: string,
  endDate: string,
): Promise<CompletionRateReport> => {
  const params = new URLSearchParams({ startDate, endDate });
  const response = await api.get(`/api/v1/reports/completion-rate?${params.toString()}`);
  return response.data;
};

export const getExerciseFrequencyReportApi = async (): Promise<ExerciseFrequencyReport[]> => {
  const response = await api.get("/api/v1/reports/exercise-frequency");
  return response.data;
};

export const getScheduleAdherenceReportApi = async (): Promise<ScheduleAdherenceReport[]> => {
  const response = await api.get("/api/v1/reports/schedule-adherence");
  return response.data;
};

export type MissedDay = {
  date: string;
  missedCount: number;
};

export type MissedExercisesReport = {
  totalMissed: number;
  dailyBreakdown: MissedDay[];
};

export const getMissedExercisesReportApi = async (
  startDate: string,
  endDate: string,
): Promise<MissedExercisesReport> => {
  const params = new URLSearchParams({ startDate, endDate });
  const response = await api.get(`/api/v1/reports/missed?${params.toString()}`);
  return response.data;
};
