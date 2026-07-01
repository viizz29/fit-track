
import GenericModal from "@/components/modals/generic-modal";
import FileUploadForm from "@/pages/home/file-upload-form";
// import { useTranslation } from "react-i18next";


interface NoteEditingModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
}


export default function FileUploadModal({ open, onClose, title }: NoteEditingModalProps) {
  // const { t } = useTranslation();

  return (

    <GenericModal
      open={open}
      onClose={onClose}
      onCancel={onClose}
      title={title}
    >

      <FileUploadForm />
    </GenericModal>

  );
}