import GenericModal from "@/components/modals/generic-modal";
import { Alert } from '@mui/material';

type AlertType = 'success' | 'error' | 'warning' | 'info';

type AlertModalProps = {
  open: boolean;
  title?: string;
  message: string;
  type?: AlertType;
  onClose: () => void;
};

export default function AlertModal({
  open,
  title = 'Alert',
  message,
  type = 'info',
  onClose,
}: AlertModalProps) {
  return (
    <GenericModal
      open={open}
      title={title}
      onClose={onClose}
      onCancel={onClose}
      actions={[{ label: "OK", listener: onClose }]}
    >
      <Alert severity={type}>{message}</Alert>
    </GenericModal>
  );
}