import api from "./client";

export type ExerciseSchedule = {
  id: string;
  exerciseTypeId?: string;
  title: string;
  startDatetime: string;
  endTime?: string;
  timezone?: string;
  recurrence?: string;
  recurrenceType?: string;
  weekdays?: string[];
  completed?: boolean;
  "exerciseType.id": string;
  "exerciseType.name": string;
  "exerciseType.description": string;
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
  weekdays?: string[];
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
    weekdays?: string[];
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
): Promise<ExerciseSchedule[]> => {
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

export const getSchedulesOfWeek = async (
  startDate: string,
): Promise<{
  weekStart: string;
  weekEnd: string;
  days: {
    date: string; // "2026-06-29"
    dayOfWeek: string; // "MON",
    exercises: ExerciseSchedule[];
  }[];
}> => {
  const response = await api.get(`/api/v1/schedules/week`, {
    params: { date: startDate },
  });
  return response.data;
};
