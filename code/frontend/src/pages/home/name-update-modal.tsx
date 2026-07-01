import type { Person } from "@/api/person-apis";
import DynamicForm from "@/components/forms/dynamic-form";
import GenericModal from "@/components/modals/generic-modal";
// import { useTranslation } from "react-i18next";
import * as Yup from 'yup';


interface PersonNameUpdateModalProps {
  person: Person | null;
  onSubmit: (person: Person, name: string) => void;
  onClose: () => void;
  title: string;
}


export default function PersonNameUpdateModal({ person, onClose, title, onSubmit }: PersonNameUpdateModalProps) {
  // const { t } = useTranslation();

  const fields = ['pname',];

  const validations = {
    pname: Yup.string().required('Name is required'),
  };

  return (

    <GenericModal
      open={person !== null}
      onClose={onClose}
      onCancel={onClose}
      title={title}
    >

      {person &&
        <DynamicForm
          fields={fields}
          initialValues={{ pname: person?.name }}
          validationSchema={validations}
          onSubmit={(values) => onSubmit(person, values.pname)}
        />}
    </GenericModal>

  );
}