import GenericModal from "@/components/modals/generic-modal";
import { useState } from "react";
import { SketchPicker } from 'react-color';


type ColorPickerModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (color: string) => void;
  onCancel?: () => void;
};

export default function ColorPickerModal({
  open,
  onClose,
  onSubmit,
  onCancel
}: ColorPickerModalProps) {

  const [color, setColor] = useState('#1976d2');


  return (
    <GenericModal
      open={open}
      onClose={onClose}
      onCancel={onCancel}
      title="Choose a color"
      actions={[
        {label: "Submit", listener: () => onSubmit(color)}
      ]}
    >
      <SketchPicker
        color={color}
        onChange={(updatedColor) => setColor(updatedColor.hex)}
      />
    </GenericModal>
  );
}