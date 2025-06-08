import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Typography
} from '@mui/material';

const PrimaryDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  fileName,
  loading = false 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Set Primary Resume</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Would you like to make <strong>{fileName}</strong> the primary resume 
          for this candidate?
        </DialogContentText>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          The primary resume will be displayed in the candidate profile preview.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          disabled={loading}
        >
          Keep Current Primary
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Setting...' : 'Make Primary'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrimaryDialog;