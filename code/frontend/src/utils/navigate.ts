import type { NavigateFunction } from "react-router-dom";

let navigateFn: NavigateFunction | null = null;

export function setNavigate(fn: NavigateFunction) {
  navigateFn = fn;
}

export function navigate(path: string) {
  if (navigateFn) {
    navigateFn(path);
  } else {
    window.location.href = path;
  }
}

export function clearAuthAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/login");
}
