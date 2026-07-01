export const APP_NAME = import.meta.env.VITE_APP_NAME
  ? import.meta.env.VITE_APP_NAME
  : "App Name";
export const MOCK_API_ON = import.meta.env.VITE_MOCK_API_ON == "true";
export const BACKEND_SERVER = import.meta.env.VITE_BACKEND_SERVER
  ? import.meta.env.VITE_BACKEND_SERVER
  : "http://localhost:30000";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL
  : "";
export const SOCKETIO_ENABLED = import.meta.env.VITE_SOCKETIO_ENABLED == "true";
export const SOCKETIO_ENDPOINT = import.meta.env.VITE_SOCKETIO_ENDPOINT
  ? import.meta.env.VITE_SOCKETIO_ENDPOINT
  : "/wssss";
