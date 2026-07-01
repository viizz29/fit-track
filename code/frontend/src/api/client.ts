import { API_BASE_URL, BACKEND_SERVER, MOCK_API_ON } from "@/config";
import axios from "axios";
import { clearAuthAndRedirect } from "@/utils/navigate";

const api = axios.create({
    baseURL: MOCK_API_ON ? API_BASE_URL : `${BACKEND_SERVER}${API_BASE_URL}`,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const raw = localStorage.getItem("token");
    if (!raw) return config;
    const token = raw.startsWith('"') ? JSON.parse(raw) : raw;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            clearAuthAndRedirect();
        }
        return Promise.reject(err);
    }
);

export default api;
