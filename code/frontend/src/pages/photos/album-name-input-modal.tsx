import DynamicForm from "@/components/forms/dynamic-form";
import GenericModal from "@/components/modals/generic-modal";
// import { useTranslation } from "react-i18next";
import * as Yup from 'yup';


interface AlbumTitleInputModalProps {
  open: boolean;
  onSubmit: (name: string) => void;
  onClose: () => void;
}


export default function AlbumTitleInputModal({ open, onClose, onSubmit }: AlbumTitleInputModalProps) {
  // const { t } = useTranslation();

  const fields = ['title',];

  const validations = {
    title: Yup.string().required('Title is required'),
  };

  return (

    <GenericModal
      open={open}
      onClose={onClose}
      onCancel={onClose}
      title={"Album Title"}
    >

      <DynamicForm
        fields={fields}

        validationSchema={validations}
        onSubmit={(values) => onSubmit(values.title)}
      />

    </GenericModal>

  );
}