import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";

type ConfirmDeleteDialogProps = {
  open: boolean;
  title: string;
  message?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDeleteDialog({
  open, title, message, isPending, onConfirm, onCancel,
}: ConfirmDeleteDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {message || t("areYouSure")}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isPending}>{t("cancel")}</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={isPending}>
          {isPending ? t("deleting") : t("delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
