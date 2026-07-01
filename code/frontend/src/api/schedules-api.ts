import api from "./client";
import type { Exercise } from "./exercises-api";

export type ExerciseSchedule = {
  id: string;
  exerciseTypeId?: string;
  title: string;
  startDatetime: string;
  endTime?: string;
  timezone?: string;
  recurrence?: string;
  recurrenceType?: string;
  recurrenceInterval?: number;
  completed?: boolean;
  exerciseType: Exercise;
};

export const getSchedulesApi = async (): Promise<ExerciseSchedule[]> => {
  const response = await api.get("/api/v1/schedules");
  return response.data;
};

export const getScheduleApi = async (id: string): Promise<ExerciseSchedule> => {
  const response = await api.get(`/api/v1/schedules/${id}`);
  return response.data;
};

export const createScheduleApi = async (data: {
  exerciseTypeId?: string;
  startDatetime: string;
  endTime?: string;
  timezone?: string;
  recurrenceType?: string;
  recurrenceInterval?: number;
}): Promise<ExerciseSchedule> => {
  const response = await api.post("/api/v1/schedules", data);
  return response.data;
};

export const updateScheduleApi = async (
  id: string,
  data: {
    exerciseTypeId?: string;
    startDatetime: string;
    endTime?: string;
    timezone?: string;
    recurrenceType?: string;
    recurrenceInterval?: number;
  },
): Promise<ExerciseSchedule> => {
  const response = await api.put(`/api/v1/schedules/${id}`, data);
  return response.data;
};

export const deleteScheduleApi = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/schedules/${id}`);
};

export const getSchedulesByDateApi = async (
  date: string,
): Promise<{
  HOURLY: ExerciseSchedule[];
  DAILY: ExerciseSchedule[];
  WEEKLY: ExerciseSchedule[];
}> => {
  const response = await api.get(`/api/v1/schedules/date`, {
    params: { date },
  });
  return response.data;
};

export const completeExerciseApi = async (
  scheduleId: string,
  completionDatetime?: string,
) => {
  const response = await api.post("/api/v1/completions", {
    scheduleId,
    completionDatetime: completionDatetime || new Date().toISOString(),
  });
  return response.data;
};
