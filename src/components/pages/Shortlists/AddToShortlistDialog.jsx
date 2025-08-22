import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { shortlistService } from "../../../services/shortlistService";

const AddToShortlistDialog = ({
  open,
  onClose,
  candidateId,
  candidateName,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [shortlists, setShortlists] = useState([]);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("existing"); // 'existing' or 'new'

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      shortlist_id: "",
      new_name: "",
      new_description: "",
      notes: "",
    },
  });

  const watchedShortlistId = watch("shortlist_id");

  useEffect(() => {
    if (open) {
      loadShortlists();
      reset();
      setMode("existing");
      setError("");
    }
  }, [open]);

  const loadShortlists = async () => {
    try {
      const data = await shortlistService.getForDropdown();
      setShortlists(data);

      // If no shortlists exist, default to new mode
      if (data.length === 0) {
        setMode("new");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");

      let shortlistId;

      if (mode === "new") {
        // Create new shortlist first
        const newShortlist = await shortlistService.create({
          name: data.new_name,
          description: data.new_description,
        });
        shortlistId = newShortlist.id;
      } else {
        shortlistId = data.shortlist_id;
      }

      // Add candidate to shortlist
      await shortlistService.addCandidates(
        shortlistId,
        [candidateId],
        data.notes
      );

      if (onSuccess) {
        const message =
          mode === "new"
            ? `Created shortlist "${data.new_name}" and added ${candidateName}`
            : `Added ${candidateName} to shortlist`;
        onSuccess(message);
      }

      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setMode("existing");
    setError("");
    onClose();
  };

  const handleModeChange = (event) => {
    setMode(event.target.value);
    setError("");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add to Shortlist</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add <strong>{candidateName}</strong> to a shortlist for quick access
          and bulk actions.
        </Typography>

        <Box component="form" sx={{ mt: 1 }}>
          {/* Mode Selection */}
          {shortlists.length > 0 && (
            <>
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <RadioGroup value={mode} onChange={handleModeChange} row>
                  <FormControlLabel
                    value="existing"
                    control={<Radio />}
                    label="Add to existing shortlist"
                  />
                  <FormControlLabel
                    value="new"
                    control={<Radio />}
                    label="Create new shortlist"
                  />
                </RadioGroup>
              </FormControl>
              <Divider sx={{ mb: 3 }} />
            </>
          )}

          {/* Existing Shortlist Selection */}
          {mode === "existing" && shortlists.length > 0 && (
            <Controller
              name="shortlist_id"
              control={control}
              rules={{ required: "Please select a shortlist" }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  margin="normal"
                  error={!!errors.shortlist_id}
                >
                  <InputLabel>Select Shortlist</InputLabel>
                  <Select {...field} label="Select Shortlist">
                    {shortlists.map((shortlist) => (
                      <MenuItem key={shortlist.id} value={shortlist.id}>
                        {shortlist.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          )}

          {/* New Shortlist Creation */}
          {mode === "new" && (
            <>
              <Controller
                name="new_name"
                control={control}
                rules={{
                  required: "Shortlist name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Shortlist Name"
                    margin="normal"
                    error={!!errors.new_name}
                    helperText={errors.new_name?.message}
                    placeholder="e.g., Senior Frontend Developers"
                  />
                )}
              />

              <Controller
                name="new_description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Description (Optional)"
                    margin="normal"
                    multiline
                    rows={2}
                    placeholder="Brief description of this shortlist..."
                  />
                )}
              />
            </>
          )}

          {/* Notes */}
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Notes about this candidate (Optional)"
                margin="normal"
                multiline
                rows={3}
                placeholder="Add specific notes about why this candidate was added to the shortlist..."
              />
            )}
          />

          {/* No Shortlists Message */}
          {shortlists.length === 0 && mode === "existing" && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No shortlists found. Create your first shortlist below.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading || (mode === "existing" && shortlists.length === 0)}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading
            ? "Adding..."
            : mode === "new"
            ? "Create & Add"
            : "Add to Shortlist"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToShortlistDialog;
