import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,

} from '@mui/material';
import type React from 'react';


type GenericModalProps = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  actions?: { label: string, listener: () => void }[]
  onClose: () => void;
  onCancel?: () => void;
};

export default function GenericModal({
  children,
  title,
  actions,
  onClose,
  open,
  onCancel
}: GenericModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        {children}
      </DialogContent>


      <DialogActions>
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        {actions && actions.map((item) =>
          <Button onClick={item.listener} variant="contained">
            {item.label}
          </Button>
        )}

      </DialogActions>
    </Dialog>
  );
}