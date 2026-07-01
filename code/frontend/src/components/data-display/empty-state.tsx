import { Alert, type AlertColor } from "@mui/material";

type EmptyStateProps = {
  message: string;
  severity?: AlertColor;
};

export default function EmptyState({ message, severity = "info" }: EmptyStateProps) {
  return <Alert severity={severity}>{message}</Alert>;
}
