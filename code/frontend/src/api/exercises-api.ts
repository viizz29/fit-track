import api from "./client";

export type Exercise = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const getExercisesApi = async (): Promise<Exercise[]> => {
  const response = await api.get("/api/v1/exercises");
  return response.data;
};

export const createExerciseApi = async (data: { name: string; description?: string }): Promise<Exercise> => {
  const response = await api.post("/api/v1/exercises", data);
  return response.data;
};

export const getExerciseApi = async (id: string): Promise<Exercise> => {
  const response = await api.get(`/api/v1/exercises/${id}`);
  return response.data;
};

export const updateExerciseApi = async (id: string, data: { name: string; description?: string }): Promise<Exercise> => {
  const response = await api.put(`/api/v1/exercises/${id}`, data);
  return response.data;
};

export const deleteExerciseApi = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/exercises/${id}`);
};
