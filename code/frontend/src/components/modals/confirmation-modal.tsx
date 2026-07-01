import GenericModal from "@/components/modals/generic-modal";

type ConfirmModalProps = {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({ open, message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <GenericModal
      open={open}
      title="Confirm"
      onClose={onCancel}
      onCancel={onCancel}
      actions={[{ label: "Yes", listener: onConfirm }]}
    >
      {message}
    </GenericModal>
  );
}