import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { shortlistService } from "../../../services/shortlistService";

const ShortlistForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isEdit) {
      loadShortlist();
    }
  }, [id, isEdit]);

  const loadShortlist = async () => {
    try {
      setInitialLoading(true);
      const shortlist = await shortlistService.getById(id);
      reset({
        name: shortlist.name,
        description: shortlist.description || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");

      if (isEdit) {
        await shortlistService.update(id, data);
      } else {
        await shortlistService.create(data);
      }

      navigate("/shortlists");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/shortlists");
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/shortlists");
          }}
        >
          Shortlists
        </Link>
        <Typography color="text.primary">
          {isEdit ? "Edit Shortlist" : "Create Shortlist"}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/shortlists")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEdit ? "Edit Shortlist" : "Create New Shortlist"}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Paper sx={{ p: 4, maxWidth: 600 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: "Shortlist name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
              maxLength: {
                value: 100,
                message: "Name must be less than 100 characters",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Shortlist Name"
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
                placeholder="e.g., Top Backend Developers, Q1 Priority Candidates"
                disabled={loading}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            rules={{
              maxLength: {
                value: 500,
                message: "Description must be less than 500 characters",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Description (Optional)"
                margin="normal"
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors.description?.message}
                placeholder="Describe the purpose of this shortlist, criteria for candidates, or any other relevant notes..."
                disabled={loading}
              />
            )}
          />

          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={
                loading ? <CircularProgress size={20} /> : <SaveIcon />
              }
              disabled={loading}
            >
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                ? "Update Shortlist"
                : "Create Shortlist"}
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Additional Info */}
      {!isEdit && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>What's next?</strong> After creating your shortlist, you can
            add candidates from:
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              The candidate list page (bulk selection)
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Individual candidate detail pages
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Search results (coming soon)
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ShortlistForm;
