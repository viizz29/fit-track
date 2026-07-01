import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setNavigate } from "@/utils/navigate";

export default function NavigateSetter() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return null;
}
