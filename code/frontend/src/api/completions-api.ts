import api from "./client";

export type CompletionRecord = {
  id: string;
  scheduleId: string;
  scheduleTitle?: string;
  completionDatetime: string;
  createdAt?: string;
  "schedule.exerciseType.name": string;
  "schedule.recurrenceType": string;
};

export const deleteCompletionApi = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/completions/${id}`);
};

export const getCompletionsApi = async (filters?: {
  dateFrom?: string;
  dateTo?: string;
  scheduleId?: string;
}): Promise<CompletionRecord[]> => {
  const params = new URLSearchParams();
  if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters?.dateTo) params.set("dateTo", filters.dateTo);
  if (filters?.scheduleId) params.set("scheduleId", filters.scheduleId);
  const qs = params.toString();
  const response = await api.get(`/api/v1/completions${qs ? `?${qs}` : ""}`);
  return response.data;
};
