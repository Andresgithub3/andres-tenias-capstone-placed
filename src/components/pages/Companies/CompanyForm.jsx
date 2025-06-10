import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import { companyService } from "../../../services/companyServices";

const COMPANY_SIZES = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Government",
  "Non-profit",
  "Construction",
  "Transportation",
  "Energy",
  "Media",
  "Real Estate",
  "Professional Services",
  "Other",
];

const CompanyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      industry: "",
      size: "",
      website: "",
      linkedin_url: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isEdit) {
      loadCompany();
    }
  }, [id, isEdit]);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const company = await companyService.getById(id);
      reset(company);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitLoading(true);
      setError("");

      // Clean up URLs - add protocol if missing
      if (data.website && !data.website.startsWith("http")) {
        data.website = "https://" + data.website;
      }
      if (data.linkedin_url && !data.linkedin_url.startsWith("http")) {
        data.linkedin_url = "https://" + data.linkedin_url;
      }

      if (isEdit) {
        await companyService.update(id, data);
      } else {
        await companyService.create(data);
      }

      navigate("/companies");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/companies");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        {isEdit ? "Edit Company" : "Add New Company"}
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Company Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Company name is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Company Name"
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            {/* Industry */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="industry"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Industry"
                    fullWidth
                    error={!!errors.industry}
                    helperText={errors.industry?.message}
                  >
                    <MenuItem value="">
                      <em>Select Industry</em>
                    </MenuItem>
                    {INDUSTRIES.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Company Size */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="size"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Company Size"
                    fullWidth
                    error={!!errors.size}
                    helperText={errors.size?.message}
                  >
                    <MenuItem value="">
                      <em>Select Size</em>
                    </MenuItem>
                    {COMPANY_SIZES.map((size) => (
                      <MenuItem key={size.value} value={size.value}>
                        {size.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Website */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="website"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Website"
                    fullWidth
                    placeholder="www.company.com"
                    error={!!errors.website}
                    helperText={errors.website?.message}
                  />
                )}
              />
            </Grid>

            {/* LinkedIn URL */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="linkedin_url"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="LinkedIn URL"
                    fullWidth
                    placeholder="linkedin.com/company/company-name"
                    error={!!errors.linkedin_url}
                    helperText={errors.linkedin_url?.message}
                  />
                )}
              />
            </Grid>

            {/* Address */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Street Address"
                    fullWidth
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Grid>

            {/* City */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                    error={!!errors.city}
                    helperText={errors.city?.message}
                  />
                )}
              />
            </Grid>

            {/* State */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="State/Province"
                    fullWidth
                    error={!!errors.state}
                    helperText={errors.state?.message}
                  />
                )}
              />
            </Grid>

            {/* Postal Code */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="postal_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Postal Code"
                    fullWidth
                    error={!!errors.postal_code}
                    helperText={errors.postal_code?.message}
                  />
                )}
              />
            </Grid>

            {/* Country */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Country"
                    fullWidth
                    error={!!errors.country}
                    helperText={errors.country?.message}
                  />
                )}
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Company Description"
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Brief description of the company, their business, and what makes them unique..."
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Form Actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 4,
              pt: 3,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={submitLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitLoading}
              sx={{ minWidth: 120 }}
            >
              {submitLoading ? (
                <CircularProgress size={20} />
              ) : isEdit ? (
                "Update Company"
              ) : (
                "Create Company"
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CompanyForm;
