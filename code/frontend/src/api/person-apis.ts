import api from "./client";

export interface Person {  
  id: string;
  name: string;
}


export const getPersons = async (): Promise<Person[]> => {
  const res = await api.get("/v1/persons");
  return res.data;
};



export const getPersonFace = async (personId: string): Promise<Blob> => {
  const res = await api.get(`/v1/persons/${personId}/face`, {
    responseType: "blob",
  });
  return res.data;
}

export const updatePersonName = async (id: string, name: string) => {
  const res = await api.patch(`/v1/persons/${id}/name`, { name });
  return res.data;
};
